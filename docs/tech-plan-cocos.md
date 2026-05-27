# 种小猫 Cocos Creator 技术方案

## 1. 为什么不继续原生 Canvas 手写 UI

原生 Canvas 可以快速验证玩法，但需要自行维护布局、按钮、资源、动画、状态切换、触摸命中和适配系统。对于“3D clay 治愈风”目标，手写 Canvas 很难稳定达到高质感 UI。

## 2. 为什么选择 Cocos Creator 3.8 LTS

Cocos Creator 更适合小游戏项目：

- 可视化搭建 UI 和场景
- TypeScript 脚本清晰
- Tween、粒子、音频、资源管理成熟
- 支持微信小游戏发布
- 后续可接入 Spine、分包和远程资源

## 3. 项目目录建议

```text
assets/
  scenes/
  textures/
    bg/
    cats/
    icons/
    badges/
  audio/
  scripts/
    core/
    data/
    ui/
    cat/
    scenes/
docs/
```

## 4. 场景划分

- BootScene：启动、Logo、加载
- HomeScene：猫舍主场景
- StudyScene：学习赚罐头
- TradeScene：实验田模拟交易
- GrowthScene：成长金说明
- ProfileScene：我的、成就、小猫图鉴

## 5. 核心脚本设计

- `GameManager.ts`：全局入口与状态协调
- `SceneRouter.ts`：场景切换
- `StorageManager.ts`：本地存档
- `AudioManager.ts`：音效管理
- `EventBus.ts`：事件通信
- `CatController.ts`：小猫动画与状态表现
- `CatStateMachine.ts`：小猫状态机
- `BottomNav.ts`：底部导航
- `Toast.ts`：统一提示
- `RewardFly.ts`：罐头飞入动画

## 6. 美术素材规范

采用预渲染 3D PNG / WebP 素材：

- 首页房间背景：非透明背景图
- 小猫状态：透明 PNG
- 图标/徽章：透明 PNG
- 后续主角动画：可升级 Spine

## 7. 动画方案

- MVP：Cocos Tween + PNG 状态切换
- Beta：少量序列帧动画
- 正式版：主角小猫升级 Spine 骨骼动画

## 8. 微信小游戏发布注意事项

- 控制主包体积
- 大图、音频、多猫皮肤做 Asset Bundle
- 首屏只加载 HomeScene 必须资源
- 避免一次性加载所有小猫、徽章和课程素材

## 9. MVP 开发计划

1. 搭建 Cocos 项目
2. 实现 HomeScene
3. 接入小猫素材
4. 实现 StudyScene
5. 实现 TradeScene
6. 实现 GrowthScene
7. 实现 ProfileScene
8. 发布微信小游戏测试

## 10. 保留现有产品逻辑

- 撸猫
- 喂罐头
- 种小猫
- 学习赚罐头
- 模拟交易
- 成长金合规说明
- 成就
- 小猫图鉴
