# Plant Cat Cocos 2D

这是一个微信小程序项目。小程序源码位于 `miniprogram/`，云函数位于 `cloudfunctions/`。

## 用微信开发者工具打开

1. 克隆或下载本仓库到本地。
2. 打开微信开发者工具。
3. 选择“导入项目”。
4. “项目目录”请选择仓库根目录，也就是包含 `project.config.json` 的目录。
   - 正确：选择本仓库根目录
   - 不要直接选择 `miniprogram/`
5. AppID 可以使用项目配置里的 AppID；如果没有权限，可以先选择测试号或填写自己的 AppID。
6. 导入后确认项目类型是“小程序”。
7. 点击“编译”运行首页。

## 目录结构

```text
.
├── miniprogram/      # 小程序前端源码
├── cloudfunctions/   # 微信云开发云函数
├── assets/           # 原型和视觉资源
├── docs/             # 项目说明文档
├── scripts/          # 本地辅助脚本
├── src/              # Web 预览源码
└── project.config.json
```

## 关键配置

根目录的 `project.config.json` 已经设置：

```json
{
  "miniprogramRoot": "miniprogram/",
  "cloudfunctionRoot": "cloudfunctions/"
}
```

因此微信开发者工具会从 `miniprogram/` 读取小程序源码，并从 `cloudfunctions/` 读取云函数。

## 常见问题

- 如果导入后页面为空，通常是因为误选了 `miniprogram/` 子目录，请重新导入仓库根目录。
- 如果提示 AppID 无权限，请换成你自己的 AppID 或测试号。
- 当前项目不需要先安装 npm 依赖即可在微信开发者工具中预览。
- 首页入口通过场景里的实体热点进入，例如电视、书桌、猫、菜园、衣柜和窗户。
