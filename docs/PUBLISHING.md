# 1.0.0 发布与 Obsidian 社区目录准备

核对日期：2026-09-16。1.0.0 冻结已确认的视觉；电影场景研究和新增元素提案暂缓。GitHub 正式 Release 与 Obsidian 社区收录是两个步骤，完成前者不代表已经上架。

## 本版交付

| 项目 | 内容 |
| --- | --- |
| GitHub 仓库 | `kuguya-AI-app-develop/tsukuyomi-Obsidian-theme`，目前为私有 |
| 默认分支 | `main` |
| 主题版本 / Release tag | `1.0.0`，不加 `v` 前缀 |
| 最低 Obsidian 版本 | `1.13.7` |
| 必需附件 | `manifest.json`、`theme.css` |
| 便捷附件 | `Tsukuyomi-1.0.0.zip`，含 `Tsukuyomi/` 目录；`SHA256SUMS.txt` |
| 历史兼容映射 | 根目录 `versions.json` |
| 展示截图 | 根目录 `screenshot.jpg`，真实 macOS Obsidian 阅读视图，1365×768 |
| 安装文档 | [README](../README.md) |
| 实际测试范围 | [验收记录](VALIDATION.md) |
| 素材与许可边界 | [NOTICE](../NOTICE.md) |

[Release](https://github.com/kuguya-AI-app-develop/tsukuyomi-Obsidian-theme/releases/tag/1.0.0) 对有仓库访问权限的账号可见。源码 ZIP 是 GitHub 自动生成的仓库快照；安装应使用单独附件或 `Tsukuyomi-1.0.0.zip`。

## 公开提交前必须完成

- [ ] **选择许可证并添加根目录 `LICENSE`。** 建议讨论原始代码的 MIT 许可，同时明确排除原作角色设计权益；该建议尚未生效。现有角色资源及内嵌它们的 CSS 须明确分发范围，不能用软件许可替代角色授权。见 [NOTICE](../NOTICE.md)。
- [ ] **确认公开素材范围。** 依据官方二创指南判断当前分发形式是否适用；需要单独许可时先取得许可，或准备可公开分发的素材版本。当前版本不声称已通过权利方确认。
- [ ] **确认公开仓库。** 目录审核需要访问源码，安装需要读取对应 Release。仓库公开会使已提交历史和研究文件可见；公开前检查这些内容，并移除 README 中过时的私有状态说明。不要将私有 Release 误认为已满足面向所有用户的安装条件。
- [ ] **登录 Obsidian 账号并连接 GitHub。** 使用 ArisaTaki 对该仓库的管理身份；账户授权由账号所有者完成。
- [ ] **接受开发者政策及维护承诺，实际提交并处理审核结果。** 本地检查不能替代目录自动审核。

补充准备：官方推荐 512×288 的 16:9 缩略图；当前原生截图保留接近 16:9 的原始尺寸，正式提交前可从这张真实截图导出缩略图。建议补测 Windows、Linux、移动端、中文输入法、Style Settings、打印及长时性能；未测平台继续在 README 标注，不预先宣布全部支持。

## 提交表单草稿

按[当前提交指南](https://docs.obsidian.md/themes/app-themes/submit-theme)，入口是 [Obsidian Community](https://community.obsidian.md/)，通过 Themes → New theme 提交。

| 字段 | 填写内容 |
| --- | --- |
| GitHub repository URL | `https://github.com/kuguya-AI-app-develop/tsukuyomi-Obsidian-theme` |
| Owner | 维护者本人，或在 Obsidian Community 中创建并加入的 `kuguya-ai-app-develop` 组织；尚未创建或预留 |
| Screenshot path | `screenshot.jpg`（如新增缩略图，再改为实际仓库路径） |
| Supported modes | Dark、Light |
| 展示描述草稿 | An unofficial moonlit theme inspired by Cosmic Princess Kaguya!, with dark and light modes, calm reading surfaces, and an animated empty view. |

Obsidian Community 的组织与 GitHub 组织分别管理；已有 GitHub 组织不会自动创建同名目录组织。参考[账号与提交表单](https://docs.obsidian.md/community-directory/set-up-and-claim)、[目录组织](https://docs.obsidian.md/community-directory/organizations)。

目录读取默认分支 HEAD 的 `manifest.json`，安装时读取同版本 tag 的 GitHub Release 附件。不要提前把默认分支版本改成尚未发布的下一版。[官方发布流程](https://docs.obsidian.md/themes/app-themes/submit-theme)

## 复核与后续版本

```sh
npm ci
npm test
npm run lint
npm run lab
git diff --check
```

开发依赖只用于构建和检查。主题仍只有两个安装文件，没有运行时 JavaScript、网络资源或插件依赖。Stylelint 使用官方配置并记录项目兼容调整，见 [样式检查说明](LINT.md)；目录审核仍可能提出额外问题。

每次发布同步 `manifest.json`、`package.json`、锁文件、`versions.json`、更新日志和构建产物。验证默认分支、tag 与附件内容一致后发布新版本；不要覆盖已发布的同版本附件来隐瞒修复。

原生手动复核：在三种编辑视图检查文字与菜单，打开空白页观察鱼与伙伴，启用静态/简洁模式，缩小窗格，并检查深浅配色。需要回退时从上一版 Release 安装两个主题文件，或切换到默认主题；无需改动笔记。

政策依据：[开发者政策](https://docs.obsidian.md/community-directory/developer-policies)、[官方示例主题与兼容版本映射](https://github.com/obsidianmd/obsidian-sample-theme)。截至本次准备，未创建 Obsidian 目录条目、未发送公开提交或权利方咨询。
