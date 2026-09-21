# irop.one 发布联动验收 · 2026-09-21

主题仍为 1.2.0，本次没有创建新主题 Release，也没有修改已发布的 CSS。网站从 1.0.4 更新到正式 1.2.0。

## 实现与运行记录

- 主题发布入口为 `npm run release -- <版本> <附件…> <发布说明选项…>`，使用本机已有 `gh` 登录；发布成功后触发网站 `main` 的部署。已发布版本可通过 `npm run sync:site -- 1.2.0` 单独重试网站步骤。
- 网站构建前从固定上游的正式 Release 下载、验证 SHA-256 并同步资源。同一次同步生成公开 release.json 和源码目录的 tsukuyomi-release.json，统一页面、下载链接和助手知识中的版本；源码不直接导入 public JSON，开发预览也能正常转换。
- 网站每小时第 7、22、37、52 分钟检查正式版与线上 metadata；仅有差异且没有部署正在运行时才触发部署。GitHub 调度可能延迟。
- 默认分支 `develop` 仅增加检查工作流（`f94cb46`）；它明确检出生产 `main`。没有改变默认分支或发布其他开发内容。
- 网站功能提交：`d68919b`；开发预览元数据修正：`8c62e09`。主题发布工具提交：`f7e8356`。
- [网站 main 推送部署](https://github.com/ArisaTaki/roku-homepage/actions/runs/35604947794)：成功。
- [本机通知触发的部署](https://github.com/ArisaTaki/roku-homepage/actions/runs/35604998874)：成功；资源同步、构建、SSH 部署及线上健康检查全部通过。
- [最终元数据修正部署](https://github.com/ArisaTaki/roku-homepage/actions/runs/35606305326)：成功；上线后独立复核版本为 1.2.0、CSS 摘要一致、缓存为 no-cache，补漏脚本返回 changed:false。
- [首次补漏检查](https://github.com/ArisaTaki/roku-homepage/actions/runs/35605017935)：成功；发现差异时已有生产任务，不重复触发。
- [上线后的补漏检查](https://github.com/ArisaTaki/roku-homepage/actions/runs/35605512084)：成功；没有差异，部署步骤跳过。这里是手动触发相同检查工作流的验收，不冒充已观察到定时触发。

## 实际检查

- 主题 `npm test`：47 项通过（原主题 29 项、发布工具 18 项）；严格 Stylelint 通过。
- 网站 `npm run test:tsukuyomi`：27 项通过，覆盖摘要错误、半途下载失败、幂等、超时、认证不随资源跳转泄露、线上状态比较等。
- 网站 `npm run sync:tsukuyomi -- --check` 返回 `changed:false`；`npm run check:iroha`、完整前端与 API 构建通过。
- 元数据修正后重新通过网站 27 项测试、助手检查和构建；Vite 开发转换覆盖 4 个消费模块与生成 JSON，共 5 项、零警告。
- 线上 release.json 与 CSS 字节对应 **1.2.0**，CSS SHA-256 为 `449b88169f40f628a0be771e1db6b422077abc00592b9ca98550d59ab90ae64a`。HTML 控制代码、样式和版本资源采用 `Cache-Control: no-cache` 重新验证；已读取 preview.js、preview.css、theme.css、release.json 的实际响应。
- 浏览器在本地及线上确认文章 `tk-note-enter` 为 460ms、侧栏 `tk-sidebar-jelly` 为 600ms，采样到了中途透明度/变换，文章结束后为 opacity 1、transform none。
- 本地检查了深浅模式、三语言版本链接、静态开关和 393×852 浏览器下的抽屉开合，无页面横向溢出；首页悬停自动从场景切换到阅读，移出后进入静态暂停。线上首页也显示 v1.2.0。

## 边界与回退

网页是匹配主题选择器的模拟界面，演示普通标签切换；没有重新加入已搁置的同标签换文件动效或配套插件。本次未进行 iPhone 原生、系统减少动态效果开关、全部既有站点功能或其他 Obsidian 版本实测。

生产部署采用原有 SSH 更新过程，已改为排队，避免新任务取消正在上传的任务；并非原子服务器回滚。需要固定旧主题时，先将网站仓库变量 `TSUKUYOMI_AUTO_SYNC` 设为 `false`，再手动部署指定的旧 `theme_version`。主题用户原有 Lab 外观与笔记修改及主题发布产物的字节均保留。
