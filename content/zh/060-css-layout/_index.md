---
title: "第 6 章 CSS 布局：把页面排整齐"
---

**贯穿作品 · 小北的网站**

第 4 章，小北用纯 HTML 做了个人主页；第 5 章又给它上了颜色、改了字体。按理说该好看了，可一打开他还是皱眉：导航链接竖着往下排，照片一张接一张往下摞，几个板块全挤在一起，像一间东西摊满地的宿舍。

问题不在颜色，也不在字体，而在**排版**：元素们各站各的，没有队形。这一章就来学 CSS 里管排版的部分——布局。学完，主页会有一条横着的导航栏、一面整齐的照片墙，立刻有了"收拾过"的样子。

## 6.1 布局这件事：先看懂文档流

你写的 HTML，浏览器不是随便摆的：它默认按"读书写字"的顺序放元素，从上往下、从左往右，一个接一个。这个默认的排队方式叫**文档流**。

队伍里有两种"性格"的元素。一种是**块级元素**，比如 `<div>`、`<p>`、`<h1>`、`<section>`：它们独占一整行，后面的元素只能排到下一行去。另一种是**行内元素**，比如 `<a>`、`<span>`：它们随和，能和别人挤在同一行里，像一句话里的一个个词。

```html
<p>第一段，自己一行</p>
<p>第二段，又是一行</p>
<span>词一</span>
<span>词二</span>
```

这段代码里，两个 `<p>` 各占一行，两个 `<span>` 却肩并肩挤在同一行——这就是文档流的默认效果。

那"布局"在改什么？改的是每个元素的 `display` 属性——"这个元素打算怎么排队"：`block` 是块级、独占一行；`inline` 是行内、跟人挤。标签自带默认 display（`<p>` 天生 block、`<a>` 天生 inline），但你可以在 CSS 里改掉它：

```css
span { display: block; }  /* 让 span 独占一行 */
```

给 `<span>` 写上这一句，它立刻"翻脸"，一个词占一行。顺带认识 `inline-block`：能挤一行、又能设宽高，做按钮时常用。

**记住一句话：布局，就是你亲手接管元素的排队方式。** 这一章要学的 Flex 和 Grid，其实都是 `display` 的新取值——只不过它们管的不是元素自己，而是元素内部的子元素怎么排队。

## 6.2 Flex：一维排版的好手

先说人话：Flex 专门管"一条线"上的排版——让一排（或一列）元素整齐站队，该居中居中，该分散分散。导航栏、按钮组、卡片行，背后大多是它。

用 Flex 有一条铁规矩，先记住：**`display: flex` 写在容器（父元素）上，排的是它里面的子元素。** 就像喊口令的是老师，听口令的是学生——口令喊错了对象，全班纹丝不动（翻车现场有实例）。

来看小北的导航栏，HTML 是一串链接套在 `<nav>` 里：

```html
<nav class="menu">
  <a href="#">首页</a>
  <a href="#">照片墙</a>
  <a href="#">学习笔记</a>
  <a href="#">联系我</a>
</nav>
```

给容器 `.menu` 写上 Flex：

```css
.menu {
  display: flex;            /* 排里面的链接 */
  justify-content: center;  /* 横向居中 */
  align-items: center;      /* 纵向居中 */
  gap: 24px;                /* 间距 24px */
  height: 56px;             /* 栏高 */
}
```

逐个说：`justify-content` 管横向对齐，常用值有 `flex-start`（靠左）、`center`（居中）、`space-between`（两端顶格、中间均分）。`align-items` 管纵向对齐，`center` 即上下居中——没有它，链接会贴着导航栏顶部。`gap` 专门负责元素间的空隙，不用再给每个链接算边距。

再认识两个词：Flex 排队的主线叫**主轴**，默认横着；与它垂直的叫**交叉轴**。`justify-content` 管主轴、`align-items` 管交叉轴。想改成竖排，给容器加 `flex-direction: column`。

## 6.3 Grid：二维排版的棋盘

Flex 管一条线，可照片墙是"几行几列"的一张网。这时候轮到 Grid：它像一张棋盘，同时管行和列，专做二维排版。

和 Flex 一样，口令也下在容器上。最关键的一句是 `grid-template-columns`——"分几列、每列多宽"：

