---
title: "第 14 章 React 实战：重构小北的网站"
---

**贯穿作品 · 小北的网站**

小北的个人主页已经有模有样了：自我介绍、照片墙、能加能勾能删的待办清单，一样不缺。可这几周改东西时他越来越别扭——代码全挤在少数几个文件里，想给待办清单加个功能，要翻半天，还得小心别碰坏旁边的照片墙；照片多加两张，又得复制粘贴好几段几乎一样的结构。

上一章你已经用 Vite 搭好了 React 项目的空架子。这一章，我们把小北的网站正式搬进去：先拆成一个个组件，再用 React 的方式重写照片墙和待办清单。搬完之后，网站外表和原来一模一样，内部却变成了积木——想改哪块，只动哪块。

## 14.1 组件拆分：把主页拆成积木

![图：从一整页代码重构成组件](../images/fig-ch14-refactor.svg)

拆组件的原则很朴素：**页面上一个相对独立、能单独说清“它负责什么”的区域，就是一个组件。** 拿小北的主页量一量，正好拆出四块：

| 组件 | 负责什么 | 文件 |
|---|---|---|
| Header | 站名和顶部导航 | `src/components/Header.jsx` |
| Profile | 自我介绍 | `src/components/Profile.jsx` |
| PhotoWall | 照片墙 | `src/components/PhotoWall.jsx` |
| TodoApp | 待办清单 | `src/components/TodoApp.jsx` |

文件组织有个小规矩：在 `src` 里新建 `components` 文件夹，一个组件一个文件，文件名和组件名一样、首字母大写；`App.jsx` 留在 `src` 根目录拼积木。先做 Header：新建文件夹和 `Header.jsx`，写入：

```jsx
function Header({ title }) {
  return (
    <header>
      <h1>{title}</h1>
      <nav>
        <a href="#profile">关于我</a>
        <a href="#photos">照片墙</a>
        <a href="#todo">待办清单</a>
      </nav>
    </header>
  );
}
export default Header;
```

站名没写死，而是用 props 从外面传进来（第 13 章学过：props 是父组件递给子组件的数据），想改站名只改传值的地方。再新建 `Profile.jsx`，把第 4 章的自我介绍搬进来：

```jsx
function Profile() {
  return (
    <section id="profile">
      <h2>关于我</h2>
      <p>你好，我是小北，一名大一新生。</p>
      <p>我喜欢摄影，爱背着相机在校园里到处拍。这个网站是我的小窝：放照片、记笔记，顺便练习刚学的建站本领。</p>
    </section>
  );
}
export default Profile;
```

最后打开 `src/App.jsx`，清掉 Vite 模板自带的内容，换成组装代码：

```jsx
import Header from "./components/Header";
import Profile from "./components/Profile";

function App() {
  return (
    <div>
      <Header title="小北的空间" />
      <main>
        <Profile />
        {/* 照片墙和待办清单，本章后面逐个搬进来 */}
      </main>
    </div>
  );
}
export default App;
```

终端里运行 `npm run dev`，应该能看到站名和自我介绍。先提醒一个常见报错：忘了写 `export default`，页面会报 “does not provide an export named 'default'”，补上那行就行；import 的文件名大小写要和真实文件完全一致，Windows 上写错可能暂时没事，换台电脑就会报错。

拆分时还要先想清：**每份数据归谁管，跟着“谁用它”走。** 照片基本不变，放数据文件；待办不停增删，state 住在 TodoApp 肚子里（14.3 细讲）；站名是 props 递给 Header 的只读数据。有这张地图，写代码就不会乱。

## 14.2 列表渲染：数据有多少，页面就有多长

先看笨办法：4 张照片就在 JSX 里手写 4 段 `<figure>`，周末又拍了 3 张，再粘贴 3 段——照片越多，代码越长，长得全是重复劳动。

React 的想法反过来：**先把数据排成数组，再让代码把数组“翻译”成页面。** 数据有 10 条页面就长 10 段，变成 20 条，一行代码都不用改。先新建和 `App.jsx` 同级的 `src/data.js`：

