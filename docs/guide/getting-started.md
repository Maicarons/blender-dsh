# 快速开始

## 前提条件

1. **Blender 4.0+** 已安装
2. **DeepSeek Harness (DSH)** 正在运行

## 安装插件

### 方法一：动态插件（推荐）

在 DSH 会话中使用 `cordis_define` 工具：

```javascript
// 1. 用 cordis_define 创建新插件
// plugin: { kind: "new", idPrefix: "blnr" }
// 传入 src/dsh-plugin/host.js 和 client.js 的代码

// 2. 用 cordis_run 激活
// 插件注册 5 个工具，立即可用
```

### 方法二：Agent 预设

```bash
# 复制预设到 DSH 用户目录
cp -r preset/ ${DSH_HOME:-$HOME/.dsh}/.agent-presets/blender/

# 启动 DSH 时选择 blender 预设
```

## 验证安装

在 DSH 中询问 AI：
```
> 查询当前 Blender 场景信息
```

AI 将调用 `blender_info` 工具返回场景状态。

## 下一步

- 查看[工具参考](/tools/overview)了解每个工具的参数
- 查看[示例](/examples/basic-scene)获取完整使用案例
- 阅读[配置指南](/guide/configuration)调整路径设置