```html
<div class="photos">
  <div class="cell">照片 1</div>
  <div class="cell">照片 2</div>
  <div class="cell">照片 3</div>
  <div class="cell">照片 4</div>
  <div class="cell">照片 5</div>
  <div class="cell">照片 6</div>
</div>
```

（先用色块假装照片。）

```css
.photos {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;  /* 三列，每列一份宽 */
  gap: 12px;                            /* 格子之间的空隙 */
}
.cell {
  background: #dbeafe;
  height: 120px;
}
```

`fr` 是 Grid 专用的单位，读作"份"：`1fr 1fr 1fr` 就是把容器宽度平均分成三份，一列一份。想让第一列宽一倍，可以写 `2fr 1fr 1fr`。子元素什么都不用写，会按顺序自己填格子，第一行满了自动去第二行——6 个格子正好 3 列 2 行。

偷懒写法：`grid-template-columns: repeat(3, 1fr);` 和写三个 `1fr` 完全等价，列多了不用手数。

**分工记住一句：一排导航、一条按钮组用 Flex；照片墙、卡片阵列这种成片区域用 Grid。** 真实项目里两个一起上是常态。

## 6.4 定位：position 与谁压着谁

前面两种布局里，元素都老老实实在文档流里排队。但有些元素天生不合群：照片右上角的"NEW"角标、钉在屏幕右下角的"回到顶部"按钮——它们需要**定位**（position）。

`position` 有四个常用值，一句话一个：

- `static`：默认值，老老实实在队里站着，前面学的都是它。
- `relative`（相对定位）：人还在队里，但允许自己相对原来的位置挪一小步。
- `absolute`（绝对定位）：直接离队，相对于最近的、设了定位的祖先元素摆放。
- `fixed`（固定定位）：离队并钉在屏幕上，页面滚到哪里它都在，像电梯里的楼层按钮。

先看角标怎么做：

```html
<div class="card">
  <img src="photo-1.jpg" alt="小北的摄影作品">
  <span class="badge">NEW</span>
</div>
```

```css
.card {
  position: relative;   /* 卡片当参照物 */
}
.badge {
  position: absolute;    /* 角标离队 */
  top: 8px;              /* 距顶 8px */
  right: 8px;            /* 距右 8px */
}
```

这里藏着全章最重要的一条规矩：**`absolute` 的元素是拿祖先当参照物的，参照物必须是设了 `position`（一般是 `relative`）的那个祖先。** 先给 `.card` 写 `relative`，角标才会乖乖待在卡片右上角；忘了这句，它会一路往上找，最后跑到页面角落去（翻车现场有小北的亲身经历）。

最后认识 `z-index`：元素离队后可能互相重叠，谁在上面？数字大的压数字小的，比如角标写 `z-index: 2` 就稳稳盖在照片上。注意，它只对设了 `position` 的元素有效。

## 6.5 贯穿作品：给个人主页排个像样的版

