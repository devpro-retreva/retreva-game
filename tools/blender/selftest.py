"""
Checks the asset scripts end to end without any paid generation: builds a deliberately over-budget test
model (≈17k triangles, two meshes, a 2048² base-colour map plus a normal map), runs optimize_glb on it
and asserts the result fits the limits.

  /opt/blender-py/bin/python tools/blender/selftest.py [--keep DIR]

The test model is a throwaway fixture written to a temp folder; it is never shipped.
"""

import argparse
import os
import sys
import tempfile

import bpy
import numpy as np
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from optimize_glb import optimize  # noqa: E402


def image(name: str, px: int, rgb):
    img = bpy.data.images.new(name, px, px)
    yy, xx = np.mgrid[0:px, 0:px] / px
    pix = np.empty((px, px, 4), dtype=np.float32)
    pix[..., 0] = rgb[0] * (0.6 + 0.4 * xx)
    pix[..., 1] = rgb[1] * (0.6 + 0.4 * yy)
    pix[..., 2] = rgb[2]
    pix[..., 3] = 1
    img.pixels.foreach_set(pix.ravel())
    img.pack()
    return img


def build_fixture(path: str):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    mat = bpy.data.materials.new('body')
    mat.use_nodes = True
    tree = mat.node_tree
    bsdf = tree.nodes['Principled BSDF']
    tex = tree.nodes.new('ShaderNodeTexImage')
    tex.image = image('base', 2048, (0.95, 0.72, 0.02))
    tree.links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
    ntex = tree.nodes.new('ShaderNodeTexImage')
    ntex.image = image('normal', 2048, (0.5, 0.5, 1.0))
    nmap = tree.nodes.new('ShaderNodeNormalMap')
    tree.links.new(ntex.outputs['Color'], nmap.inputs['Color'])
    tree.links.new(nmap.outputs['Normal'], bsdf.inputs['Normal'])
    # a long "body" and a "wheel", parented, so joining and transform-applying are exercised
    bpy.ops.mesh.primitive_uv_sphere_add(segments=128, radius=1, ring_count=64, location=(0, 0, 1))
    body = bpy.context.active_object
    body.scale = (1.0, 2.5, 0.9)
    body.data.materials.append(mat)
    bpy.ops.mesh.primitive_cylinder_add(vertices=256, radius=0.4, depth=0.3, location=(1, 1.5, 0.4), rotation=(0, 1.5708, 0))
    wheel = bpy.context.active_object
    wheel.data.materials.append(mat)
    wheel.parent = body
    bpy.context.view_layer.update()
    pts = [o.matrix_world @ Vector(c) for o in (body, wheel) for c in o.bound_box]
    size = [max(p[i] for p in pts) - min(p[i] for p in pts) for i in range(3)]
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', export_image_format='AUTO')
    return size  # world-space width, length, height as built


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--keep', help='folder to keep the fixture and output in')
    a = ap.parse_args()
    folder = a.keep or tempfile.mkdtemp(prefix='retreva-blender-')
    os.makedirs(folder, exist_ok=True)
    src, out = os.path.join(folder, 'fixture.glb'), os.path.join(folder, 'fixture.opt.glb')
    built = build_fixture(src)
    r = optimize(src, out, tris=3000, texture=1024, max_kb=300, length=5)
    fails = []
    if r['triangles_before'] <= 3000:
        fails.append(f"fixture should start over budget, had {r['triangles_before']}")
    if not r['pass']:
        fails.append(f"over budget after optimize: {r['checks']}")
    if [t['size'] for t in r['textures']] != [[1024, 1024]] or r['exported']['images'] != ['image/jpeg']:
        fails.append(f"expected one 1024² base-colour texture, got {r['textures']}")
    if r['open_edges'] > r['open_edges_before']:
        fails.append(f"decimation tore the mesh: {r['open_edges_before']} -> {r['open_edges']} open edges")
    d = r['dimensions_m']
    want = [built[0] / built[1] * 5, built[2] / built[1] * 5]  # same proportions, scaled to 5 m long
    if abs(d['width'] - want[0]) > 0.02 or abs(d['height'] - want[1]) > 0.02:
        fails.append(f"proportions changed: expected ~{want[0]:.3f} x 5 x {want[1]:.3f}, got {d}")
    if abs(r['dimensions_m']['length'] - 5) > 0.01:
        fails.append(f"expected 5 m long, got {r['dimensions_m']}")
    print(f"fixture {os.path.getsize(src) // 1024} KB, {r['triangles_before']} tris -> "
          f"{r['bytes'] // 1024} KB, {r['triangles']} tris, open edges {r['open_edges_before']}->{r['open_edges']}, textures {r['textures']}, file {r['exported']}, {r['dimensions_m']}")
    for f in fails:
        print('FAIL', f)
    print('PASS' if not fails else 'FAILED')
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
