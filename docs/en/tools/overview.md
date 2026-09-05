# Tool Overview

The plugin registers 5 tools callable by the AI agent.

## Architecture

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