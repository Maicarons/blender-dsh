# API Reference

## blender_execute

Execute Python code in Blender.

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `script` | string | ✅ | - | Python code |
| `description` | string | ❌ | "" | Description |
| `timeout` | number | ❌ | 120000 | Timeout (ms) |

## blender_create

Create 3D objects.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | ✅ | Object type |
| `name` | string | ❌ | Name |
| `location` | [x,y,z] | ❌ | Position |
| `rotation` | [x,y,z] | ❌ | Rotation |
| `scale` | [x,y,z] | ❌ | Scale |
| `size` | number | ❌ | Size |
| `radius` | number | ❌ | Radius |
| `depth` | number | ❌ | Depth |

## blender_modify

Modify objects.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `object` | string | ❌ | Target object |
| `operation` | string | ✅ | Operation type |
| `color` | [r,g,b,a] | ❌ | Color |
| `metallic` | number | ❌ | Metallic 0-1 |
| `roughness` | number | ❌ | Roughness 0-1 |

## blender_scene

Scene management.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `operation` | string | ✅ | Operation type |
| `engine` | string | ❌ | CYCLES/EEVEE |
| `resolution_x` | int | ❌ | Width |
| `resolution_y` | int | ❌ | Height |
| `samples` | int | ❌ | Samples |
| `export_format` | string | ❌ | OBJ/FBX/GLB/STL/PLY |

## blender_info

Query scene info.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | ✅ | Query type |
| `object` | string | ❌ | Object name |