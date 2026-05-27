# Cocos 下一步执行清单

## 第一步：新建项目

打开 Cocos Creator 3.8 LTS，新建 2D 项目。

项目名：`plant-cat-cocos`

## 第二步：导入目录

将本包中的以下目录复制进 Cocos 项目根目录：

- `assets/scripts`
- `assets/textures`
- `assets/audio`
- `docs`

## 第三步：创建场景

在 Cocos Creator 中创建：

- `Boot.scene`
- `Home.scene`
- `Study.scene`
- `Trade.scene`
- `Growth.scene`
- `Profile.scene`

## 第四步：先做 HomeScene

不要一次性做完全部页面。先把首页猫舍跑通：

- 用户状态卡
- 小猫展示
- 撸猫
- 喂罐头
- 种小猫
- 收获小猫
- Toast
- 罐头/亲密度更新

## 第五步：复用 UI 组件

HomeScene 稳定后，再复用 SoftButton、Toast、BottomNav、ProgressBar 搭建其他场景。
