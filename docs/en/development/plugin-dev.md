# Plugin Development

## Adding Tools

Use `harness.registerTool`:

```javascript
harness.registerTool(ctx, harness.defineTool({
  name: 'my_tool',
  description: 'Tool description',
  parameters: { type: 'object', properties: { ... } },
  output: { schema: { type: 'object' }, render: function(_, v) { ... } },
  execute: async function(args) { ... },
}));
```

## Key Points

- `name` must be unique
- Every property must have `type`
- All `object` types need `additionalProperties: true`
- `output` must have `schema` and `render`

## Stop & Update

```javascript
cordis_stop pluginId:"blnr-1"
cordis_run pluginId:"blnr-1" packageId:"pkg-N" mode:"update"
```