# Tsukuyomi（月读）

[English](README.md) · 简体中文

受《超时空辉夜姬！》月读空间启发的非官方 Obsidian 主题。**1.0.2** 将墨蓝夜景、海青灯光与和风街景带入工作区，为中文长文保留安静的阅读空间。

An unofficial Obsidian theme inspired by Tsukuyomi from *Cosmic Princess Kaguya!*, with dark and light modes, calm reading surfaces, and an animated empty view.

![Tsukuyomi 深色阅读界面](screenshot.jpg)

## 特点

- **深浅双模式**：「月读夜景」与「月白」，跟随 Obsidian 外观设置。
- **适合中文阅读**：正文使用不透明纯色背景，默认宽度 `40rem`、行高 `1.75`，保留用户字体与字号；覆盖阅读、实时预览及源码视图。
- **月读空白页**：静止的城市和鸟居、独立菜单、四位矢量伙伴与游动骨架鱼。装饰仅占用空白页和界面边缘，不铺在正文或文件名背后。
- **离线使用**：安装产物只有 `theme.css` 与 `manifest.json`。SVG 资源已内嵌，不运行 JavaScript，无运行时依赖，也无需安装插件。

空白页预览：[深色](docs/screenshots/55-sidebar-stripe-v0.7.2.jpg) · [浅色](docs/screenshots/54-fox-native-v0.7.1.jpg)。两图拍摄于 2026-09-16 的发布前版本，1.0 系列沿用其视觉设计。

## 安装

需要 **Obsidian 1.13.7 或更高版本**。主题已在[官方社区目录](https://community.obsidian.md/themes/tsukuyomi)公开。打开 Obsidian「**设置 → 外观 → 主题 → 管理**」，搜索 **Tsukuyomi** 并安装；也可点击目录页的 **Add to Obsidian**。

如需手动安装：

1. 从 [1.0.2 Release](https://github.com/kuguya-AI-app-develop/tsukuyomi-Obsidian-theme/releases/tag/1.0.2) 下载 `Tsukuyomi-1.0.2.zip`。
2. 将压缩包中的 `Tsukuyomi` 文件夹解压到目标笔记库的 `.obsidian/themes/`，确认其中包含 `manifest.json` 和 `theme.css`。
3. 打开 Obsidian「设置 → 外观」，选择 **Tsukuyomi**。

也可下载单独的 `manifest.json` 和 `theme.css` 附件，放入 `.obsidian/themes/Tsukuyomi/`。

升级时替换同目录下的两个文件，再重新选择主题。停用时切换回默认主题即可，笔记内容不会被修改。

## 可选设置

默认无需插件。安装社区插件 **Style Settings** 后，可调整五项设置：

| 设置 | 默认值 | 用途 |
| --- | --- | --- |
| 简洁模式 | 关闭 | 隐藏招牌、装饰边框与空白页场景 |
| 正文宽度 | `40rem` | 调整正文最大宽度 |
| 界面密度 | 标准 | 在标准与紧凑布局之间切换 |
| 场景透明度 | `0.70` | 调整空白页装饰，范围 `0–1` |
| 静态场景 | 关闭 | 使用静态鱼与伙伴，停止装饰动效和界面过渡 |

动效只在空间足够的活动空白页播放。系统开启减少动态效果、使用静态场景或切换到非活动窗格时，显示静态版本；简洁模式、窄小窗格和打印环境隐藏场景。建筑与笔记内容始终静止。

从早期版本升级时，Style Settings 已保存的值会保留；旧 `tk-enable-motion` 已由 `tk-disable-motion` 取代，需要静态效果时请启用“静态场景”。

## 兼容范围

真实应用检查环境为 **macOS 上的 Obsidian 1.13.7**。Windows、Linux 和移动端尚未实机验证；中文输入法组合输入、Style Settings 面板、打印/PDF 和长期性能等仍有未测项目。默认配色检查不涵盖任意用户配色或全部第三方插件。

实际检查项目、截图及限制见 [验收记录](docs/VALIDATION.md)。

## 本地开发

需要 Node.js 22.9.0 或更高版本。

```sh
npm ci
npm test
npm run lint
npm run lab
```

`npm run build` 生成根目录 `theme.css` 和 `dist/Tsukuyomi/`。`npm run lab` 只安装到项目内的 `lab/Tsukuyomi Lab/`。修改鱼或伙伴素材后，分别运行 `node scripts/generate-fish.mjs`、`node scripts/generate-mascots.mjs`，再运行检查；构建会拒绝过期的生成资产。开发依赖不进入安装产物。

`npm run lint` 使用 Obsidian 官方 Stylelint 配置及项目兼容调整，详见 [样式检查说明](docs/LINT.md)。本地检查不代表已通过社区目录审核。

## 访问与授权

本主题由 [ArisaTaki](https://github.com/ArisaTaki) 以个人粉丝创作方式维护，通过公开 GitHub 仓库免费、非营利分发，不设广告、收费或捐赠入口。维护者有权许可的原创软件代码采用 [MIT License](LICENSE)；原作角色设计、商标及其他第三方权益不在该许可范围内。

本项目与 Obsidian 及原作权利方无官方关联。角色矢量属于二次创作，官方图片、Logo、音乐和字体不进入主题安装包；素材权利说明见 [NOTICE](NOTICE.md)，参考来源见 [资料依据](docs/SOURCES.md)。`docs/` 中的参考 HTML 可能访问外部图片，仅供开发研究，主题运行时不使用这些页面。

[更新日志](CHANGELOG.md) · [设计说明](docs/DESIGN.md) · [发布与社区目录流程](docs/PUBLISHING.md)
