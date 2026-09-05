# API 参考

## blender_execute

执行任意 Python 代码于 Blender 后台。

### 参数

| 参数 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `script` | string | ✅ | - | Python 代码 |
| `description` | string | ❌ | "" | 描述 |
| `timeout` | number | ❌ | 120000 | 超时(ms) |

### 可用模块

`bpy`, `bmesh`, `mathutils`, `math`, `json`, `sys`, `traceback`

### 输出格式

```json
{"status": "ok"}
{"status": "error", "error": "message", "traceback": "..."}
```

## blender_create

创建 3D 对象。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | ✅ | 对象类型 |
| `name` | string | ❌ | 名称 |
| `location` | [x,y,z] | ❌ | 位置 |
| `rotation` | [x,y,z] | ❌ | 旋转(弧度) |
| `scale` | [x,y,z] | ❌ | 缩放 |
| `size` | number | ❌ | 尺寸 |
| `radius` | number | ❌ | 半径 |
| `depth` | number | ❌ | 深度 |
| `vertices` | [[x,y,z]] | ❌ | 自定义网格顶点 |
| `faces` | [[i,...]] | ❌ | 自定义网格面 |

## blender_modify

修改对象。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `object` | string | ❌ | 目标对象 |
| `operation` | string | ✅ | 操作类型 |
| `location` | [x,y,z] | ❌ | 新位置 |
| `rotation` | [x,y,z] | ❌ | 新旋转 |
| `scale` | [x,y,z] | ❌ | 新缩放 |
| `modifier_type` | string | ❌ | 修改器类型 |
| `color` | [r,g,b,a] | ❌ | 颜色 |
| `metallic` | number | ❌ | 金属度 |
| `roughness` | number | ❌ | 粗糙度 |

## blender_scene

场景管理。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `operation` | string | ✅ | 操作类型 |
| `light_type` | string | ❌ | 灯光类型 |
| `light_energy` | number | ❌ | 光强 |
| `camera_location` | [x,y,z] | ❌ | 相机位置 |
| `camera_target` | [x,y,z] | ❌ | 相机目标 |
| `engine` | string | ❌ | CYCLES/EEVEE |
| `resolution_x` | int | ❌ | 宽度 |
| `resolution_y` | int | ❌ | 高度 |
| `samples` | int | ❌ | 采样数 |
| `export_format` | string | ❌ | OBJ/FBX/GLB/STL/PLY |

## blender_info

查询场景信息。

### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `query` | string | ✅ | 查询类型 |
| `object` | string | ❌ | 对象名 |