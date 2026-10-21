---
title: "第 10 章 DOM 与事件：让网页动起来"
---

**贯穿作品 · 小北的网站**

小北的主页已经挺好看了：照片墙排得整整齐齐，用手机打开也不乱。可是他总觉得少了点什么——页面是"死"的。鼠标点上去没反应，在联系表单里写了字，点按钮也不会发生任何事。室友给他提了个建议："你不是总说事情多记不住吗？在主页上加个待办清单呗，想到什么随手记下来，做完一件划掉一件。"

回顾一下分工：HTML 负责把东西"摆"在页面上，CSS 负责给它们"打扮"，这两位都没有"回应用户"的本事。能干这件事的，是第 8、9 章里一直待在控制台里的 JavaScript——这一章，我们把它请进真正的网页。学完之后，小北的主页上会多出一个能用的待办清单：打字、点"添加"，事情就出现在列表里；做完点一下划掉；不想要了，点删除按钮拿掉。靠的就是这一章的两样东西：**DOM 和事件**。

## 10.1 DOM 是什么：网页在代码里的样子

![DOM 树示意图：左边是页面线框，右边是对应的 html 树状结构](../images/fig-ch10-dom-tree.svg)

先看一个问题：JavaScript 想改页面上的标题，它要去哪里改？总不能钻进显示器里。它需要的，是网页在代码世界里的一个"代表"。

浏览器打开网页时，会把 HTML 从头到尾读一遍，在内存里整理成一棵**树**，就像你电脑里的文件夹，或者一本族谱：最上面是树根 `<html>`，分出 `<head>` 和 `<body>` 两个大枝，`<body>` 下面再挂 `<h1>`、`<p>`、`<ul>`，`<ul>` 下面又挂着一个个 `<li>`。

这棵树就叫 **DOM**（Document Object Model，文档对象模型）。"文档"指网页本身，"对象模型"先理解成"用代码表示出来的样子"就行。**一句话记住：DOM 是浏览器把网页整理成的一棵树，专门留给 JavaScript 操作。** 这棵树在 JavaScript 里的总入口叫 `document`（文档对象）。打开任意网页的控制台，输入这两行试试：

```javascript
document.title        // 回车，控制台会显示这个网页的标题
document.body         // 回车，能看到 body 里的全部内容被打印出来
```

顺着 `document` 这棵树根，你能摸到页面上的任何一部分。

还有一个误会要提前说清：**JavaScript 改的是内存里这棵"活"的树，不是硬盘上的 .html 文件。** 页面立刻变样，文件却一个字没动——一刷新就变回原样。改动存不住的问题，第 11 章用 localStorage 解决；这一章先把"能动起来"学到手。

## 10.2 找到元素，改它的内容和样式

操作 DOM 的第一步永远是"找到元素"。最常用的工具是 `document.querySelector()`（查询选择器）：括号里写一个 CSS 选择器——第 5 章学过的那种写法，比如 `#title` 是找 id 为 title 的元素，`.note` 是找第一个带 note 类的元素——它就把找到的元素交给你。它的兄弟 `querySelectorAll()` 会把所有匹配的元素一并找出来，后面会用到。

新建文件 `dom-test.html`，把下面这段完整存进去，用浏览器打开：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>DOM 小实验</title>
</head>
<body>
  <h1 id="title">原来的标题</h1>

  <script>
    const title = document.querySelector('#title');
    title.textContent = '你好，小北！';
    title.style.color = 'tomato';
  </script>
