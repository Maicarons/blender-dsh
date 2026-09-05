# blender_execute

执行任意 Python 代码于 Blender 后台模式。

## 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `script` | string | ✅ | - | Python 代码 |
| `description` | string | ❌ | "" | 描述（日志用） |
| `timeout` | number | ❌ | 120000 | 超时毫秒 |

## 可用的 Python 模块

- `bpy` — Blender Python API
- `bmesh` — 网格编辑
- `mathutils` — Vector, Matrix, Euler, Quaternion
- `math`, `json`, `random`, `os`, `sys` — 标准库

## 示例

### 创建猴子头
```python
import bpy
bpy.ops.mesh.primitive_monkey_add(size=2)
```

### 程序化地形
```python
import bpy, bmesh, math, random
bm = bmesh.new()
for i in range(50):
    for j in range(50):
        x = (i/50-0.5)*20
        y = (j/50-0.5)*20
        z = math.sin(x*0.5)*math.cos(y*0.5)*2
        bm.verts.new((x, y, z))
# ... 构建网格
```

### 输出 JSON 结果
```python
import json
print(json.dumps({"status":"ok", "object": "MyObject"}))
```