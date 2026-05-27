# Legacy Canvas Demo 说明

旧版原生 Canvas 文件属于玩法验证 Demo，后续只作为逻辑参考，不作为正式 Cocos 实现。

## Legacy 范围

如果旧仓库中存在以下文件或目录，它们均属于 legacy：

- `game.js`
- `game.json`
- `js/core/*` 中的原生 Canvas 渲染、布局、资源管理代码
- `js/scenes/*` 中的原生 Canvas 场景
- `js/ui/*` 中的手写 Canvas UI 组件
- `assets/images/*` 中为 Canvas Demo 准备的临时素材位

## 之前尝试过的 Canvas 素材化改造

- AssetManager
- CanvasHelper
- DesignSystem
- Layout
- HomeScene 图片优先 + fallback 绘制

这些尝试证明：纯手写 Canvas 可以验证逻辑，但难以稳定实现目标 3D clay UI 质感。

## 后续建议

不建议继续在这些文件上投入 UI 调优。正式开发请在 Cocos Creator 项目中进行。
