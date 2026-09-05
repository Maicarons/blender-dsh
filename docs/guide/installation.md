# 安装指南

## 系统要求

| 组件 | 要求 |
|------|------|
| Blender | 4.0+（推荐 4.2+） |
| DeepSeek Harness | 最新版 |
| 操作系统 | Windows / Linux / macOS |
| 磁盘空间 | 约 500MB（Blender + 缓存） |

## 配置 Blender 路径

编辑 `src/dsh-plugin/host.js`：

```javascript
// Windows
const BLENDER_PATH = 'C:\\Program Files\\Blender Foundation\\Blender 4.2\\blender.exe';

// Linux
const BLENDER_PATH = '/usr/bin/blender';

// macOS
const BLENDER_PATH = '/Applications/Blender.app/Contents/MacOS/Blender';
```

## 输出目录

插件默认将渲染结果输出到项目下的 `output/` 目录：

```javascript
const OUTPUT_DIR = '/path/to/blender-dsh/output';
```

## 验证 Blender 可访问

```bash
blender --version
# 应显示 Blender 版本信息

blender --background --python-expr "import bpy; print(bpy.app.version_string)"
# 应显示版本号
```