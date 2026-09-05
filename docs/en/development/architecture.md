# Architecture

## System Architecture

```
AI Agent → blender_* tools → Host plugin → subprocess.spawn()
                                        ↓
                              Blender --background
                              --python-expr (base64)
                                        ↓
                                   Python script
                                   (bpy/bmesh/mathutils)
                                        ↓
                                   JSON result output
```

## Key Technologies

- **Base64 encoding**: Avoid shell escaping issues
- **JSON error handling**: try/except wrapping
- **Timeout mechanism**: Promise.race with SIGTERM
- **Auto cleanup**: All subprocesses terminated on plugin stop