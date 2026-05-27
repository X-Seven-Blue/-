# 给 Codex 的后续提示词

当你已经用 Cocos Creator 新建好正式项目后，把下面这段发给 Codex：

```text
现在这是一个由 Cocos Creator 创建的正式项目，不是原生 Canvas Demo。

请在当前 Cocos Creator 项目中继续完善 TypeScript 脚本和 HomeScene 逻辑，不要手写 .scene 或 .meta 文件，不要破坏 Cocos 自动生成的项目结构。

优先完成：
1. HomeSceneController 节点绑定逻辑。
2. CatController 的 idle / happy / eat 动画。
3. StorageManager 本地存档。
4. Toast 提示。
5. SoftButton 点击反馈。
6. RewardFly 罐头飞入动画。

不要使用 DOM、document、window。
不要创建 WXML/WXSS/pages/app.json。
保持 Cocos Creator 3.x TypeScript 写法。
```
