---
title: "第 15 章 Tailwind CSS：用类名写样式"
---

**贯穿作品 · 小北的网站**

第 14 章结束时，小北的主页已用 React 重构完成，组件拆得整整齐齐。只有一样东西越看越别扭：第 5 到 7 章攒下来的 CSS 文件跟着项目一路搬过来，已经三百多行。想改照片墙的间距，先得在文件里翻半天，找到 `.photo-wall` 在哪一行。更头疼的是起名：`.card` 用过了，就冒出 `.card2`、`.new-card`，连他自己都记不清哪个是哪个。

同学给他看了一个网站的源码：几乎没有自己定义的类名，每个元素的 class 里直接写着 `flex`、`p-4`、`text-gray-500` 这样的短词。同学说这叫 Tailwind CSS：把样式拆成现成的小类名，直接拼在元素身上。

本章跟着小北给主页换上 Tailwind 新装：讲思路、做接入、学常用类名、改造导航栏和照片墙。

## 15.1 换个思路：在类名里直接写样式

回忆第 5 章的传统写法：让一个按钮变蓝，要分两步——先在 CSS 文件里定义类，再把类挂到按钮上。

```css
/* style.css */
.btn-primary {
  background-color: #3b82f6;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
}
```

```jsx
<button className="btn-primary">联系我</button>
```

Tailwind 的思路正好反过来：**它预先准备了成千上万个"只管一件事"的小类名，你把它们拼在元素上就行，不用自己写 CSS。** 这种小类名有个正式名字，叫**工具类**。同一个按钮用 Tailwind 写：

```jsx
<button className="bg-blue-500 text-white px-4 py-2 rounded-lg">
  联系我
</button>
```

对照着读，这些类名几乎就是 CSS 属性换了个说法：

| 工具类 | 等价的 CSS | 管什么 |
|---|---|---|
| `bg-blue-500` | `background-color: 蓝色` | 背景色 |
| `text-white` | `color: white` | 文字颜色 |
| `px-4` | `padding-left/right: 16px` | 左右内边距 |
| `py-2` | `padding-top/bottom: 8px` | 上下内边距 |
| `rounded-lg` | `border-radius: 8px` | 圆角 |

（`bg-blue-500` 末尾的 500 是色阶，15.3 会讲。）

好处坏处都老实讲。先说好处：

1. **不用再给类起名。** 写传统 CSS，一半纠结都在起名：这个盒子叫 card 还是 box？工具类里样式就是类名本身，省掉这一步。
2. **改样式不用切文件。** 在 React 组件里，结构和样式写在同一处，眼睛不用在两个文件之间来回跳。
3. **删代码不心虚。** 传统 CSS 里删一个类，总担心别的页面还在用它；工具类只作用于写它的元素，删元素就等于删样式，不牵连别人。

不方便的地方也有三条：

1. **类名会很长。** 一个元素挂十来个工具类很常见，第一次看觉得挤。
2. **要记一批常用类名。** 好在高频的就几十个（15.3 有速查表），写两周就熟了。
3. **不懂 CSS 原理会吃亏。** 工具类的本质还是 CSS，`flex`、`grid`、`padding` 就是第 5 到 7 章那些概念。**Tailwind 不是让你跳过 CSS，而是换一种方式写 CSS。**

## 15.2 接入 Tailwind：安装与配置

动手把 Tailwind 接进第 14 章的 React 项目。先确认工具：第 2 章装过 Node.js，npm 随它一起装好。在 VS Code 里打开终端（菜单"终端 → 新建终端"），输入 `node -v` 能显示版本号就可以开工。

第一步，进入项目文件夹，安装两个包：

```bash
cd 你的项目文件夹
npm install tailwindcss @tailwindcss/vite
```

`tailwindcss` 是本体；`@tailwindcss/vite` 是官方给 Vite 项目的插件（第 13 章的项目正是 Vite 搭的），要一起装。

第二步，打开根目录的 `vite.config.js` 启用插件（只多两处，注释标出来了）：

```jsx
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 新增这一行

export default defineConfig({
  plugins: [react(), tailwindcss()], // 数组里新增 tailwindcss()
})
```

第三步，把入口 CSS 文件 `src/index.css` 的内容换成一行：

```css
@import "tailwindcss";
```

这一行把 Tailwind 的工具类引入项目：你在任何组件里写下的工具类，都会被它扫描到并生成样式。原有的老样式先别删，15.5 再清理。

第四步，重启开发服务器（`npm run dev` 还开着的，先按 Ctrl+C 停掉，Windows 和 Mac 一样）：

```bash
npm run dev
```

改了配置文件必须重启才生效，这是新手最常漏的一步。

第五步，验证接入：给 `src/App.jsx` 里某个元素（比如大标题）的 `className` 末尾加 `bg-yellow-300`，保存看浏览器，背景变黄就说明 Tailwind 在工作。验证完删掉它。

