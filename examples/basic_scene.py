# Example: Basic scene setup
# Run with: blender --background --python basic_scene.py
# Licensed under AGPL-3.0

import bpy
import math
from mathutils import Vector

# Clear scene
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

# Create ground plane
bpy.ops.mesh.primitive_plane_add(size=20, location=(0, 0, 0))
ground = bpy.context.active_object
ground.name = "Ground"

# Create a red cube
bpy.ops.mesh.primitive_cube_add(size=2, location=(-3, 0, 1))
cube = bpy.context.active_object
cube.name = "RedCube"

# Create a blue sphere
bpy.ops.mesh.primitive_uv_sphere_add(radius=1.2, location=(3, 0, 1.2))
sphere = bpy.context.active_object
sphere.name = "BlueSphere"

# Create a cylinder
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.8, depth=2, location=(0, 3, 1)
)
cylinder = bpy.context.active_object
cylinder.name = "Cylinder"

# Create materials
# Red material
mat_red = bpy.data.materials.new("Red")
mat_red.use_nodes = True
bsdf = mat_red.node_tree.nodes.get("Principled BSDF")
bsdf.inputs["Base Color"].default_value = (0.8, 0.1, 0.1, 1.0)
bsdf.inputs["Metallic"].default_value = 0.3
bsdf.inputs["Roughness"].default_value = 0.4

# Blue material
mat_blue = bpy.data.materials.new("Blue")
mat_blue.use_nodes = True
bsdf = mat_blue.node_tree.nodes.get("Principled BSDF")
bsdf.inputs["Base Color"].default_value = (0.1, 0.3, 0.8, 1.0)
bsdf.inputs["Metallic"].default_value = 0.6
bsdf.inputs["Roughness"].default_value = 0.2

# Green material
mat_green = bpy.data.materials.new("Green")
mat_green.use_nodes = True
bsdf = mat_green.node_tree.nodes.get("Principled BSDF")
bsdf.inputs["Base Color"].default_value = (0.1, 0.8, 0.3, 1.0)
bsdf.inputs["Roughness"].default_value = 0.7

# Assign materials
cube.data.materials.append(mat_red)
sphere.data.materials.append(mat_blue)
cylinder.data.materials.append(mat_green)

# Add camera
bpy.ops.object.camera_add()
camera = bpy.context.active_object
camera.location = (8, -8, 6)
direction = Vector((0, 0, 0)) - Vector(camera.location)
camera.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
camera.data.lens = 50
bpy.context.scene.camera = camera

# Add lights
bpy.ops.object.light_add(type='SUN', location=(0, 0, 10))
sun = bpy.context.active_object
sun.data.energy = 5
sun.rotation_euler = (math.radians(45), 0, math.radians(45))

bpy.ops.object.light_add(type='AREA', location=(-5, 5, 5))
area = bpy.context.active_object
area.data.energy = 300
area.data.size = 3

# Configure render settings
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.cycles.samples = 128
scene.cycles.use_denoising = True

# Render
scene.render.filepath = "/home/user/blender-dsh/output/basic_scene.png"
bpy.ops.render.render(write_still=True)

print("Basic scene rendered successfully!")
print(f"Output: {scene.render.filepath}")