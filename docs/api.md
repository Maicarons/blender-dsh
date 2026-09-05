# Blender DSH Plugin - API Reference
# Licensed under AGPL-3.0

## Overview

The Blender DSH Plugin provides 5 tools for AI agents to control Blender:

1. **blender_execute** - Execute arbitrary Python code
2. **blender_create** - Create 3D objects
3. **blender_modify** - Modify existing objects
4. **blender_scene** - Scene management and rendering
5. **blender_info** - Query scene information

---

## Tool: blender_execute

Execute arbitrary Python code in Blender headless mode.

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `script` | string | ✅ | - | Python code to execute in Blender |
| `description` | string | ❌ | "" | Brief description for logging |
| `timeout` | number | ❌ | 120000 | Execution timeout in ms (max: 600000) |

### Available Modules

The script runs in Blender's embedded Python interpreter with full access to:
- `bpy` - Blender Python API (main)
- `bmesh` - Mesh editing
- `mathutils` - Math utilities (Vector, Matrix, Euler, Quaternion)
- `math`, `json`, `random`, `os`, `sys` - Standard libraries

### Output Format

The last line of stdout should be a JSON object:
```json
{"status": "ok"}
```
or on error:
```json
{"status": "error", "error": "message", "traceback": "..."}
```

### Example

```
blender_execute script="import bpy; bpy.ops.mesh.primitive_cube_add(size=2)"
```

---

## Tool: blender_create

Create 3D objects with a single command.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | ✅ | Object type (see below) |
| `name` | string | ❌ | Object name |
| `location` | [x, y, z] | ❌ | Position (default: [0, 0, 0]) |
| `rotation` | [x, y, z] | ❌ | Rotation in radians |
| `scale` | [x, y, z] | ❌ | Scale (default: [1, 1, 1]) |
| `size` | number | ❌ | Size parameter (depends on type) |
| `radius` | number | ❌ | Radius parameter |
| `depth` | number | ❌ | Depth/height parameter |

### Supported Types

| Type | Description | Key Parameters |
|------|-------------|----------------|
| `cube` | Cube | size |
| `sphere` / `uv_sphere` | UV Sphere | radius |
| `cylinder` | Cylinder | radius, depth |
| `cone` | Cone | radius, depth |
| `torus` | Torus | radius, minor_radius |
| `ico_sphere` | Icosahedron Sphere | radius, subdivisions |
| `monkey` | Suzanne (monkey head) | size |
| `plane` | Plane | size |
| `circle` | Circle | radius |
| `grid` | Grid | size, grid_columns, grid_rows |
| `text` | 3D Text | text_content, depth |
| `bezier_curve` | Bezier curve | - |
| `custom_mesh` | Custom mesh | vertices, faces |

---

## Tool: blender_modify

Modify existing objects.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `object` | string | ❌ | Target object name (uses active if omitted) |
| `operation` | string | ✅ | Operation type |

### Operations

#### transform
Transform object location/rotation/scale.
- `location`: [x, y, z]
- `rotation`: [x, y, z] in radians
- `scale`: [x, y, z]

#### modifier
Add a modifier to the object.
- `modifier_type`: SUBSURF, MIRROR, ARRAY, BEVEL, SOLIDIFY, SCREW, DISPLACE, DECIMATE, WIREFRAME, etc.
- `modifier_settings`: Object with modifier-specific settings
- `apply_modifier`: boolean (apply permanently)

#### material
Create and assign a PBR material.
- `color`: [r, g, b] or [r, g, b, a] (0-1)
- `metallic`: 0-1
- `roughness`: 0-1
- `emission_color`: [r, g, b] (0-1)
- `emission_strength`: number

#### boolean
Boolean operation with another object.
- `tool_object`: Tool object name
- `boolean_operation`: UNION, DIFFERENCE, or INTERSECT

#### Other Operations
- `shade_smooth` / `shade_flat`: Auto smooth shading
- `join`: Join selected objects
- `duplicate`: Duplicate with offset
- `delete`: Delete the object
- `origin_set`: Set origin to geometry center

---

## Tool: blender_scene

Scene management and rendering.

### Operations

#### clear
Remove all objects from the scene.

#### light_add
Add a light.
- `light_type`: POINT, SUN, SPOT, AREA
- `light_energy`: Power
- `light_color`: [r, g, b] (0-1)
- `light_size`: Size for AREA lights

#### camera_add
Add a camera.
- `camera_location`: [x, y, z]
- `camera_target`: [x, y, z] look-at point
- `camera_lens`: Focal length in mm

#### ground_add
Add a ground plane.
- `size`: Plane size
- `color`: [r, g, b] or [r, g, b, a]

#### render
Render the current scene.
- `output_path`: Output file path
- `engine`: CYCLES or EEVEE
- `resolution_x`, `resolution_y`: Resolution
- `samples`: Render samples
- `transparent`: Transparent background (boolean)

#### render_settings
Configure render settings without rendering.

#### world_set
Set world background color.

#### export
Export scene to file.
- `export_format`: OBJ, FBX, GLB, STL, PLY
- `export_path`: Output file path

---

## Tool: blender_info

Query scene information.

### Queries

| Query | Description |
|-------|-------------|
| `scene_summary` | Overview of the current scene |
| `object_list` | List all objects with basic info |
| `object_info` | Detailed info about a specific object (needs `object` param) |
| `object_tree` | Hierarchy of objects with parent/child |
| `material_list` | List all materials |
| `stats` | Scene statistics (total vertices, faces, etc.) |
| `render_settings` | Current render configuration |

---

## System Requirements

- **Blender 4.0+** (tested with 4.0-5.0)
- **DeepSeek Harness** with dynamic Cordis Plugin support
- **Windows** (paths can be adapted for Linux/macOS)
- ~2GB free disk space for Blender operations

## Blender Path Configuration

Edit `BLENDER_PATH` in `src/dsh-plugin/host.js`:

```javascript
// Windows
const BLENDER_PATH = '/usr/bin/blender';

// Linux
// const BLENDER_PATH = '/usr/bin/blender';

// macOS
// const BLENDER_PATH = '/Applications/Blender.app/Contents/MacOS/Blender';
```