提醒一句版本差异：本书按主流的 Tailwind v4 写法接入。网上老教程若让你建 `tailwind.config.js`、在 CSS 里写三行 `@tailwind` 指令，那是 v3 的旧流程，不要混着用；拿不准以官方文档（tailwindcss.com）为准。

## 15.3 常用工具类：间距、颜色、字体与布局

![图：Tailwind 类名里冒号前是条件、冒号后是工具类](../images/fig-ch15-tailwind-class.svg)

Tailwind 类名多到吓人，但日常高频的就几组。先讲清一个规律：**很多类名是"缩写 + 数字"，数字代表档位。** 间距以 4px 为一档：1 档 4px、2 档 8px、4 档 16px、8 档 32px。所以 `p-4` 是 16px 内边距，对上 15.1 表格里的 `px-4`、`py-2`。

**间距组**（p 是 padding 内边距，m 是 margin 外边距）：

| 类名 | 含义 |
|---|---|
| `p-4` | 四个方向内边距 16px |
| `px-4` / `py-2` | 左右内边距 / 上下内边距 |
| `pt-2` 等 | 单个方向（t / r / b / l = 上 / 右 / 下 / 左） |
| `m-4` / `mx-auto` | 外边距 16px / 左右自动——水平居中 |
| `gap-4` | flex / grid 里子元素之间的缝隙 16px |

**颜色组**：`bg-` 管背景，`text-` 管文字，`border-` 管边框，后面跟"颜色名 + 色阶"。色阶数字越大越深：`gray-100` 很浅，`gray-900` 接近黑。常用组合：底色 `bg-gray-100`、正文 `text-gray-700`、次要文字 `text-gray-500`。

**字体与文字组**：

| 类名 | 含义 |
|---|---|
| `text-sm` / `text-base` / `text-lg` / `text-xl` / `text-2xl` | 字号从小到大 |
| `font-bold` | 加粗 |

注意：`text-lg` 是字号、`text-gray-700` 是颜色，都以 `text-` 开头，靠后面的词区分，初学最容易看混。

**布局组**：其实就是第 6 章的 Flex 和 Grid，换了个写法：

| 类名 | 含义 |
|---|---|
| `flex` | 弹性布局，子元素横向排开 |
| `items-center` | 子元素在交叉轴上居中（flex 里常指垂直居中） |
| `justify-between` | 子元素两端对齐，中间留空 |
| `grid` / `grid-cols-3` | 网格布局 / 分成 3 列 |
| `w-full` | 宽度撑满父元素 |
| `rounded-lg` / `shadow-md` | 圆角 / 阴影 |

还有一条：类名必须**完整写在源码里**，不要拿字符串拼接凑（比如把颜色名拼在 `bg-` 后面）——Tailwind 靠扫描完整类名生成样式，拼出来的它看不见。

## 15.4 响应式与状态变体：sm: 与 hover: 怎么读

前面的工具类都是"无条件生效"。Tailwind 还有一招：给类名加前缀，让它只在某种条件下生效，这种前缀叫**变体**。读法：**冒号前是条件，冒号后还是你认识的工具类。**

先看状态变体 `hover:`（鼠标悬停时），就是第 7 章 `:hover` 伪类的另一种写法：

```jsx
<button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
  联系我
</button>
```

读作"平时 blue-500，悬停时换更深的 blue-600"；`focus:`（输入框被点中时）用法一样。

再看响应式变体 `sm:`、`md:`、`lg:`：屏幕宽度达到某个门槛（术语叫**断点**）时才生效，`sm:` 是 640px、`md:` 是 768px、`lg:` 是 1024px。规则是**手机优先**：不带前缀的管小屏，带前缀的从对应宽度起接管。

照片墙是最典型的例子——第 6 章用媒体查询写过的效果，现在只需要一行：

```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 照片卡片们 */}
</div>
```

逐段读：`grid` 开网格；`grid-cols-1` 默认一列（手机）；`sm:grid-cols-2` 宽过 640px 两列；`lg:grid-cols-3` 宽过 1024px 三列；`gap-4` 是卡片缝隙。一句话：**从 1 列起步，屏幕越宽，列数越多。**

最后一个小坑：冒号和类名之间**不能加空格**，写成 `hover: bg-blue-600` 就不生效，而且不报错，只是悄悄没效果。

## 15.5 贯穿作品：给 React 版主页换上新装

现在动手改造。原则只有一条：**一个组件一个组件来，改完一个就去浏览器确认效果**——真出问题，才知道是哪一步。

先改导航栏（它的样式还在老 CSS 文件里）：

```jsx
// src/components/Header.jsx（改造前）
<header className="site-header">
  <div className="logo">小北的空间</div>
  <nav className="nav-links">
    <a href="#home">首页</a>
    <a href="#photos">照片墙</a>
    <a href="#notes">学习笔记</a>
    <a href="#contact">联系我</a>
  </nav>
</header>
```

