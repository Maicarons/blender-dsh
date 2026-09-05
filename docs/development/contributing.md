# 贡献指南

## 如何贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 开发规范

### 提交信息格式

```
<type>: <description>

feat:    新功能
fix:     修复
docs:    文档
chore:   构建/工具
refactor:重构
```

### 代码风格

- JavaScript: 使用 `var`，避免 ES6+ 特性（DSH 环境限制）
- Python: 遵循 PEP 8
- 添加适当的注释

## 本地测试

```bash
# 测试 Blender 连接
blender --background --python-expr "import bpy; print(bpy.app.version_string)"

# 运行示例
blender --background --python examples/basic_scene.py
```