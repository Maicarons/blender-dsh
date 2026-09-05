# 使用流程

## 典型工作流

1. **清空场景** → `blender_scene operation:clear`
2. **创建对象** → `blender_create` 或 `blender_execute`
3. **修改材质** → `blender_modify operation:material`
4. **添加修改器** → `blender_modify operation:modifier`
5. **设置灯光和相机** → `blender_scene operation:light_add / camera_add`
6. **渲染** → `blender_scene operation:render`
7. **导出** → `blender_scene operation:export`

## 复杂模型

对于复杂模型，使用 `blender_execute` 直接编写 Python 脚本：

```
> 使用 blender_execute 生成一个 12 层公寓楼
```

AI 将生成完整的 Python 代码，利用 bpy 和 bmesh 构建复杂几何体。

## 错误处理

- 脚本执行失败时返回错误信息
- 超时自动终止进程
- 检查 `stdout` 和 `stderr` 获取详细日志