导航栏要做的事：横向排开、两端对齐、留白、加一条底分隔线。用工具类重写：

```jsx
// src/components/Header.jsx（改造后）
<header className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
  <div className="text-xl font-bold">小北的空间</div>
  <nav className="flex gap-6 text-gray-600">
    <a href="#home" className="hover:text-blue-500">首页</a>
    <a href="#photos" className="hover:text-blue-500">照片墙</a>
    <a href="#notes" className="hover:text-blue-500">学习笔记</a>
    <a href="#contact" className="hover:text-blue-500">联系我</a>
  </nav>
</header>
```

逐块读：`flex` 加 `items-center` 同一行、垂直居中；`justify-between` 推向两端；`px-6 py-4` 留白；`border-b border-gray-200` 底边线；`hover:text-blue-500` 是 15.4 的悬停变蓝。这些现在全摆在眼前。

再改照片墙。它的卡片由列表渲染生成，改造前挂着老类名 `.photo-card`，改造后：

```jsx
// src/components/PhotoWall.jsx（节选）
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {photos.map((photo) => (
    <figure key={photo.id} className="rounded-lg overflow-hidden shadow-md">
      <img src={photo.src} alt={photo.title} className="w-full" />
      <figcaption className="p-3 text-sm text-gray-500">{photo.title}</figcaption>
    </figure>
  ))}
</div>
```

外层就是 15.4 的响应式网格。卡片上：`rounded-lg` 圆角、`shadow-md` 阴影、`overflow-hidden` 防照片直角戳出圆角；说明文字 `p-3` 留白、`text-sm` 小字、`text-gray-500` 次要灰。

两个组件都确认没问题，再清理老 CSS：`.site-header`、`.photo-card` 这些没人用的类可以删。**一小批一小批删，每删一批刷新确认一次。** 没改造到的先留着老样式。迁到最后，三百多行的 CSS 文件只剩寥寥几行。

## 本章要点

- 核心思路：不自己定义类，把现成的工具类拼在元素上写样式。
- 工具类只管一件事：`bg-` 背景、`text-` 文字、`p-` / `m-` 间距；数字是档位，间距 1 档 4px。
- 接入三步：装 `tailwindcss` 和 `@tailwindcss/vite`、`vite.config.js` 里启用插件、入口 CSS 写 `@import "tailwindcss";`，再重启开发服务器。
- 变体是类名前面的条件：`hover:` 悬停、`sm:` / `md:` / `lg:` 宽度达断点；冒号后不能加空格。
- 响应式是手机优先：不带前缀管小屏，带前缀从对应宽度起接管，如 `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`。
- Tailwind 不是 CSS 的替代品，而是另一种写法，第 5 到 7 章的基本功照样用得上。

## 动手 Kata

1. **先证明 Tailwind 是活的**：给 `src/App.jsx` 最外层元素加 `bg-yellow-300`，保存看是否变黄；确认后换成 `bg-gray-100` 当底色。做完应该看到：背景先变黄、再变浅灰。
2. **改造"联系我"按钮**：把主页里联系按钮的老类名删掉，换成 `bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600`。做完应该看到：蓝底白字圆角按钮，悬停变深蓝。
3. **给照片墙装上响应式网格**：把照片墙最外层容器改成 `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`。做完应该看到：拖动窗口宽度，照片在 1、2、3 列间自动切换。
4. **给学习笔记列表分出层次**：给笔记标题加 `text-lg font-bold`、日期加 `text-sm text-gray-500`、条目间用 `border-b border-gray-200` 分隔。做完应该看到：标题醒目、日期低调、条目间有细线。

## 翻车现场

小北兴致勃勃地把导航栏类名全换成工具类，保存，回到浏览器——页面"裸奔"了：样式全部消失，链接竖着排，照片大得吓人，像一夜回到第 3 章的纯 HTML 时代。他对着速查表查了半小时类名，一个错都没找出来。

真相是他漏了接入第三步：`src/index.css` 里那行 `@import "tailwindcss";` 压根没写。Tailwind 没被引入，他写的工具类对浏览器只是"不认识的普通类名"，一个都不生效。

最坑的是**它不报错**：控制台干干净净——在浏览器看来，className 里写什么都合法，它只是找不到对应样式。类名拼错同理：小北后来把 `bg-blue-500` 敲成 `bg-bule-500`，同样不报错、不生效，想了十分钟才发现。

记住这条排查顺序，样式不生效时照着来：

1. 先做"变黄测试"：给任意元素加 `bg-yellow-300`，不变色就是接入问题，别查类名。
2. 查接入三步：包装了吗、插件加了吗、`@import` 写了吗；改完配置，开发服务器重启了吗。
3. 接入没问题、只有个别类不生效，再查拼写：单词、色阶数字、冒号后有没有空格。

养成这个顺序，"样式怎么没了"的排查时间能从半小时降到两分钟。

<!-- playground: ch15 -->
