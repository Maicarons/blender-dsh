# Workflow

## Typical Flow

1. **Clear scene** → `blender_scene operation:clear`
2. **Create objects** → `blender_create` or `blender_execute`
3. **Modify materials** → `blender_modify operation:material`
4. **Add modifiers** → `blender_modify operation:modifier`
5. **Setup lights & camera** → `blender_scene`
6. **Render** → `blender_scene operation:render`
7. **Export** → `blender_scene operation:export`

## Complex Models

Use `blender_execute` for complex procedural generation:

```
> Use blender_execute to generate a 12-story apartment building
```

## Error Handling

- Failed scripts return error messages
- Timeout auto-terminates processes
- Check stdout/stderr for detailed logs