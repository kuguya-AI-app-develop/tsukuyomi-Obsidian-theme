# 公开发布与 Obsidian 社区目录审核

更新日期：2026-09-17。用户已授权完成公开发布、提交审核并跟进至通过。当前版本为 **1.1.0**；1.0.0 保留为首个正式版本。电影场景扩展研究继续暂停。

## 1.1.0 交互细节更新

发布准备中：菜单语义颜色与键盘选中反馈、移动端紧凑密度、阅读表格横滚和可选表格行定位。现有视觉与动效素材保持不变，依据见 [交互参考](UX-REFERENCES.md)。本节将在验证和公开附件复验后更新。

## 1.0.5 Mermaid 适配

[1.0.5 Release](https://github.com/kuguya-AI-app-develop/tsukuyomi-Obsidian-theme/releases/tag/1.0.5) 已于 2026-09-17 01:27:12Z 发布，tag 指向 `05476ebcfade11c0ce577a46f65ed68c919ae3fd`。提供大图横向滚动和流程图、时序图、状态图的深浅配色适配，保留原生尺寸约束与按笔记退出配色的选项。24 项测试、170 项桌面浏览器场景及原生 Obsidian PDF 检查通过，范围见 [验收记录](VALIDATION.md)。四个附件均已匿名下载，与本地产物逐字节一致；[附件校验](release-assets-v1.0.5.json)。官方复核已为 **Completed**，当前版本为 **1.0.5**，没有 Error；仍保留原有两条打印分页的 multicolumn 提示。[复核记录](review-v1.0.5.txt)。客户端同步未重新检查，已暂停的定时检查不恢复。

## 1.0.4 手机适配补丁

修复手机宽度下场景全部隐藏及侧栏空框。24 项测试、严格 Stylelint、五种手机尺寸和桌面窄分栏模拟检查通过，详情见 [验收记录](VALIDATION.md)。iPhone 真机复核仍待用户更新验证。[1.0.4 Release](https://github.com/kuguya-AI-app-develop/tsukuyomi-Obsidian-theme/releases/tag/1.0.4) 已于 2026-09-16 10:42:47Z 发布，tag 指向 `a22a21f30943e232115707c6cb8207bef3802283`。四个附件均匿名下载复验，与本地产物逐字节一致，ZIP 只含主题两文件。官方已读取 1.0.4 并排队扫描，当前为 Pending；官网稳定版本仍为 1.0.3。[复核记录](review-v1.0.4.txt)。此前 1.0.3 的官方两条打印警告不作为本版已消除；客户端目录同步未重新检查，既有自动检查继续暂停。

## 1.0.3 补丁复核

针对 1.0.2 扫描提示完成样式调整与 CONTRIBUTING.md。`npm test` 23/23、严格零警告 Stylelint 和原生六页 PDF 对比均通过，见 [验收记录](VALIDATION.md)。1.0.3 已公开发布，四个附件匿名下载后与本地产物逐字节一致。2026-09-16 17:06（北京时间）正式复核显示 **Completed**、目录当前版本 **1.0.3**，无 Error；14 条诊断已消除，仅余 2 条打印分页的 multicolumn 提示。[官方记录](review-v1.0.3.txt)。两条打印声明已有 Chrome 支持依据和真实 PDF 验证，但服务端仍报告它们，不采用源文件的单行豁免；本地零警告不代表官方零警告。为保留标题与代码分页效果，维持标准分页规则，原因详见 [LINT.md](LINT.md)。

发布前的[分支预览记录](preview-v1.0.3.txt)返回了与 1.0.2 相同且不对应新源码的行号；最终状态以上述正式版本复核为准。

公开[评分卡](scorecard-v1.0.3.txt)已确认：Hygiene 显示 README、license、contributing guide 和 description 均齐全，Health 为 Excellent，Review 为 Satisfactory，剩余 2 条打印分页提示。

客户端目录的每小时检查已按用户后续要求暂停，本补丁复核不恢复该检查。

## 1.0.2 发布记录

- 已完成：标准软件许可证、第三方素材范围说明、完整许可随 CSS 分发、README、版本映射、真实截图、构建及本地检查。
- 已完成：公开发布前的仓库和历史检查；用户未提交的外观及笔记修改不进入发布。
- 已完成：维护者登录 Obsidian Community，并连接 GitHub `ArisaTaki` 的公开资料只读权限。社区署名为 `ArisaTaki`，handle 为 `arisataki`，无捐赠入口。
- 已完成：GitHub 仓库公开及 1.0.1 正式 Release；四个附件可匿名下载，内容与本地校验一致，GitHub 识别 MIT。
- 已完成：按目录验证要求，将 ArisaTaki 在 `kuguya-AI-app-develop` 的成员身份设为公开；仍由个人维护者管理目录条目。
- 已受理：2026-09-16 16:19（Asia/Shanghai），[官方管理条目](https://community.obsidian.md/account/themes/tsukuyomi) 已识别版本 `1.0.1`、提交 `fe6fc60`，初始审核状态为 **Pending**。
- 首轮结果：1.0.1 / `fe6fc60` 的扫描已 **Completed**，未出现 Error，保留英文 README 提示与 16 条 CSS 提示。已补齐完整英文 README 并保留中文版，在 1.0.2 重新检查。
- 最终结果：2026-09-16 16:27（Asia/Shanghai），1.0.2 / `e35a5f9` 的官方审核显示 **Completed**，无 Error；英文 README 警告已消除，保留 16 条非阻断的 CSS 提示。[审核记录](review-v1.0.2.txt)。
- 官网已发布：[公开主题条目](https://community.obsidian.md/themes/tsukuyomi) 可匿名访问并显示 **Add to Obsidian**；网页当前版本为 **1.0.2**，显示 **Health: Excellent / Review: Satisfactory**。
- 客户端同步待验证：2026-09-16 16:37（Asia/Shanghai），Obsidian 1.13.7 使用的主题列表尚无 Tsukuyomi，客户端搜索与安装尚未验收通过。此前把官网发布直接等同于客户端可搜的说明已更正，后续继续跟进。目录审核通过不代表原作权利方单独授权，也不扩大平台实测范围。

## 客户端目录同步

2026-09-16 16:37（北京时间）复核结果：

- 用户反馈客户端搜不到；实际读取[客户端主题列表](https://raw.githubusercontent.com/obsidianmd/obsidian-releases/HEAD/community-css-themes.json)，共 **758** 项，没有 Tsukuyomi。本机 Obsidian **1.13.7** 代码确认读取此 URL，并缓存列表 **5 分钟**。因此官网条目可见不能替代客户端搜索验证，**Add to Obsidian** 同样依赖客户端列表。
- 官方[目录同步工作流](https://github.com/obsidianmd/obsidian-releases/blob/master/.github/workflows/mirror-community-json.yml)计划在每小时第 **17 分钟**将 `community.obsidian.md/assets/community-themes.json` 复制到旧客户端列表。2026-09-16 **08:35:45Z** 的[运行记录](https://github.com/obsidianmd/obsidian-releases/actions/runs/35074624792)成功，显示来源与镜像均为 758 项、无差异。现有证据指向客户端导出尚未收录该条目，不能仅据搜不到就认定 GitHub 镜像任务故障。
- 官方[发布说明 FAQ](https://obsidian.md/blog/future-of-plugins/)说明，审核通过后 **24 小时内**可在应用中搜索和下载。按本次 **2026-09-16 16:27** 的通过记录计算，24 小时节点为 **2026-09-17 16:27（北京时间）**；目前仍在同步窗口内。这是官方说明的窗口，当前客户端可用性仍需实际确认。

此前安排的每小时复核已按用户要求暂停，等待官方自行同步。列表更新后仍需确认缓存刷新后的真实搜索和安装；若超时未收录，保留审核状态、列表内容及同步运行记录作为后续反馈依据。当前可使用 [1.0.2 Release](https://github.com/kuguya-AI-app-develop/tsukuyomi-Obsidian-theme/releases/tag/1.0.2) 手动安装。

## 提交资料

| 字段 | 内容 |
| --- | --- |
| GitHub repository URL | `https://github.com/kuguya-AI-app-develop/tsukuyomi-Obsidian-theme` |
| 默认分支 | `main` |
| 版本 / Release tag | `1.1.0`，不加 `v` |
| 最低 Obsidian 版本 | `1.13.7` |
| Owner | 个人维护者 `ArisaTaki`（GitHub 组织继续托管仓库） |
| Screenshot path | `screenshot.jpg`，真实阅读截图，1365×768，接近 16:9 |
| Supported modes | Dark、Light |
| Payment | Free，主题无收费、广告或捐赠入口 |
| 描述 | An unofficial moonlit theme inspired by Cosmic Princess Kaguya!, with dark and light modes, calm reading surfaces, and an animated empty view. |
| 必需附件 | `manifest.json`、`theme.css` |
| 便捷附件 | `Tsukuyomi-1.1.0.zip`、`SHA256SUMS.txt` |

[1.1.0 Release](https://github.com/kuguya-AI-app-develop/tsukuyomi-Obsidian-theme/releases/tag/1.1.0) 中 ZIP 只含 `Tsukuyomi/manifest.json` 与 `Tsukuyomi/theme.css`。兼容版本映射见根目录 `versions.json`。官方推荐 512×288 缩略图；当前保留真实截图原始尺寸，不用生成画面替代运行截图。

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

官网发布已确认，客户端目录同步及真实搜索安装仍需跟进；完成后再更新最终可用状态。日后发布新版本仍须检查对应审核及客户端结果。回退时可手动安装上一版两文件，或切换默认主题；不改动笔记。
