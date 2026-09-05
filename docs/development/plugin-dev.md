# 插件开发

## 添加新工具

使用 `harness.registerTool` 注册新工具：

```javascript
harness.registerTool(ctx, harness.defineTool({
  name: 'my_tool',
  description: '工具描述',
  parameters: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: '参数1' },
    },
    required: ['param1'],
  },
  output: {
    schema: { type: 'object' },
    render: function(_, v) {
      return [{ type: 'text', text: v.success ? 'OK' : 'FAIL' }];
    },
  },
  execute: async function(args) {
    // 调用 Blender 执行
    return await blenderExec(pythonScript, timeoutMs);
  },
}));
```

## 工具注册要点

- `name` 必须唯一
- `parameters.properties` 中每个属性必须有 `type`
- 所有 `object` 类型必须有 `additionalProperties: true`
- `output` 必须包含 `schema` 和 `render`

## 停止与更新

```javascript
// 停止插件
cordis_stop pluginId:"blnr-1"

// 更新插件（定义新 Package 后）
cordis_run pluginId:"blnr-1" packageId:"pkg-N" mode:"update"
```