# Example: Parametric object generation
# Run with: blender --background --python parametric_objects.py
# Licensed under AGPL-3.0

import bpy
import math
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src', 'scripts'))
from blender_utils import clear_scene, create_material, assign_material, add_camera, add_light, setup_render
from procedural_gen import create_vase, create_tower

# Create a tower
create_tower(floors=8, base_radius=2.5, floor_height=2.0, taper=0.92)

# Add camera
add_camera(location=(10, -8, 8), target=(0, 0, 4), lens=35)

# Add lights
add_light('SUN', location=(5, -5, 15), energy=5)
add_light('AREA', location=(-5, 5, 3), energy=200, color=(0.9, 0.9, 1.0))

# Set up render
setup_render('CYCLES', 1920, 1080, 256, False)

# Render
scene = bpy.context.scene
scene.render.filepath = "/home/user/blender-dsh/output/tower.png"
bpy.ops.render.render(write_still=True)

# Create a vase in a new scene
bpy.ops.scene.new(type='NEW')
scene = bpy.context.scene
scene.name = "VaseScene"

create_vase(segments=48, rings=24, height=3, radius=1.2)

# Add material
glass_mat = create_material(
    "Glass",
    color=(0.9, 0.95, 1.0, 1.0),
    roughness=0.05,
)
glass_mat.use_nodes = True
bsdf = glass_mat.node_tree.nodes.get("Principled BSDF")
bsdf.inputs["Transmission Weight"].default_value = 0.9
bsdf.inputs["IOR"].default_value = 1.45

vase = bpy.context.active_object
assign_material(vase, glass_mat)

add_camera(location=(5, -4, 3), target=(0, 0, 1.5), lens=50)
add_light('SUN', location=(3, -2, 8), energy=5)
add_light('AREA', location=(-3, 4, 2), energy=300, color=(1, 0.95, 0.9))

setup_render('CYCLES', 1920, 1080, 512, True)
scene.render.filepath = "/home/user/blender-dsh/output/vase.png"
bpy.ops.render.render(write_still=True)

print("Parametric objects rendered!")