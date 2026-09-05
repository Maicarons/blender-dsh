# blender_modify

修改现有 3D 对象。

## 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `object` | string | ❌ | 目标对象名（默认: 活动对象） |
| `operation` | string | ✅ | 操作类型 |

## 操作类型

### transform — 变换
| 参数 | 类型 | 说明 |
|------|------|------|
| `location` | [x,y,z] | 新位置 |
| `rotation` | [x,y,z] | 新旋转（弧度） |
| `scale` | [x,y,z] | 新缩放 |

### modifier — 修改器
| 参数 | 类型 | 说明 |
|------|------|------|
| `modifier_type` | string | SUBSURF, MIRROR, ARRAY, BEVEL, SOLIDIFY, DISPLACE, DECIMATE, WIREFRAME 等 |
| `modifier_settings` | object | 修改器参数 |
| `apply_modifier` | boolean | 是否永久应用 |

### material — 材质
| 参数 | 类型 | 说明 |
|------|------|------|
| `color` | [r,g,b,a] | 基础颜色 (0-1) |
| `metallic` | number | 金属度 0-1 |
| `roughness` | number | 粗糙度 0-1 |
| `emission_color` | [r,g,b] | 自发光颜色 |
| `emission_strength` | number | 自发光强度 |

### boolean — 布尔运算
| 参数 | 类型 | 说明 |
|------|------|------|
| `tool_object` | string | 工具对象名称 |
| `boolean_operation` | string | UNION / DIFFERENCE / INTERSECT |

### 其他操作
- `shade_smooth` / `shade_flat` — 平滑/平直着色
- `join` — 合并选中对象
- `duplicate` — 复制（带偏移）
- `delete` — 删除
- `origin_set` — 原点归到几何中心