# Procedural generation functions for Blender DSH plugin
# Licensed under AGPL-3.0

import bpy
import bmesh
import math
import random
from mathutils import Vector, noise


def create_spiral_staircase(steps=20, radius=3, height=6, step_width=1.5):
    """Generate a spiral staircase."""
    clear_scene()
    step_height = height / steps
    angle_per_step = (2 * math.pi) / steps

    for i in range(steps):
        angle = i * angle_per_step
        x = radius * math.cos(angle)
        y = radius * math.sin(angle)
        z = i * step_height

        bpy.ops.mesh.primitive_cube_add(
            size=1,
            location=(x, y, z),
            scale=(step_width, 0.4, step_height * 0.8)
        )
        step = bpy.context.active_object
        step.rotation_euler.z = angle
        step.name = f"Step_{i+1:02d}"

    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.2, depth=height, location=(0, 0, height / 2)
    )
    bpy.context.active_object.name = "CentralColumn"


def create_terrain(size=20, resolution=50, height_scale=2.0, seed=0):
    """Generate a procedural terrain mesh."""
    if seed:
        random.seed(seed)

    bm = bmesh.new()
    verts = []
    for i in range(resolution):
        row = []
        for j in range(resolution):
            x = (i / resolution - 0.5) * size
            y = (j / resolution - 0.5) * size
            # Multiple octaves of noise for realistic terrain
            z = (math.sin(x * 0.3) * math.cos(y * 0.3) * height_scale * 0.5 +
                 math.sin(x * 0.7 + y * 0.5) * height_scale * 0.3 +
                 math.sin(x * 1.5) * math.cos(y * 1.5) * height_scale * 0.15 +
                 random.uniform(-0.1, 0.1) * height_scale)
            row.append(bm.verts.new((x, y, z)))
        verts.append(row)

    for i in range(resolution - 1):
        for j in range(resolution - 1):
            bm.faces.new((verts[i][j], verts[i + 1][j],
                         verts[i + 1][j + 1], verts[i][j + 1]))

    mesh = bpy.data.meshes.new("Terrain")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Terrain", mesh)
    bpy.context.collection.objects.link(obj)
    return obj


def create_honeycomb(rows=8, cols=10, radius=0.5, thickness=0.1):
    """Generate a honeycomb panel."""
    bm = bmesh.new()

    def add_hexagon(cx, cy, r):
        verts = []
        for i in range(6):
            angle = math.radians(60 * i + 30)
            x = cx + r * math.cos(angle)
            y = cy + r * math.sin(angle)
            verts.append(bm.verts.new((x, y, 0)))
        bm.faces.new(verts)

    for row in range(rows):
        for col in range(cols):
            cx = col * radius * 1.75
            cy = row * radius * 1.52
            if col % 2 == 1:
                cy += radius * 0.76
            add_hexagon(bm, cx, cy, radius * 0.9)

    mesh = bpy.data.meshes.new("Honeycomb")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Honeycomb", mesh)
    bpy.context.collection.objects.link(obj)

    solid = obj.modifiers.new("Solidify", 'SOLIDIFY')
    solid.thickness = thickness
    return obj


def create_tower(floors=10, base_radius=3, floor_height=2.5, taper=0.9):
    """Generate a parametric tower building."""
    clear_scene()

    for i in range(floors):
        radius = base_radius * (taper ** i)
        z = i * floor_height + floor_height / 2
        bpy.ops.mesh.primitive_cylinder_add(
            radius=radius, depth=floor_height * 0.8,
            location=(0, 0, z)
        )
        floor = bpy.context.active_object
        floor.name = f"Floor_{i+1:02d}"

        # Add floor ring
        bpy.ops.mesh.primitive_torus_add(
            major_radius=radius, minor_radius=0.1,
            location=(0, 0, z - floor_height * 0.35)
        )

    # Add a spire at the top
    top_z = floors * floor_height
    bpy.ops.mesh.primitive_cone_add(
        radius1=base_radius * (taper ** floors) * 0.5,
        depth=floor_height * 1.5,
        location=(0, 0, top_z + floor_height * 0.75)
    )
    bpy.context.active_object.name = "Spire"


def create_grid_objects(rows=10, cols=10, spacing=2.5, obj_type='CUBE'):
    """Create a grid of objects."""
    for i in range(rows):
        for j in range(cols):
            x = i * spacing
            y = j * spacing
            bpy.ops.mesh.primitive_cube_add(
                size=1, location=(x, y, 0)
            )
            obj = bpy.context.active_object
            obj.name = f"Grid_{i}_{j}"
            obj.location.z = math.sin(i * 0.5) * math.cos(j * 0.5) + 0.5


def create_circular_array(obj, count=12, radius=5):
    """Arrange objects in a circular pattern."""
    for i in range(count):
        angle = (2 * math.pi * i) / count
        x = radius * math.cos(angle)
        y = radius * math.sin(angle)
        new_obj = obj.copy()
        new_obj.data = obj.data.copy()
        bpy.context.collection.objects.link(new_obj)
        new_obj.location = (x, y, 0)
        new_obj.rotation_euler.z = angle


def clear_scene():
    """Clear all objects from the scene."""
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in bpy.data.meshes:
        bpy.data.meshes.remove(block)
    for block in bpy.data.materials:
        bpy.data.materials.remove(block)


def create_vase(segments=32, rings=16, height=4, radius=1.5):
    """Generate a parametric vase using bmesh."""
    bm = bmesh.new()

    verts = []
    for i in range(rings + 1):
        t = i / rings
        z = t * height
        # Profile curve: narrow base, wide middle, slightly narrowed top
        r = radius * (0.3 + 1.2 * math.sin(t * math.pi) * (1 - 0.3 * t))
        ring_verts = []
        for j in range(segments):
            angle = (2 * math.pi * j) / segments
            x = r * math.cos(angle)
            y = r * math.sin(angle)
            ring_verts.append(bm.verts.new((x, y, z)))
        verts.append(ring_verts)

    for i in range(rings):
        for j in range(segments):
            v1 = verts[i][j]
            v2 = verts[i][(j + 1) % segments]
            v3 = verts[i + 1][(j + 1) % segments]
            v4 = verts[i + 1][j]
            bm.faces.new((v1, v2, v3, v4))

    # Close bottom
    bottom_verts = [verts[0][j] for j in range(segments)]
    bm.faces.new(bottom_verts)

    mesh = bpy.data.meshes.new("Vase")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("Vase", mesh)
    bpy.context.collection.objects.link(obj)
    return obj