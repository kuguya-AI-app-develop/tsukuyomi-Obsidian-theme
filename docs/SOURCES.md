# 资料依据

资料查阅日期：2026-09-16。来源用于研究场景设计、阅读表现和主题接口，不代表 Obsidian 或《超时空辉夜姬！》对本项目的认可或关联。

## 月读空间

v0.7.0 结合用户选择的月读城市与八千代舞台。创作者陈述、制作图和官网场景图分别提供空间方向与形态参考；下文的视觉观察不是官方设计规范。

- [CGWORLD No.1／スタッフインタビュー篇](https://cgworld.jp/article/cgw331-chokaguyahime01.html)：导演、CG 导演与 CG 背景导演区分了京都式街景、较低饱和度的游戏空间和激光演唱舞台。文章所附概念图中的深色屋顶、朱褐建筑、暖色灯笼与青绿天空，是本项目观察到的冷暖关系；本主题据此区分城市与舞台的表达方式。
- [CGWORLD No.2／プリビズ＆CG制作篇](https://cgworld.jp/article/cgw331-chokaguyahime02.html)：背景制作与材质资料，包含屋檐、窗光和后半段舞台的水镜、灯火。本主题将其简化为界面层次与空白页边缘场景。
- [CGWORLD No.3／CG制作篇](https://cgworld.jp/article/cgw331-chokaguyahime03.html)：屋形船的灯笼与青海波投影等资产制作说明。作为暖色灯火的研究参考；本主题没有复制其中的图像或加入动态投影。
- [ゴキンジョ《超かぐや姫！》项目页](https://gokinjyo.co.jp/cho-kaguyahime/)：原作概念设计团队的项目资料与设计图，作为场景来源的补充。
- [官网故事场景图](https://www.cho-kaguyahime.com/assets/img/story/story_img.jpg)：观察到密集的朱红叠层街楼、暖窗、发光骨架鱼，以及青粉街道与虹色光带，作为城市 SVG 的形态参考。
- [CGWORLD 舞台制作图](https://cgworld.jp/article/0204e.jpg)：观察到城台上的鸟居、圆形水镜、虹色拱桥、水面与悬浮方灯，作为舞台 SVG 的构图参考。
- [官方角色页](https://www.cho-kaguyahime.com/#character)、[DOGE 角色图](https://www.cho-kaguyahime.com/assets/img/character/character_3main.png)、[FUSHI 角色图](https://www.cho-kaguyahime.com/assets/img/character/character_4main.png)：角色身份与外形参考。本主题中的对应矢量形象属于二次创作，官方 PNG 不进入安装产物。
- 用户在对话中提供的粉色伙伴截图：仅用于粉色身体、耳状鳍、深紫眼睛和触腕轮廓的重绘，去除头像圆框。官方名称尚未确认，文档统一称「粉色伙伴」；原截图不进入安装产物。
- 用户在对话中提供的彩叶狐狸装扮截图：按用户说明和图像重绘头部，不添加身体，也不另取官方吉祥物名称；原截图不进入安装产物。
- [作品官网](https://www.cho-kaguyahime.com/)：作品公开信息；网站的青色偏移边框、圆角云带和紧凑角框也用于界面边缘细节的观察。
- [irop.one](https://irop.one/)：用户提供的视觉参考站。浏览观察到海军蓝与奶油色标签、青绿与珊瑚偏移边框、云带和圆环；本主题将这些关系重新组织为侧栏灯牌、工具区框线与纯色选中项，没有复制该站素材或加载其资源。

v0.6 的导航斜线、细框与几何边纹沿用本项目 v0.2 的原创 CSS 设计；舞台居中布局和独立动效节奏是本主题的界面取舍，不是原作公开规范。

以上参考图片没有打包进主题。城市、舞台和鱼由本项目重新设计为几何场景；DOGE 与 FUSHI 依据原作角色制作矢量二创，粉色伙伴和彩叶狐狸装扮头部依据用户截图重绘。四位伙伴分散在空白页上方、游鱼保留在下方两侧，是本主题的布局取舍；具体色值、组件形状与信息层级也由本项目决定，不是官方界面规范或像素级复刻。场景参考如何落到阅读界面，见 [DESIGN.md](DESIGN.md)。

[电影画面参考板](SCENE-REFERENCES.html) 另列六组画面和主题提案，供用户选择下一步方向；这些提案尚未实施，不属于当前主题功能。

## 阅读参考

- [W3C：Visual Presentation](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html)：AAA 条件涉及可调节颜色、行长、行距与缩放，其中 CJK 行长参考为不超过 40 个字形。本主题选择可调节的 `40rem` 默认宽度；实际字数随字号与字体而变，不声称因此满足该条件。
- [W3C：Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)：关注用户调节文字间距后是否丢失内容或功能，不要求作者将所列测试值作为默认值。本主题保留用户字体与字号设置，扩大间距后的真实使用仍需验证。
- [W3C：Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)：默认色板对比度检查的参考，普通文字采用 `4.5:1` 目标。静态色值检查不等于完整 WCAG 验收。

## SVG 声明式动画

- [MDN：SVG as an image](https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/SVG_as_an_image)：SVG 可用作 CSS 背景图，图像上下文对脚本和外部资源存在限制。本主题将几何图形内嵌为数据 URL，不使用脚本或外部资源。
- [MDN：animate](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/animate)：声明式改变 SVG 属性的接口依据。本主题用父路径的 `d` 属性进行鱼身变形，用组的透明度完成单向鱼的淡出接续，并提供静态资源回退。
- [MDN：animateTransform](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/animateTransform)：声明式变换的接口依据。本主题使用组的平移与旋转安排游动及角色局部摆动；鱼的朝向准备只发生在完全透明时段。路线和节奏由本项目设计。

这些资料说明实现接口，不代表真实 Obsidian 验收已经完成。具体证据见 [VALIDATION.md](VALIDATION.md)。

## Obsidian 实现与分发

- [About styling](https://docs.obsidian.md/Reference/CSS%20variables/About%20styling)：CSS 变量和主题覆盖方式。
- [Colors](https://docs.obsidian.md/Reference/CSS%20variables/Foundations/Colors)：基础色阶、强调色和语义颜色变量。
- [Manifest](https://docs.obsidian.md/Reference/Manifest)：主题 `manifest.json` 字段约定。
- [Obsidian Desktop v1.13.7 changelog](https://obsidian.md/changelog/2026-08-12-desktop-v1.13.7/)：最低兼容版本的发布记录。
- [Obsidian sample theme](https://github.com/obsidianmd/obsidian-sample-theme)：官方示例主题的结构参考。
- [Style Settings](https://github.com/community-archive/obsidian-style-settings)：可选设置注释格式与设置类型参考。
- [Obsidian developer policies](https://docs.obsidian.md/community-directory/developer-policies)：主题不得从网络加载资源等社区目录政策。当前安装产物仅包含清单与内嵌场景与角色二创 SVG 的 CSS，不代表已经通过目录审核。
- [官方二次创作指南](https://www.cho-kaguyahime.com/special/detail.html?id=1024)：涉及原作角色或素材时应查阅的权利人说明。SVG 或 CSS 是实现格式，不代表自动取得授权。

当前主题内嵌 `assets/tsukuyomi-{city,gate,fish,fish-swimming,mirror,mascots,mascots-living}.svg` 场景、四位伙伴的矢量二创及静态备用图与 `assets/stage-clouds.svg` 云纹，不包含官方 PNG、Logo、音乐、字体或远程资源。云纹沿用本项目 v0.2.0 的原创源文件；城市与舞台图层由本项目 v0.4.0 原创场景拆分而成，v0.7 的游鱼变形由开发脚本基于原始骨架路径生成。粉色伙伴和狐狸头分别由 `scripts/render-mendako.mjs`、`scripts/render-fox.mjs` 提供纯渲染函数，随角色生成器输出；模块名不作为官方身份依据。项目未在本文档中代替权利人作出授权声明，也未擅自选择或推定软件许可证。