</body>
</html>
```

标题已经变成红色的"你好，小北！"了。逐行看 `<script>` 里的三行：

1. `querySelector('#title')` 找到那个 `<h1>`，存进变量 `title`。注意，变量里存的不是一段文字，而是**元素本身**，接下来对变量做的事都会直接发生在页面上。
2. `textContent` 是元素的"文字内容"属性。给它赋值（把右边的值放进左边，第 8 章的老朋友），文字就当场被换掉。
3. `style` 是元素的"样式"对象，`title.style.color = 'tomato'` 相当于设置 CSS 的 `color: tomato`。再补一行 `title.style.fontSize = '40px'`，字号也会变大。

一个必须注意的写法差异：CSS 里写作 `font-size` 的属性，在 JavaScript 里要写成 `fontSize`——**去掉横线，后面单词的首字母大写**（这种写法叫驼峰写法）。原因很实际：横线在 JavaScript 里是减号，名字里没法带它。`background-color` 对应 `backgroundColor`，其余同理；设置的值要用引号包起来，尺寸带单位 `px`。

最后预警一句高频报错：选择器拼错、或者页面上根本没有这个元素时，`querySelector` 会返回 `null`（"空无一物"）。接着对 `null` 使用 `.textContent`，控制台就报红字 `Cannot read properties of null`（读不了空东西的属性）。**以后看到这句红字，第一反应应该是：元素没找到，回去检查选择器和 id 对不对得上。**

## 10.3 事件：点击、输入都有反应

到现在为止，我们的代码都是页面一打开就从头跑到尾。待办清单需要的却是"等用户行动"：点了按钮，才添加一条。这个"等"，靠的就是**事件**（event）。

事件就是用户在页面上做的一个动作：点击鼠标、敲下一个键、在输入框里打字……浏览器一直在旁边盯着，动作一发生就记下来。我们要提前做的叫"订阅"：告诉浏览器"这个按钮被点击时，请帮我执行这段代码"。

订阅的方法叫 `addEventListener`（添加事件监听器），"监听器"可以想成一只竖起来的耳朵，专门听某一种动静。把 10.2 的例子改一改：

```html
<p id="msg">按钮还没被点过。</p>
<button id="btn">点我一下</button>

<script>
  const btn = document.querySelector('#btn');
  const msg = document.querySelector('#msg');

  btn.addEventListener('click', function () {
    msg.textContent = '按钮被点啦！';
  });
