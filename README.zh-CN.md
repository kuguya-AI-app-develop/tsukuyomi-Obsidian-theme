# Tsukuyomi（月读）

[English](README.md) · 简体中文

受《超时空辉夜姬！》月读空间启发的非官方 Obsidian 主题。**1.2.0** 将墨蓝夜景、海青灯光与和风街景带入工作区，为中文长文保留安静的阅读空间。

An unofficial Obsidian theme inspired by Tsukuyomi from *Cosmic Princess Kaguya!*, with dark and light modes, calm reading surfaces, and an animated empty view.

![Tsukuyomi 深色阅读界面](screenshot.jpg)

## 特点

- **深浅双模式**：「月读夜景」与「月白」，跟随 Obsidian 外观设置。
- **适合中文阅读**：正文使用不透明纯色背景，默认宽度 `40rem`、行高 `1.75`，保留用户字体与字号；覆盖阅读、实时预览及源码视图。
- **月读空白页**：静止的城市和鸟居、独立菜单、四位矢量伙伴与游动骨架鱼。装饰仅占用空白页和界面边缘，不铺在正文或文件名背后。
- **紧凑手机布局**：保留舞台、操作菜单与缩小的侧栏铭牌，为原生顶部和底部控件留出空间，并移除空文件工具栏的装饰边框。
- **离线使用**：安装产物只有 `theme.css` 与 `manifest.json`。SVG 资源已内嵌，不运行 JavaScript，无运行时依赖，也无需安装插件。

桌面空白页预览：[深色](docs/screenshots/55-sidebar-stripe-v0.7.2.jpg) · [浅色](docs/screenshots/54-fox-native-v0.7.1.jpg)。两图拍摄于 2026-09-16 的发布前版本，桌面视觉设计保持不变。

## 安装

需要 **Obsidian 1.13.7 或更高版本**。[官网条目](https://community.obsidian.md/themes/tsukuyomi)已发布，但截至 **2026-09-16 16:37（北京时间）**，Obsidian 1.13.7 使用的客户端目录尚未包含 Tsukuyomi。客户端搜索和 **Add to Obsidian** 都依赖该列表，同步期间请先手动安装。

确认同步后，打开 Obsidian「**设置 → 外观 → 主题 → 管理**」，搜索 **Tsukuyomi**。同步窗口与跟进状态见[发布记录](docs/PUBLISHING.md)。

手动安装步骤：

1. 从 [1.2.0 Release](https://github.com/kuguya-AI-app-develop/tsukuyomi-Obsidian-theme/releases/tag/1.2.0) 下载 `Tsukuyomi-1.2.0.zip`。
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
| 界面密度 | 标准 | 桌面端在标准与紧凑布局之间切换；移动端保留原生触控间距 |
| 场景透明度 | `0.70` | 调整空白页装饰，范围 `0–1` |
| 静态场景 | 关闭 | 使用静态素材，停止界面过渡、导航回弹与文章入场 |

持续装饰动效只在窗口和窗格均至少为 `320 × 480` 的活动空白页播放，包含紧凑布局。系统开启减少动态效果、使用静态场景或切换到非活动窗格时，显示静态版本；简洁模式、打印或窗口/窗格低于该尺寸时隐藏场景，保留原生操作。建筑保持静止，笔记内容在下述短暂入场结束后保持静止。

从早期版本升级时，Style Settings 已保存的值会保留；旧 `tk-enable-motion` 已由 `tk-disable-motion` 取代，需要静态效果时请启用“静态场景”。

## Mermaid 图表

1.0.5 增加图表滚动容器：超宽图可以横向滚动，不强行压缩文字来适应正文宽度；Mermaid 自身的 `useMaxWidth` 等内联尺寸约束仍然有效。流程图、时序图和状态图使用主题的深浅配色；类图、ER 图等其他类型保留原生配色。节点位置和连线路径仍由 Mermaid 决定，不新增 JavaScript 或插件。

使用 Mermaid `theme` 或 `themeVariables` 自定义整张图配色时，可在笔记顶部添加以下属性，保留原生图表配色，同时继续使用滚动容器：

```yaml
---
cssclasses:
  - tk-mermaid-original
---
```

已有 `cssclasses` 时，将此项合并到原列表中。这是单篇笔记选项，不属于五项 Style Settings 设置。已测项目及限制见 [验收记录](docs/VALIDATION.md)。

## 交互细节

**1.2.0 更新**：选中文件和模块标签时，内部文字或图标增加 `520ms` 果冻回弹，展开文件夹时也会轻弹其名称。左右侧栏选中的模块图标使用更明显的 `600ms` 回弹，涵盖文件、搜索、书签、大纲和反向链接等标签，点击区域保持原位。新建笔记视图、恢复被隐藏的普通标签页，以及切换阅读与编辑视图时，文章以 `460ms` 从下方 `14px` 上移，透明度由 `0.3` 恢复至 `1`。

同一标签内换文件可能复用原视图，因此不保证触发入场；点击已经可见的分栏或堆叠窗格不会重播。主题仅使用 CSS，无法控制旧视图移除时机，因此没有离场交叉淡化。输入和滚动不会触发文章入场。“**静态场景**”、系统减少动态效果以及打印会关闭这些新动效。

菜单保留危险操作的警示颜色与禁用状态，普通菜单项和建议项被键盘选中时增加海青内描边。紧凑密度仅作用于桌面端。阅读视图中的宽表格可在容器内横向滚动，实时预览保留 Obsidian 原生表格组件。

需要表格行定位辅助时，可添加以下笔记属性：

```yaml
cssclasses: [tk-table-guide]
```

已有 `cssclasses` 时合并到原列表中。启用后，桌面鼠标悬停或行内控件获得焦点时会轻微突出所在行，同时使用等宽数字。默认不启用，也不新增 Style Settings 选项。设计依据见 [交互参考](docs/UX-REFERENCES.md)。

## 兼容范围

真实应用检查环境为 **macOS 上的 Obsidian 1.13.7**，包含 1.0.3 的六页 PDF 样例及修改前后分页、文本完整性对比。Windows、Linux 和移动端尚未实机验证；中文输入法组合输入、Style Settings 面板、其他打印场景和长期性能等仍有未测项目。默认配色检查不涵盖任意用户配色或全部第三方插件。

1.0.4 的手机布局修复依据用户的 iPhone 14 Pro 截图反馈。桌面浏览器在 `393 × 852`、`375 × 667`、`320 × 568`、`430 × 932` 四种视口下，使用本机 Obsidian 1.13.7 CSS 与模拟 DOM 的检查已通过。这不等同于原生 iOS 验收，仍需用户在真机复核；实际系统减少动态效果切换、移动编辑、键盘、触摸手势、耗电、iPad 和 Android 尚未测试。

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

[贡献指南](CONTRIBUTING.md) · [更新日志](CHANGELOG.md) · [设计说明](docs/DESIGN.md) · [发布与社区目录流程](docs/PUBLISHING.md)
