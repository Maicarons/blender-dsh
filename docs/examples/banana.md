# 香蕉模型

使用 Blender 程序化生成香蕉 3D 模型。

## 对话示例

```
> 使用 blender_execute 创建一个香蕉模型，黄色材质，带柄，渲染出图
```

## 生成方法

- 圆柱体 + Simple Deform 弯曲修改器
- Subdivision Surface 平滑
- 黄色 PBR 材质 + 棕色柄部材质
- Cycles 渲染

## 查看结果

- `.blend` 文件: `output/banana.blend`
- 渲染图: `output/banana_render.png`