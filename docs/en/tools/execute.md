# blender_execute

Execute arbitrary Python code in Blender headless mode.

## Parameters

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `script` | string | ✅ | - | Python code |
| `description` | string | ❌ | "" | Description |
| `timeout` | number | ❌ | 120000 | Timeout (ms) |

## Available Modules

`bpy`, `bmesh`, `mathutils`, `math`, `json`, `sys`

## Example

```python
import bpy, json
bpy.ops.mesh.primitive_cube_add(size=2)
print(json.dumps({"status":"ok"}))
```