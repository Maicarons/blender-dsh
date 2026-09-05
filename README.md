# Blender DSH Plugin

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Blender](https://img.shields.io/badge/Blender-4.0%2B-orange)](https://www.blender.org)
[![DSH](https://img.shields.io/badge/DSH-Plugin-brightgreen)](https://github.com/deepseek-ai/dsh)

AI-powered Blender 3D modeling plugin for **DeepSeek Harness (DSH)**.  
Let AI agents create, modify, render, and export 3D models in Blender directly through natural language conversations.

基于 **DeepSeek Harness (DSH)** 的 AI 驱动 Blender 3D 建模插件。  
让 AI 智能体通过自然语言对话直接操控 Blender 创建、修改、渲染和导出 3D 模型。

---

## ✨ Features / 功能

| Feature | Description |
|---------|-------------|
| 🧊 **Create 3D Objects** | Cubes, spheres, cylinders, torus, monkeys, text, custom meshes, curves |
| 🎨 **Modify Objects** | Transform, materials (PBR), modifiers (subsurf, mirror, array, bevel...), boolean operations |
| 💡 **Scene Management** | Lighting, cameras, world settings, ground plane, clear scene |
| 🖼️ **Render & Export** | Cycles/EEVEE rendering, export to OBJ/FBX/GLB/STL/PLY |
| 🔍 **Scene Info** | Object list, stats, material info, render settings |
| 🐍 **Python API** | Execute arbitrary Blender Python (bpy, bmesh, mathutils) commands |

---

## 🚀 Quick Start / 快速开始

### Prerequisites / 前提条件

1. **Blender 4.0+** installed on your system
2. **DeepSeek Harness (DSH)** running with Web GUI access
3. Access to this session (current working directory: `G:\GitHub\blender-dsh`)

### Installation / 安装方法

#### Method 1: Dynamic Plugin (Recommended / 推荐)

Load the plugin directly into your current DSH session. The plugin will be registered as a dynamic Cordis Plugin with 5 model-visible tools.

Simply run the `cordis_define` tool with the Host and Client code from `src/dsh-plugin/`.

#### Method 2: Agent Preset

Create a preset that includes the Blender tools automatically:

1. Copy the preset from the `preset/` directory to your DSH agent presets folder:
   ```bash
   # Copy to DSH user presets
   # The preset directory is: ${DSH_HOME:-$HOME/.dsh}/.agent-presets/blender/
   ```

2. Start a new session with the `blender` preset.

---

## 🛠️ Tools / 工具

The plugin registers 5 tools callable by the AI agent:

### 1. `blender_execute`
Execute arbitrary Blender Python code. Full access to `bpy`, `bmesh`, `mathutils`.

**Parameters:**
- `script` (string, required): Python code to execute
- `description` (string): Brief description for logging
- `timeout` (number): Timeout in ms (default: 120000, max: 600000)

### 2. `blender_create`
Create 3D objects with a single command.

**Supported types:** `cube`, `sphere`, `cylinder`, `cone`, `torus`, `ico_sphere`, `monkey`, `plane`, `circle`, `grid`, `text`, `custom_mesh`, `bezier_curve`

**Parameters:** type, name, location, rotation, scale, size, radius, depth, etc.

### 3. `blender_modify`
Modify existing objects - transform, add modifiers, assign materials, boolean operations.

**Operations:** `transform`, `modifier`, `material`, `boolean`, `shade_smooth`, `shade_flat`, `join`, `duplicate`, `delete`, `origin_set`

### 4. `blender_scene`
Scene management - lights, cameras, render settings, world, export.

**Operations:** `clear`, `light_add`, `camera_add`, `ground_add`, `render`, `render_settings`, `world_set`, `export`

### 5. `blender_info`
Query scene information - object list, stats, materials, render settings.

**Queries:** `scene_summary`, `object_list`, `object_info`, `object_tree`, `material_list`, `stats`, `render_settings`

---

## 📋 Examples / 使用示例

### Create a simple scene

```
> Create a red cube with a blue sphere next to it, add a light and camera
```

The AI agent will use `blender_create` to create the objects, `blender_modify` to assign materials, and `blender_scene` to add lighting and camera.

### Custom mesh

```
> Create a 3D heart shape using custom mesh vertices
```

The AI agent will generate appropriate vertex/face data and use `blender_create` with `type: custom_mesh`.

### Advanced procedural generation

```
> Generate a parametric spiral staircase with 20 steps using blender_execute
```

The AI agent can write complex Python scripts using `bpy` and `bmesh` for procedural generation.

### Render to image

```
> Render the current scene with Cycles at 1080p with transparent background
```

The AI agent will configure render settings and use `blender_scene` with `operation: render`.

See `examples/` directory for more complete examples.

---

## 📁 Project Structure / 项目结构

```
blender-dsh/
├── LICENSE                 # AGPL-3.0 License
├── README.md               # Bilingual README (this file)
├── README.zh-CN.md         # Chinese-only README
├── src/
│   ├── dsh-plugin/
│   │   ├── host.js         # Host-side plugin code (Tools)
│   │   └── client.js       # Client-side plugin code (UI)
│   └── scripts/
│       ├── blender_utils.py    # Reusable Python utilities
│       └── procedural_gen.py   # Procedural generation functions
├── preset/
│   └── agent.cordis.yml    # Agent preset composition
├── examples/
│   ├── basic_scene.py      # Example: basic scene setup
│   ├── spiral_staircase.py # Example: procedural spiral staircase
│   ├── parametric_objects.py # Example: parametric shapes
│   └── render_workflow.py  # Example: render pipeline
├── output/                 # Rendered output directory
└── docs/
    └── api.md              # API reference
```

---

## 🔧 Configuration / 配置

Edit the `BLENDER_PATH` and `OUTPUT_DIR` in `src/dsh-plugin/host.js` to match your system:

```javascript
const BLENDER_PATH = '/usr/bin/blender';
const OUTPUT_DIR = '/home/user/blender-dsh/output';
```

---

## 📄 License / 许可证

This project is licensed under the **GNU Affero General Public License v3.0** (AGPL-3.0).  
See the [LICENSE](LICENSE) file for details.

```
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
```

---

## 🤝 Contributing / 贡献

Contributions are welcome! Please feel free to submit a Pull Request.  
欢迎贡献！请随时提交 Pull Request。

---

## 📞 Contact / 联系方式

- GitHub Issues: [https://github.com/yourusername/blender-dsh/issues](https://github.com/yourusername/blender-dsh/issues)