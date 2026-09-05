# Blender DSH Plugin

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Blender](https://img.shields.io/badge/Blender-4.0%2B-orange)](https://www.blender.org)
[![DSH](https://img.shields.io/badge/DSH-Plugin-brightgreen)](https://github.com/deepseek-ai/dsh)
[![Docs](https://img.shields.io/badge/docs-vitepress-blue)](https://maicarons.github.io/blender-dsh/)

AI-powered Blender 3D modeling plugin for **DeepSeek Harness (DSH)**.  
Let AI agents create, modify, render, and export 3D models in Blender directly through natural language conversations.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🧊 **Create 3D Objects** | Cubes, spheres, cylinders, torus, monkeys, text, custom meshes, curves |
| 🎨 **Modify Objects** | Transform, PBR materials, modifiers (subsurf, mirror, array, bevel...), boolean operations |
| 💡 **Scene Management** | Lighting, cameras, world settings, ground plane, clear scene |
| 🖼️ **Render & Export** | Cycles/EEVEE rendering, export to OBJ/FBX/GLB/STL/PLY |
| 🔍 **Scene Info** | Object list, stats, material info, render settings |
| 🐍 **Python API** | Execute arbitrary Blender Python (bpy, bmesh, mathutils) commands |

---

## 🚀 Quick Start

### Prerequisites

1. **Blender 4.0+** installed on your system
2. **DeepSeek Harness (DSH)** running with Web GUI access

### Installation

#### Method 1: Dynamic Plugin (Recommended)

Load the plugin directly into your current DSH session using `cordis_define` with the Host and Client code from `src/dsh-plugin/`. The plugin registers 5 model-visible tools.

#### Method 2: Agent Preset

1. Copy `preset/` to your DSH user presets:
   ```bash
   # ${DSH_HOME:-$HOME/.dsh}/.agent-presets/blender/
   ```
2. Start a new session with the `blender` preset.

---

## 🛠️ Tools

The plugin registers 5 tools callable by the AI agent:

### 1. `blender_execute`
Execute arbitrary Blender Python code with full access to `bpy`, `bmesh`, `mathutils`.

**Parameters:** `script` (required), `description`, `timeout`

### 2. `blender_create`
Create 3D objects: `cube`, `sphere`, `cylinder`, `cone`, `torus`, `ico_sphere`, `monkey`, `plane`, `circle`, `grid`, `text`, `custom_mesh`, `bezier_curve`

### 3. `blender_modify`
Modify objects — transform, add modifiers, assign materials, boolean operations.

**Operations:** `transform`, `modifier`, `material`, `boolean`, `shade_smooth`, `shade_flat`, `join`, `duplicate`, `delete`, `origin_set`

### 4. `blender_scene`
Manage scenes — lights, cameras, render settings, world, export.

**Operations:** `clear`, `light_add`, `camera_add`, `ground_add`, `render`, `render_settings`, `world_set`, `export`

### 5. `blender_info`
Query scene information — object list, stats, materials, render settings.

**Queries:** `scene_summary`, `object_list`, `object_info`, `object_tree`, `material_list`, `stats`, `render_settings`

---

## 📋 Examples

```
> Create a red cube with a blue sphere next to it, add a light and camera
> Create a 3D heart shape using custom mesh vertices
> Generate a parametric spiral staircase with 20 steps
> Render the current scene with Cycles at 1080p
```

Full examples are in the [`examples/`](examples/) directory and the [online documentation](https://maicarons.github.io/blender-dsh/).

---

## 📁 Project Structure

```
blender-dsh/
├── LICENSE
├── README.md               # Chinese documentation
├── README_EN.md            # English documentation
├── src/
│   ├── dsh-plugin/         # Dynamic plugin source
│   │   ├── host.js         # Host-side (tool definitions)
│   │   └── client.js       # Client-side (UI)
│   └── scripts/            # Python utility scripts
│       ├── blender_utils.py
│       └── procedural_gen.py
├── preset/                 # Agent preset
├── examples/               # Example scripts
├── docs/                   # VitePress documentation site
└── output/                 # Render output
```

---

## 🔧 Configuration

Edit `BLENDER_PATH` and `OUTPUT_DIR` in `src/dsh-plugin/host.js`:

```javascript
const BLENDER_PATH = '/usr/bin/blender';
const OUTPUT_DIR = '/home/user/blender-dsh/output';
```

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0** (AGPL-3.0).  
See the [LICENSE](LICENSE) file for details.