把这一章的武器全用上，给"小北的空间"正式排版。下面是完整的 HTML 文件（在第 4 章主页基础上排导航栏、照片墙，再加回到顶部按钮），存为 `index-v2.html`，双击打开看效果。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>小北的空间</title>
<style>
  body { margin: 0; font-family: sans-serif; }
  /* 顶栏：Flex 两端对齐 */
  header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0 24px; height: 60px; background: #1e293b;
  }
  .logo { color: #fff; font-size: 20px; font-weight: bold; }
  .menu { display: flex; gap: 20px; }
  .menu a { color: #e2e8f0; text-decoration: none; }
  main { max-width: 900px; margin: 0 auto; padding: 24px; }
  /* 照片墙：Grid 三列 */
  .photos {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
  }
  .photos img { width: 100%; display: block; }
  /* 回到顶部：fixed 钉住 */
  .to-top {
    position: fixed; right: 20px; bottom: 20px;
    background: #2563eb; color: #fff;
    padding: 10px 14px; border-radius: 8px; text-decoration: none;
  }
</style>
</head>
<body>
  <header>
    <div class="logo">小北的空间</div>
    <nav class="menu">
      <a href="#">首页</a>
      <a href="#">照片墙</a>
      <a href="#">学习笔记</a>
      <a href="#">联系我</a>
    </nav>
  </header>
  <main>
    <section>
      <h2>关于我</h2>
      <p>我是小北，大一新生，喜欢摄影，这是我的个人网站。</p>
    </section>
    <section>
      <h2>照片墙</h2>
      <div class="photos">
        <img src="photo-1.jpg" alt="摄影作品 1">
        <img src="photo-2.jpg" alt="摄影作品 2">
        <img src="photo-3.jpg" alt="摄影作品 3">
        <img src="photo-4.jpg" alt="摄影作品 4">
        <img src="photo-5.jpg" alt="摄影作品 5">
        <img src="photo-6.jpg" alt="摄影作品 6">
      </div>
    </section>
  </main>
  <a class="to-top" href="#">回到顶部</a>
</body>
</html>
```

（照片文件名换成你自己的，图片和 HTML 放同一文件夹。）

打开看看：顶栏深色一整条，站名左、导航右；照片墙三列两行、间距均匀；往下滚动，"回到顶部"一直钉在右下角。**同一张主页，内容一个字没改，只是排了个版，气质立刻不一样**——这就是布局的威力。第 7 章再做全面美化，让它在手机上也好看。

## 本章要点

- 浏览器默认的摆放方式叫文档流：块级元素独占一行，行内元素和别人挤一行，`display` 决定元素怎么排队。
- Flex 管一维排版：`display: flex` 写在容器上，`justify-content` 管主轴对齐、`align-items` 管交叉轴对齐、`gap` 管间距。
- Grid 管二维排版：`grid-template-columns` 在容器上定义列，`fr` 是"份"，子元素自动填格子。
- `position` 让元素离队：`relative` 当参照物，`absolute` 相对最近的定位祖先摆放，`fixed` 钉在屏幕上。
- `z-index` 决定重叠时谁压谁，数字大者在上，且只对设了 `position` 的元素有效。
- 布局口令永远下在容器上，子元素是被排的对象——写错对象是最常见的翻车原因。

## 动手 Kata

**练习 1：排一排按钮组。** 写一个 `<div class="bar">` 放三个 `<button>`。给 `.bar` 写 `display: flex`，把 `justify-content` 依次改成 `flex-start`、`center`、`space-between`、`flex-end` 刷新对比。做完应该看到：按钮组被推来推去，`space-between` 时首尾顶格、中间均分。

**练习 2：照片墙变四列。** 复制 6.3 的照片墙，`grid-template-columns` 改成 `repeat(4, 1fr)`，格子加到 8 个。做完应该看到：4 列 2 行整齐排布。再试 `2fr 1fr 1fr 1fr`，看第一列是否变宽。

**练习 3：给照片加角标。** 拿 6.4 的卡片代码，把角标的 `right: 8px` 改成 `left: 8px`。做完应该看到：角标跑到左上角。再故意删掉 `.card` 上的 `position: relative` 刷新，亲眼看看"飞走的角标"，然后加回来。

**练习 4：让导航吸顶。** 给 6.5 的 `header` 加 `position: fixed; top: 0; left: 0; right: 0;`，再把正文复制几段凑长，滚动试试。做完应该看到：顶栏钉在顶部不动。你还会发现它盖住了正文开头——这是 `fixed` 的常见副作用，第 7 章教你处理。

## 翻车现场

小北第一次用 Flex 排导航栏，写了满满一屏 CSS，刷新一看——链接纹丝不动，还是挤在左边。他翻来覆去看了二十分钟，才发现问题出奇地简单：`display: flex` 被他写在了每一个 `<a>` 上，而不是包着它们的 `<nav>` 上。

为什么？**Flex 是老师对学生下口令：`display: flex` 写在谁身上，排的就是谁的"孩子"。** 写在链接上，等于让链接排里面的文字，当然没变化。把这句挪到容器 `.menu` 上，一刷新，链接立刻排成一行。

同一天他还翻了第二个车：给照片加"NEW"角标，`position: absolute` 一写，角标直接飞到整个浏览器的右上角。原因就是 6.4 那条规矩——角标要相对卡片摆放，前提是卡片先写 `position: relative` 当参照物；没写，它就一路往上找到页面根部去了。

**布局排不动、元素到处飞，先别怀疑浏览器，八成是口令下错了对象，或者忘了给参照物。**
