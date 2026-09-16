# 公开发布与 Obsidian 社区目录审核

更新日期：2026-09-16。用户已授权完成公开发布、提交审核并跟进至通过。当前提交版本为 **1.0.2**；1.0.0 保留为首个正式版本。电影场景扩展研究继续暂停。

## 当前状态

- 已完成：标准软件许可证、第三方素材范围说明、完整许可随 CSS 分发、README、版本映射、真实截图、构建及本地检查。
- 已完成：公开发布前的仓库和历史检查；用户未提交的外观及笔记修改不进入发布。
- 已完成：维护者登录 Obsidian Community，并连接 GitHub `ArisaTaki` 的公开资料只读权限。社区署名为 `ArisaTaki`，handle 为 `arisataki`，无捐赠入口。
- 已完成：GitHub 仓库公开及 1.0.1 正式 Release；四个附件可匿名下载，内容与本地校验一致，GitHub 识别 MIT。
- 已完成：按目录验证要求，将 ArisaTaki 在 `kuguya-AI-app-develop` 的成员身份设为公开；仍由个人维护者管理目录条目。
- 已受理：2026-09-16 16:19（Asia/Shanghai），[官方管理条目](https://community.obsidian.md/account/themes/tsukuyomi) 已识别版本 `1.0.1`、提交 `fe6fc60`，初始审核状态为 **Pending**。
- 首轮结果：1.0.1 / `fe6fc60` 的扫描已 **Completed**，未出现 Error，保留英文 README 提示与 16 条 CSS 提示。已补齐完整英文 README 并保留中文版，在 1.0.2 重新检查。
- 最终结果：2026-09-16 16:27（Asia/Shanghai），1.0.2 / `e35a5f9` 的官方审核显示 **Completed**，无 Error；英文 README 警告已消除，保留 16 条非阻断的 CSS 提示。[审核记录](review-v1.0.2.txt)。
- 已正式发布：[公开主题条目](https://community.obsidian.md/themes/tsukuyomi) 可匿名访问并提供 **Add to Obsidian**；目录当前版本为 **1.0.2**，显示 **Health: Excellent / Review: Satisfactory**。
- 本轮目标已完成：提交、处理反馈、等待复核并公开上架。没有待处理的阻断项，无需继续定时等待。目录通过不代表原作权利方单独授权，也不扩大已记录的平台实测范围。

## 提交资料

| 字段 | 内容 |
| --- | --- |
| GitHub repository URL | `https://github.com/kuguya-AI-app-develop/tsukuyomi-Obsidian-theme` |
| 默认分支 | `main` |
| 版本 / Release tag | `1.0.2`，不加 `v` |
| 最低 Obsidian 版本 | `1.13.7` |
| Owner | 个人维护者 `ArisaTaki`（GitHub 组织继续托管仓库） |
| Screenshot path | `screenshot.jpg`，真实阅读截图，1365×768，接近 16:9 |
| Supported modes | Dark、Light |
| Payment | Free，主题无收费、广告或捐赠入口 |
| 描述 | An unofficial moonlit theme inspired by Cosmic Princess Kaguya!, with dark and light modes, calm reading surfaces, and an animated empty view. |
| 必需附件 | `manifest.json`、`theme.css` |
| 便捷附件 | `Tsukuyomi-1.0.2.zip`、`SHA256SUMS.txt` |

[1.0.2 Release](https://github.com/kuguya-AI-app-develop/tsukuyomi-Obsidian-theme/releases/tag/1.0.2) 中 ZIP 只含 `Tsukuyomi/manifest.json` 与 `Tsukuyomi/theme.css`。兼容版本映射见根目录 `versions.json`。官方推荐 512×288 缩略图；当前保留真实截图原始尺寸，不用生成画面替代运行截图。

## 许可和审核边界

原创软件代码采用根目录 [MIT License](../LICENSE)；第三方角色设计及其他原作权益按 [NOTICE](../NOTICE.md) 排除，不以 MIT 推定获得原作授权。维护者依据官方二创指南中个人、非营利数字二创的条件免费分发，这是项目对指南的适用判断，不是权利方逐项审核结论。

目录按[开发者政策](https://docs.obsidian.md/community-directory/developer-policies)审核。安装产物没有网络资源、JavaScript、遥测或运行时依赖；研究 HTML 不进入主题。若审核提出素材、许可或技术问题，记录具体反馈并修复，不预先保证审核结果。

## 检查和后续反馈

```sh
npm ci
npm test
npm run lint
npm run lab
```

实际结果见 [验收记录](VALIDATION.md)；Stylelint 的项目兼容调整见 [LINT.md](LINT.md)。本地检查不等同于目录自动审核。Windows、Linux、移动端、中文输入法组合输入、Style Settings、打印及长期性能仍有未测项目。

按[当前官方流程](https://docs.obsidian.md/themes/app-themes/submit-theme)，在 Community 的 Themes → New theme 提交。目录读取默认分支 HEAD 清单，并从同版本 tag 的 Release 下载附件；必须保持三者一致。后续通过管理页检查 Manifest、Releases、Source code 和 Build verification 结果，修复后发布新的补丁版本，可使用 Request review 重新检查。[管理审核结果](https://docs.obsidian.md/community-directory/manage-entry)

本轮已完成等待与复核，未保留重复轮询任务。日后发布新版本仍须检查对应审核结果。回退时可手动安装上一版两文件，或切换默认主题；不改动笔记。