```js
export const photos = [
  { id: 1, src: "https://picsum.photos/seed/campus/400/300", title: "开学第一天的校门" },
  { id: 2, src: "https://picsum.photos/seed/lake/400/300", title: "傍晚的湖边" },
  { id: 3, src: "https://picsum.photos/seed/street/400/300", title: "老街的猫" },
  { id: 4, src: "https://picsum.photos/seed/mountain/400/300", title: "第一次爬山" },
];
```

每张照片是一个对象：`id` 是独一无二的编号，`src` 是图片地址（先用占位图网站 picsum 的，随时可换成自己的照片链接），`title` 是说明。再新建 `components/PhotoWall.jsx`：

```jsx
import { photos } from "../data";

function PhotoWall() {
  return (
    <section id="photos">
      <h2>我的照片墙</h2>
      <div className="photo-grid">
        {photos.map((photo) => (
          <figure key={photo.id}>
            <img src={photo.src} alt={photo.title} />
            <figcaption>{photo.title}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
export default PhotoWall;
```

核心是 `photos.map(...)`：`map` 把数组每一项挨个加工、返回新数组（第 9 章学过），这里的“加工”就是把每个照片对象变成一段 JSX。两个细节：JSX 里嵌表达式要用大括号 `{ }` 包起来；样式类名写 `className` 不写 `class`（第 13 章讲过）。

`key={photo.id}` 要专门说一句。**key 是 React 认人的标记：列表变化时，它靠 key 分清谁是谁。** 好比点名时全班都叫“同学”，有人请假就分不清少了谁；有了学号，谁来谁走一清二楚。key 必须独一无二、且同一条数据每次渲染不变，所以用数据的 `id`，不用数组下标——下标会随增删移位，React 认错人，勾选状态可能跑到别人身上。忘写 key 页面不会崩，但控制台会跳出黄色警告，先认个脸熟：

```text
Warning: Each child in a list should have a unique "key" prop.
```

最后拼进 App：顶部加一行 import，注释换成 `<PhotoWall />`，刷新就能看到照片墙。以后加照片只改 `data.js`。

## 14.3 状态与事件：待办清单 React 版

第 10 章用原生 JavaScript 写待办清单时，每加一条都要手动创建元素、设文字、塞进列表、绑按钮。React 版思路完全不同：**你只管改数据，页面由 React 自己重新画。** 这就是 state 的用武之地（第 13 章见过 `useState`，这一节把它用熟）。新建 `components/TodoApp.jsx`，先整体抄下来跑通，再逐块拆解：

```jsx
import { useState } from "react";

function TodoApp() {
  const [todos, setTodos] = useState([
    { id: 1, text: "复习 React 笔记", done: true },
    { id: 2, text: "去拍校园的银杏", done: false },
    { id: 3, text: "整理照片墙的照片", done: false },
  ]);
  const [inputText, setInputText] = useState("");

  function addTodo() {
    const text = inputText.trim();
    if (text === "") return;
    const newTodo = { id: Date.now(), text: text, done: false };
    setTodos([...todos, newTodo]);
    setInputText("");
  }

  function toggleTodo(id) {
    setTodos(
      todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo))
    );
  }

  function deleteTodo(id) {
    setTodos(todos.filter((todo) => todo.id !== id));
  }

  return (
    <section id="todo">
      <h2>我的待办清单</h2>
      <div>
        <input value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="想做什么？写下来" />
        <button onClick={addTodo}>添加</button>
      </div>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <label>
              <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(todo.id)} />
              <span style={{ textDecoration: todo.done ? "line-through" : "none" }}>{todo.text}</span>
            </label>
            <button onClick={() => deleteTodo(todo.id)}>删除</button>
          </li>
        ))}
      </ul>
      <p>还剩 {todos.filter((todo) => !todo.done).length} 件事没做完</p>
    </section>
  );
}
export default TodoApp;
```

逐块看。**数据**：`todos` 是数组，每条待办是对象——`id`、`text`（内容）、`done`（做完没有）。这个 state 只归 TodoApp 用，住在它自己内部。

