# Blender utility functions for DSH plugin
# Reusable Python functions for 3D modeling
# Licensed under AGPL-3.0

import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler


def clear_scene():
    """Clear all objects from the current scene."""
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in bpy.data.meshes:
        bpy.data.meshes.remove(block)
    for block in bpy.data.materials:
        bpy.data.materials.remove(block)
    for block in bpy.data.lights:
        bpy.data.lights.remove(block)
    for block in bpy.data.cameras:
        bpy.data.cameras.remove(block)


def create_material(name, color=(0.8, 0.8, 0.8, 1.0), metallic=0.0, roughness=0.5,
                    emission_color=None, emission_strength=0.0):
    """Create a PBR material with Principled BSDF."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color
        bsdf.inputs["Metallic"].default_value = metallic
        bsdf.inputs["Roughness"].default_value = roughness
        if emission_color and emission_strength > 0:
            bsdf.inputs["Emission Color"].default_value = emission_color + [1.0]
            bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat


def assign_material(obj, material):
    """Assign a material to an object."""
    if obj.data.materials:
        obj.data.materials[0] = material
    else:
        obj.data.materials.append(material)


def add_camera(location=(7, -7, 5), target=(0, 0, 0), lens=50):
    """Add a camera aimed at a target point."""
    bpy.ops.object.camera_add()
    cam = bpy.context.active_object
    cam.location = location
    direction = Vector(target) - Vector(location)
    cam.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
    cam.data.lens = lens
    bpy.context.scene.camera = cam
    return cam


def add_light(type='POINT', location=(5, -5, 5), energy=500, color=(1, 1, 1)):
    """Add a light to the scene."""
    bpy.ops.object.light_add(type=type, location=location)
    light = bpy.context.active_object
    light.data.energy = energy
    light.data.color = color
    return light


def add_ground_plane(size=20, color=(0.2, 0.2, 0.2, 1.0)):
    """Add a ground plane with a material."""
    bpy.ops.mesh.primitive_plane_add(size=size, location=(0, 0, 0))
    ground = bpy.context.active_object
    ground.name = "Ground"
    mat = create_material("Ground_mat", color=color, roughness=0.8)
    assign_material(ground, mat)
    return ground


def create_parametric_object(obj_type, **kwargs):
    """Create a parametric object by type name."""
    type_map = {
        'cube': lambda: bpy.ops.mesh.primitive_cube_add(size=kwargs.get('size', 2)),
        'sphere': lambda: bpy.ops.mesh.primitive_uv_sphere_add(
            radius=kwargs.get('radius', 1)),
        'cylinder': lambda: bpy.ops.mesh.primitive_cylinder_add(
            radius=kwargs.get('radius', 1), depth=kwargs.get('depth', 2)),
        'cone': lambda: bpy.ops.mesh.primitive_cone_add(
            radius=kwargs.get('radius', 1), depth=kwargs.get('depth', 2)),
        'torus': lambda: bpy.ops.mesh.primitive_torus_add(
            major_radius=kwargs.get('major_radius', 2),
            minor_radius=kwargs.get('minor_radius', 0.5)),
        'ico_sphere': lambda: bpy.ops.mesh.primitive_ico_sphere_add(
            subdivisions=kwargs.get('subdivisions', 2),
            radius=kwargs.get('radius', 1)),
        'monkey': lambda: bpy.ops.mesh.primitive_monkey_add(
            size=kwargs.get('size', 2)),
    }
    func = type_map.get(obj_type)
    if func:
        func()
        return bpy.context.active_object
    raise ValueError(f"Unknown object type: {obj_type}")


def setup_render(engine='CYCLES', resolution_x=1920, resolution_y=1080,
                 samples=128, transparent=False):
    """Configure render settings."""
    scene = bpy.context.scene
    scene.render.engine = engine
    scene.render.resolution_x = resolution_x
    scene.render.resolution_y = resolution_y
    scene.render.film_transparent = transparent
    if engine == 'CYCLES':
        scene.cycles.samples = samples
        scene.cycles.use_denoising = True
    elif engine == 'BLENDER_EEVEE_NEXT':
        scene.eevee.taa_render_samples = samples


def export_scene(filepath, format='OBJ'):
    """Export scene to a file format."""
    format_map = {
        'OBJ': lambda: bpy.ops.wm.obj_export(filepath=filepath),
        'FBX': lambda: bpy.ops.export_scene.fbx(filepath=filepath),
        'GLB': lambda: bpy.ops.export_scene.gltf(filepath=filepath, export_format='GLB'),
        'STL': lambda: bpy.ops.wm.stl_export(filepath=filepath),
        'PLY': lambda: bpy.ops.wm.ply_export(filepath=filepath),
    }
    func = format_map.get(format.upper())
    if func:
        func()
        return filepath
    raise ValueError(f"Unsupported export format: {format}")


def create_custom_mesh(vertices, faces, name="CustomMesh"):
    """Create a mesh from vertex and face data."""
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return obj


def get_object_info(obj):
    """Get detailed information about an object."""
    return {
        "name": obj.name,
        "type": obj.type,
        "location": list(obj.location),
        "rotation": list(obj.rotation_euler),
        "scale": list(obj.scale),
        "vertices": len(obj.data.vertices) if hasattr(obj.data, "vertices") else 0,
        "faces": len(obj.data.polygons) if hasattr(obj.data, "polygons") else 0,
        "modifiers": [m.name + ":" + m.type for m in obj.modifiers],
        "materials": [m.name for m in obj.data.materials] if hasattr(obj.data, "materials") else [],
    }


def get_scene_summary():
    """Get a summary of the current scene."""
    scene = bpy.context.scene
    return {
        "scene": scene.name,
        "objects_count": len(scene.objects),
        "objects": [o.name for o in scene.objects],
        "camera": scene.camera.name if scene.camera else None,
        "render_engine": scene.render.engine,
        "resolution": [scene.render.resolution_x, scene.render.resolution_y],
    }


def get_scene_stats():
    """Get statistics about the current scene."""
    return {
        "total_objects": len(bpy.data.objects),
        "total_meshes": len(bpy.data.meshes),
        "total_materials": len(bpy.data.materials),
        "total_lights": len(bpy.data.lights),
        "total_cameras": len(bpy.data.cameras),
        "total_vertices": sum(
            len(o.data.vertices) for o in bpy.data.objects
            if hasattr(o.data, "vertices")
        ),
        "total_faces": sum(
            len(o.data.polygons) for o in bpy.data.objects
            if hasattr(o.data, "polygons")
        ),
    }