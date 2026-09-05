# Example: Parametric spiral staircase
# Run with: blender --background --python spiral_staircase.py
# Licensed under AGPL-3.0

import bpy
import math
import sys
import os

# Add src/scripts to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src', 'scripts'))
from procedural_gen import create_spiral_staircase

# Generate spiral staircase
create_spiral_staircase(steps=24, radius=4, height=8, step_width=1.8)

# Add material to steps
mat_stone = bpy.data.materials.new("Stone")
mat_stone.use_nodes = True
bsdf = mat_stone.node_tree.nodes.get("Principled BSDF")
bsdf.inputs["Base Color"].default_value = (0.5, 0.45, 0.4, 1.0)
bsdf.inputs["Roughness"].default_value = 0.8

for obj in bpy.data.objects:
    if obj.name.startswith("Step"):
        obj.data.materials.append(mat_stone)

# Add camera
from mathutils import Vector
bpy.ops.object.camera_add()
camera = bpy.context.active_object
camera.location = (8, -6, 6)
direction = Vector((0, 0, 4)) - Vector(camera.location)
camera.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
camera.data.lens = 35
bpy.context.scene.camera = camera

# Add lights
bpy.ops.object.light_add(type='SUN', location=(10, -5, 15))
sun = bpy.context.active_object
sun.data.energy = 3

# Render
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.cycles.samples = 256
scene.cycles.use_denoising = True

scene.render.filepath = "/home/user/blender-dsh/output/spiral_staircase.png"
bpy.ops.render.render(write_still=True)

print("Spiral staircase rendered!")