**添加**：先掐头去尾，空字符串直接返回，免得加空白待办。新 id 用 `Date.now()`（当前时间的毫秒数，足够不重复）。关键行 `setTodos([...todos, newTodo])`：`...todos` 叫展开写法，把旧数组每一项倒出来，连同新待办装进一个**新数组**——记住这件事，翻车现场会讲为什么。

**勾选**：`toggleTodo` 用 `map` 逐条过一遍，id 对上的返回一个改过 `done` 的**新对象**（`{ ...todo, done: !todo.done }` 是“旧属性全抄过来，再把 done 换成相反值”），对不上原样返回。**删除**：`filter` 留下 id 不等于目标的，正好排除要删的那条。

**画页面**：和照片墙同理，`todos.map` 把数据翻译成列表项；勾选框 `checked={todo.done}`，勾不勾由数据说了算；删除线、底部统计都现算现显示。**整个页面就是数据的镜子——数据变，样子自动变。** 输入框的 `value` 与 `onChange` 下一节拆开讲，先照抄。

拼进 App（加 import、注释换成 `<TodoApp />`），刷新点一点，添加、勾选、删除都应立即生效。最后把状态归属列成表，迷路时回来对照：

| 数据 | 放在哪里 | 为什么 |
|---|---|---|
| 站名 title | App 用 props 传给 Header | 只读，全站共用 |
| 照片 photos | `data.js` 常量，不是 state | 它不变，不用触发渲染 |
| 待办 todos | TodoApp 的 state | 只有待办清单增删改它 |
| 输入框文字 inputText | TodoApp 的 state | 只有添加待办时用 |

## 14.4 表单与受控组件

回头盯着输入框看，它的核心就两行：`value={inputText}` 规定框里显示什么，`onChange` 在你每敲一个字时把最新内容同步回 state。这种被 state “牵着线”的输入框，正式名字叫**受控组件**。其中 `e` 是事件对象（第 10 章见过），`e.target` 就是输入框本身，`e.target.value` 是它此刻装着的文字。整个过程连起来：敲一个字 → onChange 触发 → setInputText 更新 state → React 重画 → 输入框显示新值，一圈转下来快得你感觉不到。

和第 10 章原生 JavaScript 对比，差别很清楚：**原生做法是“平时不管，用的时候再去掏”**——点添加那一刻才用 `.value` 取值，想实时统计字数、想提交后清空，都得再写代码操作 DOM。受控组件里文字始终躺在 state 中：添加成功后一句 `setInputText("")` 立马清空（14.3 就是这么写的）；把这一小段加到输入框下面，边打字边看字数涨：

```jsx
<p>你正在输入：{inputText}（共 {inputText.length} 个字）</p>
```

勾选框其实也是受控的：`checked={todo.done}` 相当于它的 `value`，`onChange` 负责写回，同一套路换个控件而已。

这一节最值得记的报错是：**只写 `value` 不写 `onChange`，输入框会变成只读的，一个字都打不进去**，控制台还会警告 “You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field.”。道理很简单：显示内容焊死在 state 上，却不给更新 state 的通道，它当然只能只读。记口诀——**value 和 onChange 成对出现**。

## 14.5 贯穿作品：个人主页 React 化完成

四块积木齐了，看一眼组装完成的 `App.jsx` 全貌：

```jsx
import Header from "./components/Header";
import Profile from "./components/Profile";
import PhotoWall from "./components/PhotoWall";
import TodoApp from "./components/TodoApp";

function App() {
  return (
    <div>
      <Header title="小北的空间" />
      <main>
        <Profile />
        <PhotoWall />
        <TodoApp />
      </main>
      <footer>
        <p>© 2026 小北的空间 · 用 React 搭的</p>
      </footer>
    </div>
  );
}
export default App;
```

页脚就一句话，直接写在 App 里，不值得单独拆文件——拆分也要讲性价比。现在 `src` 里有 `App.jsx`（组装）、`data.js`（不变的数据）和 `components` 里的四个组件。对照第 4 章纯 HTML 版，功能一个没少，内部却完全不同：换照片只动 `data.js`，给待办加功能只动 `TodoApp.jsx`，其他部分不会误伤。这就是这一章挣到的东西。

