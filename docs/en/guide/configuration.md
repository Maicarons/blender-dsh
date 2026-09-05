# Configuration

## Blender Path

In `src/dsh-plugin/host.js`:

```javascript
const BLENDER_PATH = '/usr/bin/blender';
const OUTPUT_DIR = '/home/user/blender-dsh/output';
```

## Timeout

- Default: 120s
- Max: 600s (10 minutes)
- Timeout auto-terminates the process

## Adding Tools

Use `harness.registerTool`:

```javascript
harness.registerTool(ctx, harness.defineTool({
  name: 'my_tool',
  description: 'Tool description',
  parameters: { type: 'object', ... },
  execute: async function(args) { ... },
}));
```

All tools auto-unregister when plugin stops.