# Quick Start

## Prerequisites

1. **Blender 4.0+** installed
2. **DeepSeek Harness (DSH)** running

## Installation

### Method 1: Dynamic Plugin (Recommended)

Use `cordis_define` in your DSH session:

```javascript
// 1. Create new plugin with cordis_define
// plugin: { kind: "new", idPrefix: "blnr" }
// Provide host.js and client.js code from src/dsh-plugin/

// 2. Activate with cordis_run
```

### Method 2: Agent Preset

```bash
cp -r preset/ ${DSH_HOME:-$HOME/.dsh}/.agent-presets/blender/
```

## Verify

Ask the AI:
```
> Query the current Blender scene
```

The AI will call `blender_info` tool.

## Next

- See [Tool Reference](/en/tools/overview)
- Check [Examples](/en/examples/basic-scene)
- Read [Configuration](/en/guide/configuration)