</script>
```

点一下按钮，段落立刻变成"按钮被点啦！"。`addEventListener` 的两个参数：第一个 `'click'` 是**事件名**，表示"我要听的是点击"；第二个是一个**函数**（第 9 章的老朋友），一段"先存起来、等会儿再执行"的代码。

**关键理解：页面打开时这个函数并不会执行，只是先登记在那里；按钮真的被点击，浏览器才回头调用它。** 每点一次就调用一次，所以可以反复触发。新手常犯的一个小错：传函数时不要加括号去"调用"它——要传的是函数本身，让浏览器在合适的时机调用；直接调用，就变成一打开页面立刻执行了。

除了 `'click'`，常用的事件名还有 `'input'`（输入框内容每变化一次就触发，本章 Kata 会用）和 `'submit'`（表单提交时触发，下一节登场）。

## 10.4 表单交互：拿到用户输入的值

待办清单的核心问题来了：用户在输入框里打的字，代码怎么读到？

输入框的内容有个专门的属性叫 `value`（值）。它和 `textContent` 不是一回事：标题、段落这类"展示型"元素的文字在 `textContent` 里；输入框这种"收集型"元素，用户打进去的内容存在 `value` 里：

```javascript
const input = document.querySelector('#todo-input');
const text = input.value;   // 用户此刻在输入框里写的内容
```

但时机必须想清楚：**`value` 要在事件发生的那一刻去读。** 页面刚打开时输入框是空的，代码一运行就去读，只能读到空字符串；等用户打完字、点了按钮，在事件函数里去读，才能拿到真正输入的内容。读一次，拿到的就是那一刻的值。

再解决表单的一个经典坑。把输入框和按钮放进 `<form>` 里（第 4 章学过，语义上更规范），点按钮时浏览器会执行表单的**默认行为**：把表单提交出去，页面随之刷新——辛苦加上去的内容一刷新全没了（10.1 说过，DOM 改动刷新即还原）。

对策：在事件函数里接住这次提交的"事件对象"，调用它的 `preventDefault()` 方法拦下默认行为（preventDefault 直译就是"阻止默认动作"）。注意监听的是 `form` 上的 `'submit'`，不是按钮上的 `'click'`：

```javascript
const form = document.querySelector('#todo-form');
form.addEventListener('submit', function (event) {
  event.preventDefault();   // 先把页面刷新拦下来
  // 然后在这里写自己的处理：读 value、添加内容……
});
```

括号里的 `event` 就是浏览器递过来的"这次事件的详细记录"，要拦、要读的信息都从它身上拿。再养成一个小习惯：处理完后把输入框清空（给 `input.value` 赋空字符串 `''`），方便接着输入下一条。

## 10.5 贯穿作品：给个人主页做一个待办清单

把这一章的武器合起来，再认识两个新动作就齐活了：`document.createElement('li')` 凭空**新建**一个元素（create 是"创建"，element 是"元素"），刚建出来时它还不在页面上；`父元素.appendChild(新元素)` 把新元素**挂到**某个元素下面成为它的子元素（append 是"追加"），挂上后页面才显示。删除则用 `元素.remove()`，把自己从页面上摘掉。

完整代码如下。新建文件 `todo.html`，整份复制保存，用浏览器打开：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>小北的待办清单</title>
  <style>
    .done {
      text-decoration: line-through;
      color: #999;
    }
  </style>
</head>
<body>
  <h1>小北的待办清单</h1>

  <form id="todo-form">
    <input id="todo-input" type="text" placeholder="想做点什么？">
    <button type="submit">添加</button>
  </form>

  <ul id="todo-list"></ul>

  <script>
    const form = document.querySelector('#todo-form');
    const input = document.querySelector('#todo-input');
    const list = document.querySelector('#todo-list');

    form.addEventListener('submit', function (event) {
      event.preventDefault();              // 1. 拦住提交，别让页面刷新

      const text = input.value.trim();     // 2. 读输入，trim() 去掉首尾空格
      if (text === '') {
        return;                            // 3. 是空的就不加，直接结束
      }

      const li = document.createElement('li');  // 4. 新建一条待办
      li.textContent = text;

      li.addEventListener('click', function () {  // 5. 点文字：划掉或恢复
        li.classList.toggle('done');
      });

      const del = document.createElement('button');  // 6. 配一个删除按钮
      del.textContent = '删除';
      del.addEventListener('click', function (event) {
        event.stopPropagation();           //    这次点击到此为止，别再往外传
        li.remove();                       //    把整条删掉
      });
      li.appendChild(del);

      list.appendChild(li);                // 7. 挂到列表上，页面显示出来
      input.value = '';                    // 8. 清空输入框，方便输入下一条
    });
  </script>
</body>
</html>
```

几个关键点逐个说清：

**为什么 `<script>` 放在 `</body>` 之前？** 浏览器从上往下读页面。脚本放在最后，轮到它运行时，上面的表单、列表都已经建进 DOM 树，三行 `querySelector` 才找得到东西。放进 `<head>` 就会翻车——本章的翻车现场讲的就是这个跟头。

**"勾选完成"是怎么实现的？** 每条待办被点击时执行 `li.classList.toggle('done')`。`classList` 是元素的"类名名单"，`toggle` 是"切换"：没有 `done` 就加上，有了就摘掉。文件头部写好了 `.done` 的样式：删除线、文字变灰。类名加上，样式生效；摘掉，消失。**用增减类名切换外观，是 JavaScript 与 CSS 配合的经典手法**，比在 JS 里一条条改 `style` 干净得多。

**删除按钮里的 `stopPropagation()` 防什么？** 删除按钮位于 `<li>` 里面。点击它时，这个"点击"会像水波一样由里向外传（术语叫冒泡），传到外层 `<li>` 把"划掉"也触发一次——多此一举，有时还带来奇怪的副作用。`stopPropagation()` 的意思是"这次点击到我为止，不许再往外传"。先拦住，再删除，干干净净。

