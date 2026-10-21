---
title: "第 11 章 JavaScript 进阶：和真实世界打交道"
---

**贯穿作品 · 小北的网站**

上一章的待办清单，小北用得挺顺手。直到有一天他写了满满一列计划，顺手按了下刷新——清单空了，一条不剩。原来数据只存在这一页的内存里，页面一刷新，就像黑板被擦掉一样。

这一章解决两件事：第一，让待办清单的数据**存进浏览器里**，刷新、关掉重开都不丢；第二，小北想在主页上加一个天气小应用，网页要去**向别的服务器要数据**。这是 JavaScript 从"自己玩"到"和真实世界打交道"的分水岭。

## 11.1 异步是怎么回事：代码也要排队等结果

前面写的代码都一行接一行、立刻出结果。但有些事快不了：向服务器要数据，要等网络跑一个来回，代码总不能傻等。

想象你点外卖：下单后你不会站在门口盯着，而是该干嘛干嘛，外卖到了骑手打电话通知你。程序里也一样：**把慢事派出去，先忙别的，办完了再通知你**。这就叫**异步**。

先做个小实验：新建 `async.html`（骨架还是老样子，代码放进 `<script>` 里），打开后按 F12 看控制台：

```javascript
console.log("1. 我先打印");
setTimeout(function () {
  console.log("2. 我等了 3 秒");
}, 3000);
console.log("3. 我不等它，我也打印");
```

`setTimeout` 是浏览器提供的"定时器"：把函数和毫秒数交给它，时间到了它再执行（1000 毫秒 = 1 秒）。运行顺序是 1、3、2：第三行没等那 3 秒，先跑了；3 秒后定时器才"回头叫"第二行里那个函数。**这种"先交出去、到时候被回头叫一声"的函数，叫回调函数。**

## 11.2 fetch：向服务器要数据

![图：fetch 取数据的四步流程](../images/fig-ch11-fetch.svg)

网页向服务器要数据，用的工具叫 `fetch`（英文意思是"去取"）。因为要等网络，它天生是异步的。写法有几种，本书统一用最好懂的 `async / await`。先看最小例子，加到 `async.html` 里运行：

```javascript
async function loadWeather() {
  const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=39.90&longitude=116.40&current=temperature_2m");
  const data = await response.json();
  console.log(data);
}
loadWeather();
```

逐块拆开看：

- 函数前面加了 `async`，是声明"这个函数里有要等的事"。
- `await` 的意思是"**在这里等一下，等结果回来再往下走**"。`fetch(网址)` 把请求派出去，返回的 `response` 是服务器的回应。
- 回应里的数据还没拆封，`response.json()` 把它拆成 JavaScript 能用的对象，这一步也要等。
- 最后一行 `loadWeather();` 是把函数喊起来运行——只定义不调用，什么都不会发生。

控制台会打印出一大坨数据，里面就有北京当前的温度。**记住这个骨架：`await fetch(网址)` 拿回应，`await response.json()` 拆数据。**

提醒：网不通或网址写错时 `fetch` 会报错、页面没反应，先打开控制台看红字。

## 11.3 JSON：数据的通用语言

拆出来的数据长这样（节选）：

```javascript
{
  "current": {
    "temperature_2m": 18.5,
    "weather_code": 0
  }
}
```

这种写法叫 **JSON**，是全世界服务器之间传数据的通用格式，可以理解成"长得像 JavaScript 对象的文本"，只有三处小区别：

1. 属性名必须用**双引号**包起来（JS 里可不加）。
2. 字符串必须用双引号，不能用单引号。
3. 最后一项后面**不能加逗号**，多一个就报错。

为什么要专门认识它？因为数据来回都是以 JSON 文本跑的：服务器打包成 JSON 发过来，`response.json()` 还原成对象，我们才能用 `data.current.temperature_2m` 点出来用；下一节存数据时也要先打包成 JSON。**JSON 就是数据进出大门时用的行李箱。**

## 11.4 localStorage：把数据存在浏览器里

解决"刷新就丢"的办法，是浏览器自带的小仓库 `localStorage`：按网站存数据，关掉页面和浏览器都还在（只存本机，换浏览器或电脑就没有了）。

用法只有两招：

```javascript
// 存进去（key 是给数据起的名字）
localStorage.setItem("myName", "小北");

// 取回来
const name = localStorage.getItem("myName");
console.log(name); // 小北
```

但有一条铁规矩：**localStorage 里只能存字符串**。待办清单是数组，直接存会出大问题。正确做法是借上一节的行李箱：

```javascript
const todos = ["背单词", "去拍照片"];

// 存之前先打包成 JSON 文本
localStorage.setItem("todos", JSON.stringify(todos));

// 取回来是文本，用 JSON.parse 拆包还原成数组
const saved = JSON.parse(localStorage.getItem("todos"));
console.log(saved); // ["背单词", "去拍照片"]
```

小坑一个：没存过时 `getItem` 返回 `null`，没法当数组用，要在后面兜底写 `|| []`——取不到就当空数组。

## 11.5 贯穿作品：天气小应用与不会丢的待办清单

