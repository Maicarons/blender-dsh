# blender_scene

场景管理，包括灯光、相机、渲染和导出。

## 操作类型

### clear — 清空场景
删除所有对象、网格、材质、灯光和相机。

### light_add — 添加灯光
| 参数 | 类型 | 说明 |
|------|------|------|
| `light_type` | string | POINT / SUN / SPOT / AREA |
| `light_energy` | number | 光照强度 |
| `light_color` | [r,g,b] | 灯光颜色 |

### camera_add — 添加相机
| 参数 | 类型 | 说明 |
|------|------|------|
| `camera_location` | [x,y,z] | 相机位置 |
| `camera_target` | [x,y,z] | 目标点 |
| `camera_lens` | number | 焦距 (mm) |

### ground_add — 添加地面
| 参数 | 类型 | 说明 |
|------|------|------|
| `size` | number | 地面大小 |
| `color` | [r,g,b,a] | 地面颜色 |

### render — 渲染
| 参数 | 类型 | 说明 |
|------|------|------|
| `output_path` | string | 输出路径 |
| `engine` | string | CYCLES / EEVEE |
| `resolution_x` | integer | 渲染宽度 |
| `resolution_y` | integer | 渲染高度 |
| `samples` | integer | 采样数 |
| `transparent` | boolean | 透明背景 |

### render_settings — 渲染设置
与 render 参数相同，但不触发渲染。

### world_set — 世界环境
| 参数 | 类型 | 说明 |
|------|------|------|
| `world_color` | [r,g,b] | 世界背景颜色 |

### export — 导出
| 参数 | 类型 | 说明 |
|------|------|------|
| `export_format` | string | OBJ / FBX / GLB / STL / PLY |
| `export_path` | string | 导出路径 |