"""
Render a GLB to a PNG from a three-quarter view (Cycles on the CPU — works headless, no GPU needed).

  /opt/blender-py/bin/python tools/blender/render_preview.py --in public/models/danfo.glb --out qa-shots/danfo.png

The game's front is glTF +Z, which is Blender -Y; the camera looks at the front-right corner by default
(--angle turns it around the model, in degrees).
"""

import argparse
import math
import os

import bpy
from mathutils import Vector


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--in', dest='src', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--width', type=int, default=960)
    ap.add_argument('--height', type=int, default=640)
    ap.add_argument('--samples', type=int, default=32)
    ap.add_argument('--angle', type=float, default=35.0)
    a = ap.parse_args()

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=a.src)
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    pts = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    centre, radius = (lo + hi) / 2, (hi - lo).length / 2

    scene = bpy.context.scene
    # ground plane to catch the shadow
    bpy.ops.mesh.primitive_plane_add(size=radius * 8, location=(centre.x, centre.y, lo.z))
    ground = bpy.context.active_object
    gm = bpy.data.materials.new('ground')
    gm.diffuse_color = (0.8, 0.78, 0.74, 1)
    ground.data.materials.append(gm)

    sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN'))
    sun.data.energy = 3.5
    sun.rotation_euler = (math.radians(50), 0, math.radians(30))
    scene.collection.objects.link(sun)
    scene.world = bpy.data.worlds.new('sky')
    scene.world.color = (0.75, 0.82, 0.9)

    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
    scene.collection.objects.link(cam)
    scene.camera = cam
    ang = math.radians(a.angle)
    dist = radius * 2.6
    cam.location = centre + Vector((math.sin(ang) * dist, -math.cos(ang) * dist, radius * 0.9))
    cam.rotation_euler = (centre - cam.location).to_track_quat('-Z', 'Y').to_euler()

    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = a.samples
    scene.render.resolution_x, scene.render.resolution_y = a.width, a.height
    scene.render.image_settings.file_format = 'PNG'
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    scene.render.filepath = os.path.abspath(a.out)
    bpy.ops.render.render(write_still=True)
    print(f'wrote {a.out}')


if __name__ == '__main__':
    main()
