# Blender DSH 插件

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Blender](https://img.shields.io/badge/Blender-4.0%2B-orange)](https://www.blender.org)
[![DSH](https://img.shields.io/badge/DSH-Plugin-brightgreen)](https://github.com/deepseek-ai/dsh)
[![Docs](https://img.shields.io/badge/docs-vitepress-blue)](https://maicarons.github.io/blender-dsh/)

AI 驱动的 Blender 3D 建模插件，专为 **DeepSeek Harness (DSH)** 设计。  
让 AI 智能体通过自然语言对话直接操控 Blender，创建、修改、渲染和导出 3D 模型。

---

## ✨ 功能特性

| 功能 | 说明 |
|------|------|
| 🧊 **创建 3D 对象** | 立方体、球体、圆柱体、环面、猴头、文字、自定义网格、曲线 |
| 🎨 **修改对象** | 变换、PBR 材质、修改器（细分、镜像、阵列、倒角...）、布尔运算 |
| 💡 **场景管理** | 灯光、相机、世界环境、地面、清空场景 |
| 🖼️ **渲染与导出** | Cycles/EEVEE 渲染、导出为 OBJ/FBX/GLB/STL/PLY |
| 🔍 **场景信息** | 对象列表、统计信息、材质信息、渲染设置 |
| 🐍 **Python API** | 执行任意 Blender Python 脚本（bpy, bmesh, mathutils） |

---

## 🚀 快速开始

### 前提条件

1. 系统已安装 **Blender 4.0+**
2. **DeepSeek Harness (DSH)** 正在运行且可访问 Web GUI

### 安装方法

#### 方法一：动态插件（推荐）

通过 `cordis_define` 工具将插件代码（`src/dsh-plugin/` 中的 Host 和 Client 代码）注册为动态 Cordis 插件。插件将注册 5 个 AI 可见的工具。

#### 方法二：Agent 预设

1. 将 `preset/` 目录下的预设文件复制到 DSH 用户预设目录：
   ```bash
   # ${DSH_HOME:-$HOME/.dsh}/.agent-presets/blender/
   ```
2. 使用 `blender` 预设启动新会话。

---

## 🛠️ 工具列表

插件注册了 5 个 AI 智能体可调用的工具：

### 1. `blender_execute`
执行任意 Blender Python 代码。完整访问 `bpy`、`bmesh`、`mathutils`。

**参数：** `script`（必填）、`description`、`timeout`

### 2. `blender_create`
一键创建 3D 对象。支持 `cube`、`sphere`、`cylinder`、`cone`、`torus`、`ico_sphere`、`monkey`、`plane`、`circle`、`grid`、`text`、`custom_mesh`、`bezier_curve`

### 3. `blender_modify`
修改现有对象——变换、添加修改器、赋予材质、布尔运算。

**操作：** `transform`、`modifier`、`material`、`boolean`、`shade_smooth`、`shade_flat`、`join`、`duplicate`、`delete`、`origin_set`

### 4. `blender_scene`
场景管理——灯光、相机、渲染设置、世界环境、导出。

**操作：** `clear`、`light_add`、`camera_add`、`ground_add`、`render`、`render_settings`、`world_set`、`export`

### 5. `blender_info`
查询场景信息——对象列表、统计信息、材质、渲染设置。

**查询类型：** `scene_summary`、`object_list`、`object_info`、`object_tree`、`material_list`、`stats`、`render_settings`

---

## 📋 使用示例

```
> 创建一个红色立方体和一个蓝色球体，添加灯光和相机
> 使用自定义网格顶点创建一个 3D 心形
> 生成一个 20 级参数化螺旋楼梯
> 使用 Cycles 引擎以 1080p 渲染当前场景
```

完整示例请参见 [`examples/`](examples/) 目录和[在线文档](https://maicarons.github.io/blender-dsh/)。

---

## 📁 项目结构

```
blender-dsh/
├── LICENSE
├── README.md               # 中文文档
├── README_EN.md            # English documentation
├── src/
│   ├── dsh-plugin/         # 动态插件代码
│   │   ├── host.js         # 服务端（工具定义）
│   │   └── client.js       # 客户端（UI）
│   └── scripts/            # Python 工具脚本
│       ├── blender_utils.py
│       └── procedural_gen.py
├── preset/                 # Agent 预设
├── examples/               # 示例脚本
├── docs/                   # VitePress 文档站
└── output/                 # 渲染输出
```

---

## 🔧 配置

编辑 `src/dsh-plugin/host.js` 中的 `BLENDER_PATH` 和 `OUTPUT_DIR`：

```javascript
const BLENDER_PATH = '/usr/bin/blender';
const OUTPUT_DIR = '/home/user/blender-dsh/output';
```

---

## 📄 许可证

本项目采用 **GNU Affero General Public License v3.0 (AGPL-3.0)**。  
详见 [LICENSE](LICENSE) 文件。