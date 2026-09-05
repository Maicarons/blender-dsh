# 配置

## Blender 路径

在 `src/dsh-plugin/host.js` 中配置：

```javascript
const BLENDER_PATH = 'G:\\SteamLibrary\\steamapps\\common\\Blender\\blender.exe';
const OUTPUT_DIR = 'G:\\GitHub\\blender-dsh\\output';
```

## 超时设置

每个工具调用都有超时保护：

- 默认超时：120 秒
- 最大超时：600 秒（10 分钟）
- 超时后进程自动终止

渲染大型场景时建议增加超时时间。

## 添加更多工具

插件使用 `harness.registerTool` 注册工具。

```javascript
harness.registerTool(ctx, harness.defineTool({
  name: 'my_custom_tool',
  description: '描述',
  parameters: { type: 'object', properties: { ... } },
  execute: async function(args) { ... },
}));
```

所有工具在插件停止或更新时自动注销。