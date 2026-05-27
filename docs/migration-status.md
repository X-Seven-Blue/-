# 迁移状态说明

当前技术方向已经从 **原生微信小游戏 Canvas 手写 UI** 切换为：

> **Cocos Creator 3.8 LTS + TypeScript + 微信小游戏发布 + 预渲染 3D PNG 素材 + Tween 动画 + 后续 Spine 动画**

## Canvas Demo 定位

原生 Canvas Demo 只作为玩法验证参考，不再作为正式开发主线。

后续不再继续优化原生 Canvas 的 UI、布局、AssetManager、CanvasHelper、HomeScene。正式项目应在 Cocos Creator 中新建，然后迁移玩法逻辑、数据结构、素材规范。

## 可复用内容

- 产品数据 mockData
- 玩法逻辑：撸猫、喂罐头、学习赚罐头、模拟交易、成长金说明、成就
- 文案
- 合规提示
- 部分状态管理思路

## 不再复用内容

- 手写 Canvas UI 系统
- 手写 Layout
- 手写 Button/Card/BottomNav
- 手写小猫和房间绘制
- 原生 Canvas 场景管理
