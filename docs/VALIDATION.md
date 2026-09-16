# 验收记录 · 0.1.0

日期：2026-09-16。结论：已交付可构建、可安装的首版，自动检查通过，完成 macOS 桌面冒烟检查。仍有下表所列未测场景，不视为全面兼容认证。

## 环境与边界

- Node.js 24.15.0，npm 11.12.1。
- 实际运行 Obsidian **1.13.7**；安装程序版本 1.7.7 是外壳版本，不是本次应用版本。
- 仅在本项目 `lab/Tsukuyomi Lab/` 操作；实验库未安装社区插件，Style Settings 不在场。
- 初版验收时未修改主力库的文件或配置，未安装/升级 Obsidian，也未提交 Git 或发布主题。后续仓库创建与推送遵循用户另行授权，详见 `PROJECT.md`。

## 自动检查

实际执行了 `npm test`、`npm run lab`、`node --check scripts/check.mjs`。最终检查输出见 [checks.txt](checks.txt)。构建产物约 23.1 KiB，无运行时依赖。

覆盖 manifest、八层 CSS 的确定性构建与分发一致性、CSS 解析、五项设置的 YAML 配置、主题变量引用、1.13 完整颜色格式、资源与动效限制，以及默认色板的对比度。

CSS 解析器确认 74 项可静态判定的属性值；121 项动态属性值跳过通用词法匹配，关键颜色变量另行解析。不能把此检查等同于浏览器完整计算样式验证。

默认色板的实测计算值（取所检查背景/状态的最小值）：

| 项目 | 深色 | 浅色 | 阈值 |
| --- | ---: | ---: | ---: |
| 正文 | 13.42 | 10.93 | 4.5 |
| 次要文字 | 7.60 | 4.93 | 4.5 |
| 内部链接 | 9.84 | 5.42 | 4.5 |
| 强调按钮 | 9.84 | 5.91 | 4.5 |
| 选中文字 | 8.62 | 7.83 | 4.5 |
| 标签及悬停 | 5.44 | 4.75 | 4.5 |
| 提示块标题 | 6.21 | 4.64 | 4.5 |
| 提示块中的链接 | 5.92 | 4.84 | 4.5 |
| 焦点边框 | 8.74 | 5.09 | 3.0 |

以上不涵盖用户任意自选强调色、第三方插件、全部嵌套/透明状态。对比度算法使用标准相对亮度和 alpha 合成，色彩混合按主题使用的 sRGB 处理。

另在项目内隔离夹具中验证了根 CSS 文件和 dist 目录为符号链接时构建会拒绝写入，目标哨兵文件保持不变。夹具位于 `tmp/build-safety-ytsx80h6/`，不随主题分发。

## 真实桌面检查

通过 Computer Use 操作 Obsidian，以下均来自真实应用界面，不是网页模拟。

| 场景 | 实际结果与证据 |
| --- | --- |
| 安装、主题选择、无插件默认值 | 已加载 Tsukuyomi；[设置截图](screenshots/01-theme-settings.jpg) |
| 深浅阅读视图 | [最终深色](screenshots/17-final-dark.jpg)、[最终浅色](screenshots/16-final-light.jpg) |
| 深浅实时预览 | [深色](screenshots/04-dark-live-preview.jpg)、[浅色](screenshots/07-light-live-preview.jpg)，检查中文、属性和提示块的可见布局 |
| 深浅源码模式 | [深色](screenshots/05-dark-source.jpg)、[浅色](screenshots/06-light-source.jpg)，Markdown 和前置属性可见 |
| 中文混排粘贴与撤销 | 编辑器中粘贴中文、English 和标点后撤销，确认验收标记未留在笔记中；不等同于中文 IME 组合输入验收 |
| 代码块 | [浅色截图](screenshots/09-light-code.jpg)，语法色与边界可见；没有据此声称所有长行横向滚动均通过 |
| 命令面板、快速切换、搜索 | [面板](screenshots/10-light-command-palette.jpg)、[切换器](screenshots/11-light-switcher.jpg)、[搜索](screenshots/13-light-search.jpg)；实验库搜索“月光”返回 52 项结果 |
| 中文长文滚动 | [浅色长文](screenshots/12-light-long-text.jpg)，完成多页滚动；未采集性能基准 |
| Canvas、Bases | [Canvas](screenshots/14-light-canvas.jpg)、[Bases](screenshots/15-light-bases.jpg)，样本可打开，卡片与 9 行索引正常显示；不包含拖拽等全部操作 |
| 默认亮海青按钮 | [深色主要按钮](screenshots/18-dark-primary-button.jpg)的文字为深色；只打开导出设置弹窗，未执行 PDF 导出 |

1.13 原生强调色的代码核对结论见 [native-color-reference.txt](native-color-reference.txt)。按钮遵守原生文字变量，且保留默认亮色按钮的深色文字。自定义主题色的所有组合未进行 GUI 穷举。

## 未完成的验收

- Style Settings 实际安装、五项交互、沉浸月轮显示及卸载回退；目前完成的是配置/默认值与样式静态检查。
- 中文 IME 候选窗、组合输入、连续输入；以及全部键盘焦点路径。
- 移动设备、软键盘、触控、窄屏实机和系统减少动态效果切换。
- 分屏、弹出窗口、关系图、数学/Mermaid、嵌入、任务和属性编辑的完整交互回归。
- 宽表格/超长代码的全部滚动状态、打印/PDF 实际输出。
- 与默认主题的长时间性能对照、多插件组合、其他系统和 Obsidian 版本。

## 阶段状态与下一步

P0–P3 已完成首版实现，P4 的浅色及移动/打印 CSS 已实现但移动、打印实测待做；P5 已完成自动检查与桌面冒烟，完整回归待做。优先在实验库验证真实中文输入法与 Style Settings，再决定是否安装到日常笔记库。回退只需在外观设置中选择默认主题。