**`trim()` 和那个 `if` 在守什么门？** `trim()` 去掉字符串首尾的空格。不守门的话，用户只敲几个空格点添加，就会多出一条"看不见的空待办"。先修剪、再判断是否为空，是就 `return` 提前结束——**在入口处把不合格的输入挡回去，是写交互代码的基本功。**

想把清单搬进主页也行：把 `<form>`、`<ul>` 和整段 `<script>` 复制到主页对应位置（script 仍放 `</body>` 前），样式补进主页 CSS，效果一样。写下"背单词"点添加，点一下划掉，再点删除——都顺畅走完，你的第一个网页应用就诞生了。美中不足的是刷新一下就全消失了，下一章我们来补上这一课。

## 本章要点

- DOM 是浏览器把网页整理成的一棵树，`document` 是 JavaScript 操作这棵树的总入口；改动只发生在内存里，刷新即还原。
- `querySelector` 用 CSS 选择器找元素；改文字用 `textContent`，改样式用 `style`，样式属性名在 JS 里写成驼峰形式。
- 找不到元素时 `querySelector` 返回 `null`，对它继续操作就报 `Cannot read properties of null`，先查选择器。
- `addEventListener('click', 函数)` 是"订阅"：动作发生时，浏览器才调用你登记的函数。
- 输入框的内容用 `.value` 读，且必须在事件发生的那一刻读；表单提交先用 `event.preventDefault()` 拦住页面刷新。
- `createElement` 新建、`appendChild` 挂上树、`remove()` 删除，页面内容就能动态增减；`<script>` 放在 `</body>` 之前，保证运行时元素已存在。

## 动手 Kata

1. **变色按钮**：做一个按钮和一段文字，每点一次按钮，文字在红色和黑色之间切换一次。提示：在事件函数里先看 `style.color` 现在是什么颜色，再换成另一种；也可以用变量记一个"当前状态"。做完应该看到：连点三下，颜色变三回。
2. **实时字数统计**：在输入框下面放一行小字"你已经输入了 0 个字"，用户每打一个字数字立刻跟着变。提示：监听 `'input'` 事件，在函数里读 `input.value.length`（字符串的长度），再写进那行小字。做完应该看到：打字时数字上涨，删字时回落。
3. **一键清空**：给待办清单加一个"全部清除"按钮，点击后条目全部消失，但添加功能照常可用。提示：把 `list` 的 `textContent` 设为空字符串，它下面的子元素会被一并清掉。做完应该看到：加满五条，点一下按钮，列表瞬间变空。
4. **还剩几件**：在标题下面显示"还剩 X 件没做"，添加、勾选、删除后自动更新。提示：每次变化后用 `querySelectorAll('#todo-list li:not(.done)')` 数一遍没划掉的条数（`:not(...)` 是 CSS 里"排除"的写法），把数量写进页面。做完应该看到：勾掉一件，数字立刻减一。

## 翻车现场

小北第一次独立写这个清单时，心想"代码要放整齐"，自作主张把 `<script>` 从 `</body>` 前挪进了 `<head>`。刷新之后，输入框里写什么、点多少下添加，列表都纹丝不动。他按 F12 打开控制台，一行红字赫然在目：`Uncaught TypeError: Cannot read properties of null (reading 'addEventListener')`。

原因正是 10.5 预告过的：浏览器读到 `<head>` 里的脚本时，`<body>` 里的表单还没被读到，DOM 树上根本没有这个元素，`querySelector` 只好交回 `null`；代码接着对 `null` 调用 `addEventListener`，当场报错，整段脚本停摆——后面的监听一个都没登记上，按钮当然怎么点都没反应。

改法只有一个动作：把 `<script>` 挪回 `</body>` 之前，一切恢复正常。记住这条经验：**看到 `Cannot read properties of null`，先想"是不是元素还没出现，或者没找到"，再去查选择器的拼写。**

<!-- playground: ch10 -->
