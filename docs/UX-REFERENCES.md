# 交互细节参考 · 2026-09-17

本轮参考 Minimal、Things 与 AnuPpuccin 的上游文档和源码。它们展示了不同的交互取舍，不作为客观排名。Tsukuyomi 保留现有色板、字体继承、正文宽度、招牌、空白页场景和动效；只借鉴交互原则，独立实现局部 CSS。

| 上游依据 | 本项目采用的方向 |
| --- | --- |
| [Things 建议项的选中状态](https://github.com/colineckert/obsidian-things/blob/9b8bef93d3919f7693ac78597beaa35bbbd4cfff/theme.css#L548) | 区分悬停与键盘选中，使用 Tsukuyomi 海青色边线辅助定位；恢复菜单危险、禁用和标签项的原生语义颜色。 |
| [Minimal 表格文档](https://minimal.guide/tables)及[阅读与编辑样式](https://github.com/kepano/obsidian-minimal/blob/c4704fbc23625f4b35b0ab9b2e1eb584e6891be2/src/scss/content/tables.scss) | 将阅读表格滚动与原生编辑表格分开处理；以可选笔记类提供行定位和等宽数字，保持用户正文字号。 |
| [Minimal 手机工具栏](https://github.com/kepano/obsidian-minimal/blob/c4704fbc23625f4b35b0ab9b2e1eb584e6891be2/src/scss/mobile/toolbar.scss) | 保留移动控件的触达空间；修复本项目紧凑密度覆盖原生手机导航尺寸的问题，不移植固定浮动按钮。 |
| [AnuPpuccin 可选增强与自定义边界](https://github.com/AnubisNekhet/AnuPpuccin#features) | 阅读辅助按笔记启用，无配套插件依赖；不扩张为全局彩虹文件夹或全面 Callout 重着色。 |

同时对照本机 Obsidian 1.13.7 原生样式：菜单标题依赖父级状态色；移动界面已有适合触控的导航间距；实时预览表格已有 `.cm-table-widget` 滚动层和编辑手柄空间。这些是实施依据，不能仅凭其他主题的截图推断兼容性。

## 本轮不采用

- 不替换 Tsukuyomi 的配色、圆角体系、侧栏灯牌或角色资产。
- 不复制 Things 的旧式手机悬浮按钮定位，避免英文标签选择器和固定位置假设。
- 不再叠加全局焦点环或搜索高亮；现有主题和原生变量已覆盖，未发现需要改造的缺口。
- 不增加必装插件、正文动效或额外设置面板。AnuPpuccin README 的暂停维护说明也提醒我们，借鉴方案后仍须针对当前 Obsidian 独立验证。

具体实现和实测范围见 [验收记录](VALIDATION.md)，不以这些上游参考代替本项目验收。
