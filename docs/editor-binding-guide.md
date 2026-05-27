# Cocos 编辑器节点绑定指南

## Home.scene 推荐节点结构

```text
Canvas
  HomeRoot
    Background
    TopBar
      TitleLabel
      SubtitleLabel
    UserCard
      NicknameLabel
      DegreeLabel
      CanLabel
      IntimacyLabel
    RoomCard
      RoomSprite
      CatNode
        CatSprite
    CatInfoCard
      CatNameLabel
      CatDescLabel
      IntimacyProgress
        Bar
    Actions
      TouchButton
      FeedButton
      PlantButton
      HarvestButton
    ToastNode
    BottomNav
```

## 需要绑定到 HomeSceneController 的节点

- `canLabel: Label`
- `intimacyLabel: Label`
- `catNameLabel: Label`
- `catDescLabel: Label`
- `toast: Toast`
- `catController: CatController`
- `touchButton: SoftButton`
- `feedButton: SoftButton`
- `plantButton: SoftButton`
- `harvestButton: SoftButton`
- `intimacyProgress: ProgressBar`

## 操作说明

1. 在 Cocos Creator 中创建 UI 节点。
2. 把对应脚本拖到节点上。
3. 在 Inspector 面板中把 Label、Button、Sprite、子节点拖入脚本属性。
4. 先保证 HomeScene 跑通，再复制结构搭建其他场景。
