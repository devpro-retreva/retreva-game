"""
Fit a generated GLB (e.g. from Meshy) to Retreva's budget-Android limits and report whether it passes.

  /opt/blender-py/bin/python tools/blender/optimize_glb.py --in master.glb --out public/models/danfo.glb \
      --tris 3000 --texture 1024 --max-kb 300 --length 5

What it does, in order:
  1. imports the GLB, joins every mesh into one object (one draw call in the game) and welds seams
  2. decimates to --tris triangles if it has more, then re-shades smooth by angle (30°)
  3. keeps only the base-colour texture (the game shades with cheap Lambert lighting, so normal /
     metal-roughness / emissive maps would only add download size), and scales it down to --texture px
  4. puts the origin at the bottom centre and scales the longest horizontal side to --length metres
     (optional --yaw turns it first, so the front can be pointed down +Z as the game expects)
  5. exports a plain GLB (no Draco/meshopt — no extra decoder in the game) with JPEG textures
  6. prints a JSON report (triangles, materials, textures, bytes, pass/fail per limit); exit 1 if over budget
"""

import argparse
import json
import math
import os
import struct
import sys

import bpy
import bmesh  # only importable after bpy
from mathutils import Matrix


def triangles(obj) -> int:
    return sum(len(p.vertices) - 2 for p in obj.data.polygons)


def import_glb(path: str):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=path)
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    if not meshes:
        raise SystemExit(f'{path}: no meshes')
    world = {o.name: o.matrix_world.copy() for o in meshes}
    for o in meshes:  # unparent but keep where each part sits in the world
        o.parent = None
        o.matrix_world = world[o.name]
    for o in [o for o in bpy.context.scene.objects if o.type != 'MESH']:
        bpy.data.objects.remove(o, do_unlink=True)
    bpy.ops.object.select_all(action='DESELECT')
    for o in meshes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    if len(meshes) > 1:
        bpy.ops.object.join()
    obj = bpy.context.view_layer.objects.active
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    return obj


def weld(obj):
    """glTF stores a mesh split at every UV/normal seam; weld it back so decimating doesn't tear it into strips."""
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bm.to_mesh(obj.data)
    bm.free()


def open_edges(obj) -> int:
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    n = sum(1 for e in bm.edges if e.is_boundary)
    bm.free()
    return n


def decimate(obj, target: int):
    tris = triangles(obj)
    if tris <= target:
        return
    mod = obj.modifiers.new('decimate', 'DECIMATE')
    mod.decimate_type = 'COLLAPSE'
    mod.ratio = max(0.001, target / tris * 0.98)
    bpy.ops.object.modifier_apply(modifier=mod.name)


def reshade(obj, angle_deg: float = 30):
    """Drop the imported per-corner normals (decimation scrambles them, and every distinct normal splits a vertex
    on export) and shade smooth by angle instead, which keeps a vehicle's hard edges."""
    bpy.context.view_layer.objects.active = obj
    if obj.data.has_custom_normals:
        bpy.ops.mesh.customdata_custom_splitnormals_clear()
    bpy.ops.object.shade_smooth_by_angle(angle=math.radians(angle_deg))


def base_colour_only(obj):
    """Unlink every input except Base Color on each Principled BSDF, then drop image nodes nothing reads."""
    for slot in obj.material_slots:
        mat = slot.material
        if not mat or not mat.use_nodes:
            continue
        tree = mat.node_tree
        for node in tree.nodes:
            if node.type != 'BSDF_PRINCIPLED':
                continue
            for inp in node.inputs:
                if inp.name != 'Base Color':
                    for link in list(inp.links):
                        tree.links.remove(link)
        keep = {l.from_node for n in tree.nodes if n.type == 'BSDF_PRINCIPLED' for l in n.inputs['Base Color'].links}
        for node in [n for n in tree.nodes if n.type == 'TEX_IMAGE' and n not in keep]:
            tree.nodes.remove(node)


def shrink_textures(max_px: int):
    for img in bpy.data.images:
        w, h = img.size
        if w == 0 or h == 0 or max(w, h) <= max_px:
            continue
        k = max_px / max(w, h)
        img.scale(max(1, round(w * k)), max(1, round(h * k)))


