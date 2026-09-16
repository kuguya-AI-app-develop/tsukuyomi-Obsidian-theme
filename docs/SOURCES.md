# 资料依据

资料查阅日期：2026-09-16。来源用于研究场景设计、阅读表现和主题接口，不代表 Obsidian 或《超时空辉夜姬！》对本项目的认可或关联。

## 月读空间

v0.5.0 结合用户选择的月读城市与八千代舞台。创作者陈述、制作图和官网场景图分别提供空间方向与形态参考；下文的视觉观察不是官方设计规范。

- [CGWORLD No.1／スタッフインタビュー篇](https://cgworld.jp/article/cgw331-chokaguyahime01.html)：导演、CG 导演与 CG 背景导演区分了京都式街景、较低饱和度的游戏空间和激光演唱舞台。文章所附概念图中的深色屋顶、朱褐建筑、暖色灯笼与青绿天空，是本项目观察到的冷暖关系；本主题据此区分城市与舞台的表达方式。
- [CGWORLD No.2／プリビズ＆CG制作篇](https://cgworld.jp/article/cgw331-chokaguyahime02.html)：背景制作与材质资料，包含屋檐、窗光和后半段舞台的水镜、灯火。本主题将其简化为界面层次与空白页边缘场景。
- [CGWORLD No.3／CG制作篇](https://cgworld.jp/article/cgw331-chokaguyahime03.html)：屋形船的灯笼与青海波投影等资产制作说明。作为暖色灯火的研究参考；本主题没有复制其中的图像或加入动态投影。
- [ゴキンジョ《超かぐや姫！》项目页](https://gokinjyo.co.jp/cho-kaguyahime/)：原作概念设计团队的项目资料与设计图，作为场景来源的补充。
- [官网故事场景图](https://www.cho-kaguyahime.com/assets/img/story/story_img.jpg)：观察到密集的朱红叠层街楼、暖窗、发光骨架鱼，以及青粉街道与虹色光带，作为城市 SVG 的形态参考。
- [CGWORLD 舞台制作图](https://cgworld.jp/article/0204e.jpg)：观察到城台上的鸟居、圆形水镜、虹色拱桥、水面与悬浮方灯，作为舞台 SVG 的构图参考。
- [作品官网](https://www.cho-kaguyahime.com/)：作品公开信息；网站的青色偏移边框、圆角云带和紧凑角框也用于界面边缘细节的观察。
- [irop.one](https://irop.one/)：用户提供的视觉参考站。浏览观察到海军蓝与奶油色标签、青绿与珊瑚偏移边框、云带和圆环；本主题将这些关系重新组织为侧栏灯牌、工具区框线与纯色选中项，没有复制该站素材或加载其资源。

以上图片仅作为链接引用，没有下载后打包进主题。四个 SVG 图层来自本项目重新设计的几何场景；具体色值、组件形状与信息层级均为本主题的设计判断，不是官方界面规范或像素级复刻。场景参考如何落到阅读界面，见 [DESIGN.md](DESIGN.md)。

## 阅读参考

- [W3C：Visual Presentation](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html)：AAA 条件涉及可调节颜色、行长、行距与缩放，其中 CJK 行长参考为不超过 40 个字形。本主题选择可调节的 `40rem` 默认宽度；实际字数随字号与字体而变，不声称因此满足该条件。
- [W3C：Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)：关注用户调节文字间距后是否丢失内容或功能，不要求作者将所列测试值作为默认值。本主题保留用户字体与字号设置，扩大间距后的真实使用仍需验证。
- [W3C：Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)：默认色板对比度检查的参考，普通文字采用 `4.5:1` 目标。静态色值检查不等于完整 WCAG 验收。

## Obsidian 实现与分发

- [About styling](https://docs.obsidian.md/Reference/CSS%20variables/About%20styling)：CSS 变量和主题覆盖方式。
- [Colors](https://docs.obsidian.md/Reference/CSS%20variables/Foundations/Colors)：基础色阶、强调色和语义颜色变量。
- [Manifest](https://docs.obsidian.md/Reference/Manifest)：主题 `manifest.json` 字段约定。
- [Obsidian Desktop v1.13.7 changelog](https://obsidian.md/changelog/2026-08-12-desktop-v1.13.7/)：最低兼容版本的发布记录。
- [Obsidian sample theme](https://github.com/obsidianmd/obsidian-sample-theme)：官方示例主题的结构参考。
- [Style Settings](https://github.com/community-archive/obsidian-style-settings)：可选设置注释格式与设置类型参考。
- [Obsidian developer policies](https://docs.obsidian.md/community-directory/developer-policies)：主题不得从网络加载资源等社区目录政策。当前安装产物仅包含清单与内嵌原创 SVG 的 CSS，不代表已经通过目录审核。
- [官方二次创作指南](https://www.cho-kaguyahime.com/special/detail.html?id=1024)：涉及原作角色或素材时应查阅的权利人说明。SVG 或 CSS 是实现格式，不代表自动取得授权。

当前主题内嵌 `assets/tsukuyomi-{city,gate,fish,mirror}.svg` 四个场景图层与 `assets/stage-clouds.svg` 云纹，没有人物插画、官方图片、Logo、音乐、字体或远程资源。云纹沿用本项目 v0.2.0 的原创源文件；城市与舞台图层由本项目 v0.4.0 原创场景拆分而成。项目未在本文档中代替权利人作出授权声明，也未擅自选择或推定软件许可证。
