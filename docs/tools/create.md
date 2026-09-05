# blender_create

一键创建 3D 对象。

## 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | ✅ | 对象类型 |
| `name` | string | ❌ | 对象名称 |
| `location` | [x,y,z] | ❌ | 位置 |
| `rotation` | [x,y,z] | ❌ | 旋转（弧度） |
| `scale` | [x,y,z] | ❌ | 缩放 |
| `size` | number | ❌ | 尺寸 |
| `radius` | number | ❌ | 半径 |
| `depth` | number | ❌ | 深度/高度 |

## 支持的类型

| 类型 | 说明 | 关键参数 |
|------|------|----------|
| `cube` | 立方体 | size |
| `sphere` / `uv_sphere` | UV 球体 | radius |
| `cylinder` | 圆柱体 | radius, depth |
| `cone` | 圆锥 | radius, depth |
| `torus` | 环面 | radius, minor_radius |
| `ico_sphere` | 二十面球体 | radius, subdivisions |
| `monkey` | 猴头 (Suzanne) | size |
| `plane` | 平面 | size |
| `circle` | 圆环 | radius |
| `grid` | 网格平面 | size, grid_columns, grid_rows |
| `text` | 3D 文字 | text_content, depth |
| `bezier_curve` | 贝塞尔曲线 | - |
| `custom_mesh` | 自定义网格 | vertices, faces |

## 示例

```
> blender_create type:cube size:2 location:[0,0,1]
> blender_create type:sphere radius:1.5 color:[1,0,0]
```

自定义网格：
```
> blender_create type:custom_mesh
  vertices:[[-1,-1,0],[1,-1,0],[1,1,0],[-1,1,0]]
  faces:[[0,1,2,3]]
```