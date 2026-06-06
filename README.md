# Plant Cat Cocos 2D 小程序

这是一个微信小程序项目，当前小程序源码在 `miniprogram/` 目录下。

## 用微信开发者工具打开

1. 克隆或下载本仓库到本地。
2. 打开微信开发者工具。
3. 选择「导入项目」。
4. 「项目目录」请选择仓库根目录，也就是包含 `project.config.json` 的目录。
   - 正确：选择 `plant-cat-cocos_2D/`
   - 不要直接选择 `plant-cat-cocos_2D/miniprogram/`
5. AppID 可以使用项目配置里的 AppID；如果没有权限，可先选择测试号或填写你自己的 AppID。
6. 导入后确认项目类型是「小程序」。
7. 点击「编译」运行首页。

## 关键配置

根目录的 `project.config.json` 已经设置：

```json
{
  "miniprogramRoot": "miniprogram/"
}
```

所以微信开发者工具会从 `miniprogram/` 目录读取小程序源码。

## 常见问题

- 如果导入后页面为空，通常是因为误选了 `miniprogram/` 子目录，请重新导入仓库根目录。
- 如果提示 AppID 无权限，请换成你自己的 AppID 或测试号。
- 当前项目不需要先安装 npm 依赖。
- 首页入口改为点击场景里的实物热区，例如电视、书桌、猫咪、菜园、衣柜和窗户。
