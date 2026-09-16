# Tsukuyomi（月读）

Tsukuyomi 是一款受《超时空辉夜姬！》官网视觉氛围启发的独立、非官方 Obsidian 主题。v0.2.0 将深海军蓝、海青与朱红边框、云纹、网点和抽象月轮带进工作区，提供「月读夜景」与「月白」两种模式。舞台装饰默认可见，正文仍保持清晰的纯色背景；也可以切换为简洁模式。

项目不包含人物插画、官方图片、Logo、音乐或字体，不加载远程资源。

主题覆盖阅读视图、实时预览与源码模式，并为工作区、文件树、属性、提示块、代码、表格、搜索、命令面板、Canvas、关系图和 Bases 提供基础配色。主题不会转换或改写笔记内容。

![Tsukuyomi v0.2.0 月读夜景](docs/screenshots/19-stage-dark-home.jpg)

![Tsukuyomi v0.2.0 月白](docs/screenshots/20-stage-light-home.jpg)

检查结果与未测项目见 [验收记录](docs/VALIDATION.md)。其中 v0.1.0 的历史验收结果不代表 v0.2.0 已通过相同检查。

## 安装

需要 Obsidian `1.13.7` 或更高版本。

手动安装：

1. 下载或构建 `dist/Tsukuyomi/`。
2. 将整个 `Tsukuyomi` 目录复制到所选库的 `.obsidian/themes/Tsukuyomi/`，确保其中包含 `manifest.json` 和 `theme.css`。
3. 在 Obsidian 打开「设置 → 外观」，将主题切换为 `Tsukuyomi`。

回退时，在「设置 → 外观」重新选择默认主题即可；笔记不会被修改。

## 本地开发

需要 Node.js 22 或更高版本。

```sh
npm ci
npm test
npm run lab
```

`npm ci` 安装两个仅用于开发检查的解析器：`css-tree` 和 `yaml`；主题运行时没有依赖。`npm run build` 只使用 Node.js，将 `src/` 合并为根目录 `theme.css`，把 `assets/stage-clouds.svg` 中的原创云纹内嵌为数据 URL，并生成 `dist/Tsukuyomi/`。安装时无需另行复制图片。

`npm run lab` 只会构建并安装到项目内固定的 `lab/Tsukuyomi Lab/`，不接受其他库路径。执行后，在 Obsidian 中通过“打开文件夹作为库”打开这个现有实验库，再从「设置 → 外观」选择 `Tsukuyomi`。

## 可选设置

主题无需插件即可显示完整舞台风格。安装社区插件 Style Settings 后，可以调整以下五项：

- `tk-minimal`：简洁模式，默认关闭；启用后隐藏舞台装饰。
- `tk-reading-width`：正文最大宽度，默认 `44rem`。
- `tk-density`：标准或紧凑界面密度。
- `tk-decoration-opacity`：侧栏网点与空白页月环的透明度，默认 `0.12`；其他装饰通过简洁模式关闭。
- `tk-enable-motion`：默认关闭。启用后提供 `140ms` 的颜色、边框和阴影过渡；系统开启减少动态效果时不播放。

空白标签页默认显示抽象月轮。要在一篇笔记的阅读视图中使用带月轮、云纹与斜线的首页标题，将以下属性加入笔记；普通笔记无需添加：

```yaml
---
cssclasses: [tk-home]
---
```

这一首页布局装饰阅读视图中的一级标题，不改写笔记内容或编辑器结构。可直接在实验库的「00-欢迎来到月读」中查看。

另提供两类原创提示块：`[!tsukuyomi]` 和 `[!stage]`。

设计说明见 [docs/DESIGN.md](docs/DESIGN.md)，资料依据见 [docs/SOURCES.md](docs/SOURCES.md)，实际检查范围与未验证项见 [docs/VALIDATION.md](docs/VALIDATION.md)。目前不作移动端实机验证声明。