def normalise(obj, length: float, yaw_deg: float):
    if yaw_deg:
        obj.data.transform(Matrix.Rotation(math.radians(yaw_deg), 4, 'Z'))
    xs = [v.co.x for v in obj.data.vertices]
    ys = [v.co.y for v in obj.data.vertices]
    zs = [v.co.z for v in obj.data.vertices]
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    obj.data.transform(Matrix.Translation((-cx, -cy, -min(zs))))
    if length > 0:
        longest = max(max(xs) - min(xs), max(ys) - min(ys))
        if longest > 0:
            obj.data.transform(Matrix.Scale(length / longest, 4))
    obj.data.update()


def used_images(obj):
    imgs = set()
    for slot in obj.material_slots:
        mat = slot.material
        if not mat or not mat.use_nodes:
            continue
        for node in mat.node_tree.nodes:
            if node.type == 'TEX_IMAGE' and node.image and any(o.is_linked for o in node.outputs):
                imgs.add(node.image)
    return sorted(imgs, key=lambda i: i.name)


def glb_json(path: str) -> dict:
    """The JSON chunk of a GLB — what the game will actually load."""
    with open(path, 'rb') as f:
        data = f.read()
    n = struct.unpack_from('<I', data, 12)[0]
    return json.loads(data[20:20 + n])


def export_glb(path: str, jpeg_quality: int):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format='GLB',
        export_image_format='JPEG',
        export_jpeg_quality=jpeg_quality,
        export_apply=True,
        export_yup=True,
        export_draco_mesh_compression_enable=False,
        export_cameras=False,
        export_lights=False,
        export_animations=False,
    )


def optimize(src: str, out: str, tris: int = 3000, texture: int = 1024, max_kb: int = 300,
             length: float = 0.0, yaw: float = 0.0, jpeg_quality: int = 82) -> dict:
    obj = import_glb(src)
    before = triangles(obj)
    weld(obj)
    open_before = open_edges(obj)
    decimate(obj, tris)
    reshade(obj)
    base_colour_only(obj)
    shrink_textures(texture)
    normalise(obj, length, yaw)
    export_glb(out, jpeg_quality)
    after = triangles(obj)
    imgs = [{'name': i.name, 'size': list(i.size)} for i in used_images(obj)]
    size = os.path.getsize(out)
    gltf = glb_json(out)
    exported = {'meshes': len(gltf.get('meshes', [])), 'materials': len(gltf.get('materials', [])),
                'images': [i.get('mimeType') for i in gltf.get('images', [])],
                'extensions': gltf.get('extensionsUsed', [])}
    dims = [round(d, 3) for d in obj.dimensions]  # Blender axes: x width, y length, z height
    checks = {
        'triangles': after <= tris,
        'textures': all(max(i['size']) <= texture for i in imgs) and len(exported['images']) <= 1,
        'materials': exported['materials'] <= 1 and exported['meshes'] == 1,
        'no_decoder_extensions': not exported['extensions'],
        'bytes': size <= max_kb * 1024,
    }
    return {
        'in': src, 'out': out,
        'triangles_before': before, 'triangles': after, 'vertices': len(obj.data.vertices),
        'open_edges_before': open_before, 'open_edges': open_edges(obj),
        'materials': len(obj.material_slots), 'textures': imgs, 'exported': exported,
        'bytes': size, 'dimensions_m': {'width': dims[0], 'length': dims[1], 'height': dims[2]},
        'limits': {'triangles': tris, 'texture_px': texture, 'kb': max_kb, 'materials': 1},
        'checks': checks, 'pass': all(checks.values()),
    }


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--in', dest='src', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--tris', type=int, default=3000)
    ap.add_argument('--texture', type=int, default=1024)
    ap.add_argument('--max-kb', type=int, default=300)
    ap.add_argument('--length', type=float, default=0.0, help='longest horizontal side in metres (0 = keep)')
    ap.add_argument('--yaw', type=float, default=0.0, help='degrees to turn about the vertical axis first')
    ap.add_argument('--jpeg-quality', type=int, default=82)
    a = ap.parse_args()
    report = optimize(a.src, a.out, a.tris, a.texture, a.max_kb, a.length, a.yaw, a.jpeg_quality)
    print(json.dumps(report, indent=2))
    sys.exit(0 if report['pass'] else 1)


if __name__ == '__main__':
    main()
