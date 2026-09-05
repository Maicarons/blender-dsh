# Example: Complete render workflow
# Run with: blender --background --python render_workflow.py
# Licensed under AGPL-3.0

import bpy
import math
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src', 'scripts'))
from blender_utils import (
    clear_scene, create_material, assign_material,
    add_camera, add_light, add_ground_plane,
    setup_render, export_scene
)

# === Step 1: Clear scene ===
clear_scene()

# === Step 2: Create objects ===

# Main subject - a detailed cube with bevel
bpy.ops.mesh.primitive_cube_add(size=2, location=(0, 0, 1))
main_obj = bpy.context.active_object
main_obj.name = "MainSubject"

# Add bevel modifier
bevel = main_obj.modifiers.new("Bevel", 'BEVEL')
bevel.width = 0.1
bevel.segments = 3

# Add subdivision surface
subsurf = main_obj.modifiers.new("Subsurf", 'SUBSURF')
subsurf.levels = 2
subsurf.render_levels = 3

# Apply smooth shading
bpy.ops.object.shade_smooth()

# Create main material - gold
gold_mat = create_material(
    "Gold",
    color=(0.95, 0.75, 0.15, 1.0),
    metallic=1.0,
    roughness=0.25,
    emission_color=(0.95, 0.75, 0.15),
    emission_strength=0.1,
)
assign_material(main_obj, gold_mat)

# Create a ring of smaller objects
for i in range(8):
    angle = (2 * math.pi * i) / 8
    radius = 3.5
    x = radius * math.cos(angle)
    y = radius * math.sin(angle)

    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.3, location=(x, y, 0.5))
    sphere = bpy.context.active_object
    sphere.name = f"Orb_{i+1:02d}"

    # Alternate materials
    if i % 2 == 0:
        mat = create_material(f"Gem_{i}", (0.2, 0.5, 0.8, 1.0), 0.7, 0.1)
    else:
        mat = create_material(f"Gem_{i}", (0.8, 0.2, 0.5, 1.0), 0.5, 0.2)
    assign_material(sphere, mat)

# === Step 3: Add ground plane ===
add_ground_plane(size=12, color=(0.15, 0.15, 0.18, 1.0))

# === Step 4: Set up lighting ===
# Key light
add_light('AREA', location=(-4, 3, 6), energy=500, color=(1, 0.95, 0.9))
# Fill light
add_light('AREA', location=(4, -2, 3), energy=200, color=(0.9, 0.95, 1.0))
# Rim light
add_light('AREA', location=(0, -6, 4), energy=300, color=(1, 1, 0.95))
# Top light
add_light('SUN', location=(0, 0, 12), energy=2)

# === Step 5: Add camera ===
add_camera(location=(6, -5, 4), target=(0, 0, 0.8), lens=50)

# === Step 6: Configure render ===
setup_render('CYCLES', 1920, 1080, 256, True)

# === Step 7: Render ===
scene = bpy.context.scene
render_path = "/home/user/blender-dsh/output/render_workflow.png"
scene.render.filepath = render_path
bpy.ops.render.render(write_still=True)

# === Step 8: Export as GLB ===
export_path = "/home/user/blender-dsh/output/render_workflow.glb"
export_scene(export_path, 'GLB')

print(f"=== Render Workflow Complete ===")
print(f"Render: {render_path}")
print(f"Export: {export_path}")