先做天气小应用：新建 `weather.html`，把下面代码**完整**抄进去，用浏览器打开（需要联网）：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>今日天气</title>
</head>
<body>
  <h1>北京 · 今日天气</h1>
  <p id="weather">正在查询，请稍等……</p>

  <script>
    // 天气代码（数字）翻成人话
    function describeWeather(code) {
      const map = {
        0: "晴", 1: "多云", 2: "多云", 3: "阴", 45: "有雾", 48: "有雾",
        51: "毛毛雨", 53: "毛毛雨", 55: "毛毛雨", 61: "小雨", 63: "中雨",
        65: "大雨", 71: "小雪", 73: "中雪", 75: "大雪", 95: "雷阵雨"
      };
      return map[code] || "说不清的天气";
    }

    async function loadWeather() {
      const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=39.90&longitude=116.40&current=temperature_2m,weather_code");
      const data = await response.json();
      const now = data.current;
      const el = document.getElementById("weather");
      el.textContent = "现在气温 " + now.temperature_2m + "℃，天气：" + describeWeather(now.weather_code);
    }

    loadWeather();
  </script>
</body>
</html>
```

用的接口是 Open-Meteo，免费公开、**不用注册、不用 key**。`latitude`、`longitude` 是北京的经纬度；换你的城市，搜"城市名 经纬度"替换即可，再改标题。页面先显示"正在查询"，数据回来后换成真实天气。**接口是别人的服务，以后可能调整或换地址**；真要不到数据，就搜"免费天气 API 无需 key"找替代品，能返回 JSON 就能套用同样的写法。

再改造待办清单：新建 `todo.html`，是第 10 章清单的"存档版"（事项改用对象，多存一个 `done` 表示做没做完），完整代码如下：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>我的待办清单</title>
</head>
<body>
  <h1>我的待办清单</h1>
  <input id="newTodo" placeholder="输入要做的事">
  <button id="addBtn">添加</button>
  <ul id="todoList"></ul>

  <script>
    const STORAGE_KEY = "my-todos";

    // 打开页面先读存档
    let todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    const listEl = document.getElementById("todoList");

    // 存档
    function save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }

    // 做按钮的小帮手
    function makeButton(text, onClick) {
      const btn = document.createElement("button");
      btn.textContent = text;
      btn.onclick = onClick;
      return btn;
    }

    // 把清单画到页面上
    function render() {
      listEl.innerHTML = "";
      todos.forEach(function (item, index) {
        const li = document.createElement("li");
        li.textContent = item.text + " ";
        if (item.done) li.style.textDecoration = "line-through";
        li.appendChild(makeButton(item.done ? "取消完成" : "完成", function () {
          item.done = !item.done;
          save();
          render();
        }));
        li.appendChild(makeButton("删掉", function () {
          todos.splice(index, 1);
          save();
          render();
        }));
        listEl.appendChild(li);
      });
    }

    document.getElementById("addBtn").onclick = function () {
      const input = document.getElementById("newTodo");
      const text = input.value.trim();
      if (!text) return;
      todos.push({ text: text, done: false });
      input.value = "";
      save();
      render();
    };

    render();
  </script>
</body>
</html>
```

和第 10 章相比，改造只有三个关键点：**打开页面先读存档**（`JSON.parse(...) || []`）、**每次增删改之后立刻 `save()`**、**页面永远照着 `todos` 数组来画**。试一试：加几条待办，刷新——还在；关掉浏览器再打开——还在。小北的黑板，终于擦不掉了。

下一章，给整个网站再上一份大保险——Git 版本管理。

## 本章要点

- 异步就是"慢事派出去、办完再通知"；先交出去、到时候被回头叫一声的函数，叫回调函数。
- `fetch` 分两步：`await fetch(网址)` 拿回应，`await response.json()` 拆数据，函数头上加 `async`。
- JSON 是服务器间传数据的通用格式：属性名和字符串都用双引号，最后一项后不加逗号。
- localStorage 是浏览器的小仓库：只能存字符串，关掉浏览器也不丢（只存本机）。
- 数组和对象存之前 `JSON.stringify` 打包，取回来 `JSON.parse` 拆包，记得 `|| []` 兜底。

## 动手 Kata

1. **给天气换城市**：把 `weather.html` 的经纬度换成你家乡的，标题也改掉。做完应该看到：页面显示你家乡当前的气温和天气。
2. **天气加一句穿衣建议**：给天气小应用加判断：低于 10℃ 显示"记得穿厚点"，10–25℃ 显示"温度正舒服"，高于 25℃ 显示"注意防晒"。做完应该看到：天气后面多了一句提醒。
3. **给待办清单加"一键清空"**：在 `todo.html` 里加一个"清空全部"按钮：点击后清空数组、更新存档、重画页面。做完应该看到：清单全空，刷新后依然是空的。
4. **控制台实验**：在控制台运行 `localStorage.setItem("myCity", "你的城市")`，刷新页面，再运行 `localStorage.getItem("myCity")` 看能不能取回。做完应该看到：刷新后依然取得到。

## 翻车现场

这一章小北连踩两个经典坑。

第一个坑在天气小应用。他一运行，页面上赫然显示着：**"现在气温 Promise {<pending>}℃"**。半天才发现漏写了 `await`。没有 `await`，`fetch` 返回的不是数据本身，而是一个"**Promise**"——一张写着"数据在路上，稍后送达"的取货凭条。记住：**只要看到 `Promise {<pending>}`，十有八九是哪个 `await` 漏了**。

第二个坑在待办清单。他想当然地写了 `localStorage.setItem("todos", todos)`，没打包直接存。刷新后一读，数组不见了，只剩一行怪字符串。铁规矩摆在那儿：localStorage 只收字符串，硬塞数组，它就把数组"压扁"成字符串，对象更会被压成没法用的 `[object Object]`。改法没有第二种：**存之前 `JSON.stringify` 打包，取之后 `JSON.parse` 拆包**，一个字都不能省。

两个坑是同一个教训：异步和存储都有规矩，"差不多"的写法差一个词就全盘不对。报错不可怕，它是在提醒你：有规矩没对上。
