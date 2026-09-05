# Installation Guide

## Requirements

| Component | Requirement |
|-----------|-------------|
| Blender | 4.0+ (recommended 4.2+) |
| DeepSeek Harness | Latest |
| OS | Windows / Linux / macOS |

## Configure Blender Path

Edit `src/dsh-plugin/host.js`:

```javascript
// Windows
const BLENDER_PATH = 'C:\\Program Files\\Blender Foundation\\Blender 4.2\\blender.exe';

// Linux
const BLENDER_PATH = '/usr/bin/blender';

// macOS
const BLENDER_PATH = '/Applications/Blender.app/Contents/MacOS/Blender';
```

## Verify

```bash
blender --version
blender --background --python-expr "import bpy; print(bpy.app.version_string)"
```