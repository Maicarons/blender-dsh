# 工具概览

插件注册了 5 个 AI 智能体可调用的工具，涵盖 Blender 3D 建模的完整流程。

| 工具 | 功能 | 适用场景 |
|------|------|----------|
| [`blender_execute`](/tools/execute) | 执行任意 Python 代码 | 复杂建模、程序化生成、自定义操作 |
| [`blender_create`](/tools/create) | 创建 3D 对象 | 快速创建基本几何体 |
| [`blender_modify`](/tools/modify) | 修改对象 | 变换、材质、修改器、布尔运算 |
| [`blender_scene`](/tools/scene) | 场景管理 | 灯光、相机、渲染、导出 |
| [`blender_info`](/tools/info) | 查询信息 | 场景统计、对象列表、渲染设置 |

## 技术架构

```
AI Agent → blender_* 工具 → Host 插件 → subprocess.spawn()
                                        ↓
                              Blender --background
                              --python-expr (base64)
                                        ↓
                                   Python 脚本
                                   (bpy/bmesh/mathutils)
                                        ↓
                                   JSON 结果输出
```