收工前自查：页面四块内容都显示；照片都加载出来（某张裂了就查 `data.js` 里那条的 `src`）；添加、勾选、删除立即生效；输入框打字顺畅、添加后自动清空；F12 打开控制台，没有 key 警告、没有红色报错。样式若和原来不太一样，多半是第 7 章的 CSS 没搬全，放进 `src/index.css` 即可，下一章换 Tailwind 时统一处理。最后用第 12 章的本事存档：`git add .` 后提交一句“第 14 章：个人主页 React 化”。

## 本章要点

- 拆分原则：相对独立、能说清职责的区域就是一个组件；一个组件一个文件，放进 `components` 文件夹。
- 列表渲染靠 `map`：先有数据数组，再把每条数据翻译成一段 JSX，数据有多少，页面就有多长。
- `key` 是 React 认人的标记，必须唯一且稳定：用数据的 id，不用数组下标。
- 数据归谁管，跟着“谁用它”走：待办的 state 住在 TodoApp 里；不变的数据放常量文件，不占用 state。
- 改 state 永远造新数组、新对象：添加用展开，勾选用 map，删除用 filter。
- 受控组件：`value` 和 `onChange` 成对出现，文字始终存在 state 里，清空、统计都方便。

## 动手 Kata

1. **给照片墙加菜**：在 `data.js` 里给 `photos` 再加两条数据（换成自己的图片链接和说明），其他不改。做完应该看到：刷新后照片墙自动变长，没有 key 警告。
2. **再加一行统计**：仿照“还剩 X 件”，在清单下方加一行“已完成 Y 件”，用 `filter` 数 `done` 为 true 的条数。做完应该看到：每勾掉一条，两行数字此消彼长。
3. **把学习笔记拆成组件**：在 `data.js` 里新建 `notes` 数组（每条含 id、text，先写三条标题），新建 `components/NoteList.jsx` 用 `map` 渲染，拼进 App 放在照片墙下面。做完应该看到：主页多出一块“学习笔记”，加笔记只改数据文件。
4. **联系表单受控化**：新建 `components/ContactForm.jsx`，姓名、留言两个输入框各配一个 state，都写成受控组件；点“发送”后在下方显示“收到 {姓名} 的留言：{留言内容}”（先不真发送）。做完应该看到：发送后这行字出现，再改输入框它不会跟着变。
5. **挑战：一键清除已完成**：给 TodoApp 加一个“清除已完成”按钮，一次删掉所有 `done` 为 true 的待办（想想用哪个数组方法）。做完应该看到：勾掉几条再点按钮，清单里只剩下没做完的。

## 翻车现场

积木拼好了，小北觉得 `toggleTodo` 里那串 `map` 写得太绕，自己“优化”成这样：

```jsx
function toggleTodo(id) {
  const newTodos = todos; // 先把数组拿过来
  newTodos.forEach((todo) => {
    if (todo.id === id) todo.done = !todo.done; // 直接改掉 done
  });
  setTodos(newTodos); // 再把改好的数组交回去
}
```

保存刷新，点勾选框——毫无反应。不打勾、没删除线，控制台还干干净净。他盯着代码看了二十分钟：逻辑明明对的，`done` 确实被改了呀。

问题出在第一行：`const newTodos = todos` 没有复制出新数组，只是给**同一个数组**起了个新名字，好比同一个人多了一个外号，改来改去都是原来那个数组。等他把“新数组”交回 `setTodos`，React 和旧 state 一比：“还是原来那个，没变化”，直接跳过重新渲染。数据真变了，页面却不跟上——这种 bug 不报错、最折磨人。

改法就是 14.3 的正经写法：用 `map` 生成新数组，对上的那条也换成新对象，把**新东西**交给 `setTodos`，React 一看引用变了，立刻重画。记住这条铁律：**在 React 里改 state，不许动原来的，必须递上一个新的；你递回旧的，它就当你什么都没做。**

<!-- playground: ch14 -->
