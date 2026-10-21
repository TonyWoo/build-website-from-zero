---
title: "第 19 章 后端入门：让网站记住每一位访客"
---

**贯穿作品 · 小北的网站**

第 18 章结束时，「小北的空间」已经上线，小北把网址发到了宿舍群。结果室友点开留言板问："怎么一条留言都没有？你不是说留了好几条吗？"

小北这才意识到：第 17 章做的留言板是"假"的。留言存在浏览器的 localStorage 里，那是每台电脑、每个浏览器各存一份的"小本子"——他留的言只在他自己的浏览器里，室友看到的是空板子；换台电脑打开，留言也跟着"消失"。

这一章，我们给留言板接上**真后端**：用 Node.js 写后端程序，用 PostgreSQL 数据库存数据。学完这一章，访客能注册、登录、发表留言，所有人看到的是同一份留言，数据再也不跟着某一台设备走。最后顺带认识另一个同类数据库 MySQL。先说清一句：这一章的后端跑在你自己的电脑上，对外服务的办法在 19.1 末尾点到为止。

## 19.1 为什么需要后端：前端管不到的三件事

前十八章写的 HTML、CSS、JavaScript 都在**访客的浏览器里**运行，这部分叫**前端**。前端能排版、能交互、能把数据存进 localStorage，但有三件事它从原理上做不到，必须请出另一半：**后端**——跑在服务器上（这一章就是你自己的电脑）的程序，负责存数据、验身份、守规矩。

**数据要共享**。留言板的意义就是"所有人看到同一份"，可 localStorage 每台设备一份，天然对不上；数据必须存到一个公共的地方，谁来都问它要。**秘密不能放前端**。登录判断若写在前端，任何人按 F12 就能看光、改光、绕过登录；密码只能在后端验，验完只告诉前端"过"或"不过"。**换台设备，数据还在**。数据存在后端那边，在教室、宿舍、手机上登录，看到的都是同一份——正是你平时用任何 App 的体验。

后端和前端打交道的方式叫**接口**（也常说 API）：后端开出一扇扇小窗口，前端按约好的格式送请求、取结果。第 11 章你用 fetch 向天气服务器要数据，那就是敲别人家的窗口；这一章，我们自己开窗口。

至于部署：第 18 章能把静态页面发上 GitHub Pages，是因为它们只是一堆文件。**后端是一个要一直运行的程序**，需要一台一直开着的服务器让它住，没法随手一发。真实项目会租一台云服务器，原理和本机运行完全一样；这一章先在本机跑通，不展开部署。

## 19.2 认识数据库：PostgreSQL 上手

后端存数据靠**数据库**：专门存数据、查数据的软件。先这样理解：一套数据库软件像一个 Excel 工作簿，里面放很多张**表**（像工作表）；每张表有若干**列**（字段，如"用户名""留言内容"）和很多**行**（每行是一条记录，如一位用户、一条留言）。区别是：数据库能让成百上千人同时读写，还能在一百万行里瞬间找到你要的那几行。

这一章用 **PostgreSQL**（常简称 Postgres）：免费、开源、老牌的关系型数据库——"关系型"就是这种用表、行、列组织数据的方式，很多公司在用它。

**安装**。打开官网 postgresql.org 的下载页：Windows 下载安装包，一路下一步，中间给管理员账号 `postgres` 设一个密码，**务必记住**；装完自带图形工具 pgAdmin 和命令行工具 psql。Mac 可用官网安装包，或装 Postgres.app（拖进"应用程序"，打开一次就启动），后者更省事。细节随版本会变，以官网说明为准。它在后台运行，占**端口** 5432——端口就是程序在电脑上的"门牌号"，第 13 章 Vite 用过 5173。

**建库建表**。打开终端（Windows 若提示找不到 psql，从开始菜单打开自带的"SQL Shell (psql)"，效果一样），登录：

```bash
psql -U postgres
```

输密码时屏幕不显示，是正常现象。看到提示符变成 `postgres=#` 就进来了。依次执行（这种和数据库对话的语言叫 **SQL**，每句以分号结尾）：

```sql
CREATE DATABASE xiaobei;
\c xiaobei
CREATE TABLE users (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE messages (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

逐句看：`CREATE DATABASE xiaobei;` 建一个叫 xiaobei 的库；`\c xiaobei` 是 psql 自己的命令，意为"切换到 xiaobei 库"，它没有分号、也不是 SQL。两个 `CREATE TABLE` 各建一张表：`id` 是每条记录的编号，`GENERATED ALWAYS AS IDENTITY` 表示自动递增，`PRIMARY KEY` 表示它是**主键**——每行独一无二的身份证号；`TEXT` 是长文本；`UNIQUE` 表示不能重复（用户名撞车会被拦下）；`NOT NULL` 表示不许留空；`DEFAULT now()` 表示不填就自动填当前时间。messages 表的 `user_id ... REFERENCES users(id)` 叫**外键**：指着 users 表的 id，表示"这条留言是谁留的"，两张表就这样关联起来。

**试一次存和查**。存用 `INSERT`，查用 `SELECT`：

```sql
INSERT INTO users (username, password_hash) VALUES ('xiaobei', 'placeholder');
SELECT * FROM users;
```

能看到一行数据（id 是 1，username 是 xiaobei），就说明数据库能存能查了，输 `\q` 退出。这条占位用户只是试手，19.4 会通过注册接口正经建用户。常见报错先打预防针：报 `password authentication failed` 是密码记错了；报连接失败，先确认 PostgreSQL 在运行（Windows 在"服务"里能看到它，Mac 打开 Postgres.app 就是启动）。

## 19.3 第一个后端：用 Node.js + Express 写接口

后端用你已经很熟的 JavaScript 写——运行它的不是浏览器，而是第 2 章装好的 **Node.js**（先在终端跑 `node -v` 确认它还在）。在 `my-website` 里新建 `server` 文件夹，终端进去初始化并装包：

```bash
cd my-website/server
npm init -y
npm install express pg
```

`npm init -y` 把文件夹变成 Node.js 项目（生成 package.json，第 13 章见过它的亲戚）。两个包：**express** 是写后端最常用的框架——"框架"就是别人写好的半成品，把"接收请求、返回数据"的套路活都备好了；**pg** 是 Node.js 连 PostgreSQL 的**驱动**，即让程序和某个软件对话的翻译官。

在 server 文件夹里新建 `server.js`，写第一版后端：

```javascript
const express = require("express");
const { Pool } = require("pg");

const app = express();
const pool = new Pool({
  user: "postgres",
  password: "安装 PostgreSQL 时设的密码",
  database: "xiaobei",
  port: 5432,
});

app.use(express.json());

app.get("/api/messages", async (req, res) => {
  const result = await pool.query(
    "SELECT messages.id, users.username, messages.content " +
    "FROM messages JOIN users ON users.id = messages.user_id " +
    "ORDER BY messages.id DESC"
  );
  res.json(result.rows);
});

app.listen(3000, () => {
  console.log("后端已启动：http://localhost:3000");
});
```

逐块讲。`require` 是 Node.js 引入包的写法（相当于 React 里的 import）。`new Pool({...})` 建了和数据库的"连接池"，理解成一条常驻电话线，查数据库都走它，括号里填 19.2 的信息。`app.use(express.json())` 告诉 express 把前端发来的 JSON 拆好（第 11 章说过，JSON 是数据的通用语言），19.4 才用得上，先备着。`app.get("/api/messages", ...)` 就是开窗口：有人用 GET 方式访问这个地址，就执行后面的函数。函数里 `pool.query(...)` 向数据库发 SQL，用 `JOIN` 把 users 表连进来——留言表只存了 user_id，连上用户表才知道显示哪个名字；`ORDER BY messages.id DESC` 让新留言排最前面。查到的行在 `result.rows` 里，`res.json(...)` 把它变成 JSON 发回去。`app.listen(3000)` 让后端在 3000 端口开门营业。

在 server 文件夹的终端运行，再用浏览器验证：

```bash
node server.js
```

看到"后端已启动"后打开 `http://localhost:3000/api/messages`，页面显示一对空方括号 `[]` 就是成功：接口通了，只是还没有留言（19.2 试插的是用户，不是留言）。这相当于后端的"Hello World"。终端要一直开着，想停后端按 Ctrl + C。

一句话总结分工：**前端管长相和交互，后端管数据和规矩**。常见报错：`Cannot find module 'express'` 是没在 server 文件夹里装包；数据库连接失败多半是密码填错或 PostgreSQL 没在运行。还有一句安全提醒：server.js 里写了数据库密码，那只是本机练习密码；第 12 章推 GitHub 时，别把自己在别处也用的真实密码写进代码提交上去。

## 19.4 注册与登录：密码不能明文存

users 表的字段叫 `password_hash` 而不叫 password，因为**密码永远不能按原文存**：哪天数据库泄露，明文密码一览无余，而很多人所有网站共用一个密码，一处泄露、处处遭殃。数据库里只存密码的"指纹"：**哈希**——把密码丢进一台单向搅拌机，出来一串固定长度的乱码；同样的密码永远搅出同样的乱码，但拿着乱码推不回原密码。登录时把这次输入的密码再搅一次，乱码对得上就说明密码对。

还有一个词叫**盐**：两个人密码相同，乱码也相同，而且网上流传着"常见密码 → 哈希值"的对照表（彩虹表）能直接反查。所以注册时给每个用户随机生成一串字符作盐，掺进密码一起搅，再把盐和哈希一起存（盐不用保密）。

这套活不用装包，Node.js 内置 `crypto` 模块的 `scrypt` 就是专门为存密码设计的搅拌算法。在 server.js 里加两个函数：

```javascript
const crypto = require("crypto");
const { promisify } = require("util");
const scrypt = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, 64);
  return salt + ":" + hash.toString("hex");
}

async function verifyPassword(password, stored) {
  const [salt, key] = stored.split(":");
  const hash = await scrypt(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(key, "hex"), hash);
}
```

`hashPassword` 注册时用：生成随机盐、加盐搅拌、拼成"盐:哈希"存起来——盐必须留着，不然登录时没盐可用。`verifyPassword` 登录时用：拆开存着的那串，取出盐，同样搅一遍新密码再比对；`timingSafeEqual` 是专门比对秘密的函数，比普通的 `===` 更稳妥，先照着用。（`promisify` 把老式函数包成能用 `await` 的版本，第 11 章的异步套路又见面了。）

接着写**注册接口**。这次是 `app.post`：GET 是取数据，POST 是提交数据，注册、登录、发留言都是 POST：

```javascript
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "用户名和密码都要填" });
  }
  const passwordHash = await hashPassword(password);
  try {
    await pool.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2)",
      [username, passwordHash]
    );
    res.json({ ok: true });
  } catch {
    res.status(400).json({ error: "这个用户名已被占用" });
  }
});
```

`req.body` 就是前端发来的 JSON（靠 `express.json()` 拆好的）。重点看 SQL 里的 `$1`、`$2`：它们是**占位符**，真正的值放在后面的数组里由 pg 分开送给数据库——这叫**参数化查询**，本章所有 SQL 都这么写，为什么必须这样，19.5 和翻车现场会让你印象深刻。`try/catch` 接住用户名重复（UNIQUE 会让重复插入报错）。`res.status(400)` 把状态码设成 400——状态码是服务器回话时带的数字暗号，你见过 404（找不到页面），400 表示"你这次请求本身有毛病"。

**登录接口**多一步发"通行证"。这张通行证在行话里叫**会话**（session）：后端随机生成一串 token 记在自己手里，再交给浏览器保管；浏览器之后每次来访都出示它，后端一查便知"你是已登录的小北"——像游乐园系在手腕上的纸环，每个项目抬手看一下，不用次次查身份证。通行证通过 **Cookie** 发出：Cookie 是浏览器替网站保管的一小块数据，发请求时自动带上，不用前端代码操心；`httpOnly` 表示它只许在发请求时出示，页面里的 JavaScript 读不到，坏脚本也偷不走：

```javascript
const sessions = new Map();

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
  const user = result.rows[0];
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return res.status(401).json({ error: "用户名或密码不对" });
  }
  const token = crypto.randomUUID();
  sessions.set(token, user.id);
  res.cookie("session", token, { httpOnly: true });
  res.json({ ok: true, username: user.username });
});
```

查不到用户或密码没比对过，统一回"用户名或密码不对"（不说破错在哪个，免得有人拿它试探哪些用户名存在，这是安全惯例），状态码 401 表示"还没通过身份验证"。验过了就生成 token 存进 Map（第 9 章对象的近亲，专门存"键 → 值"对照表），用 `res.cookie` 发出去。

最后补**查登录状态的接口**和从 Cookie 里认人的小函数。Express 默认不拆 Cookie，我们手动从请求头里找名为 session 的那一项（真实项目通常装现成的会话工具包，原理一模一样，只是替你写了这几行）：

```javascript
function currentUserId(req) {
  const cookieHeader = req.headers.cookie || "";
  let token = null;
  for (const part of cookieHeader.split("; ")) {
    if (part.startsWith("session=")) {
      token = part.slice("session=".length);
    }
  }
  if (!token) return null;
  return sessions.get(token) || null;
}

app.get("/api/me", async (req, res) => {
  const userId = currentUserId(req);
  if (!userId) return res.json({ user: null });
  const result = await pool.query("SELECT id, username FROM users WHERE id = $1", [userId]);
  res.json({ user: result.rows[0] });
});
```

前端每次打开页面先问一句 `/api/me`，就知道该显示"登录/注册"还是"你好，某某"。如实交代一句：通行证记录存在内存（Map）里，**后端一重启，所有人都要重新登录**；真实项目会把会话存进数据库或专门的存储、还会设过期时间，但原理完全相同，本书先用最容易看懂的办法。

## 19.5 贯穿作品：留言板变成真的

只差**发表留言的接口**和**前端对接**。发表接口写进 server.js，它开口第一件事先认人——没登录，连门都不给进：

```javascript
app.post("/api/messages", async (req, res) => {
  const userId = currentUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "先登录才能留言" });
  }
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: "留言不能为空" });
  }
  await pool.query(
    "INSERT INTO messages (user_id, content) VALUES ($1, $2)",
    [userId, content]
  );
  res.json({ ok: true });
});
```

两个细节。第一，留言是谁发的，用通行证查出的 `userId`，**而不是前端传过来的用户名**——前端传什么都不可信，身份只能认通行证。第二，还是参数化查询：`content` 里写什么都行，哪怕一串引号和 SQL 关键词，pg 也只会当普通文字存起来。这正是防 **SQL 注入** 的关键：参数化之后，用户输入永远是"数据"，变不成"命令"。翻车现场里小北就是在这上面栽的。

对接前先解决一个小障碍：guestbook.html 直接双击打开（地址是 file:// 开头）时，浏览器对 Cookie 的态度很别扭，通行证可能带不上。最省事的办法是让后端顺手把网站文件也发出去——在 server.js 靠前的位置加两行，再重启后端：

```javascript
const path = require("path");
app.use(express.static(path.join(__dirname, "..")));
```

`__dirname` 是 Node.js 给每个文件的"当前文件夹"变量，`..` 是上一级，正好是 `my-website`。之后打开 `http://localhost:3000/guestbook.html` 就是留言板，和接口同在一个"门牌号"下，Cookie 一路畅通。第 18 章上线的静态版还是老样子，真留言板先在自己电脑上跑。

改 guestbook.html：第 17 章的昵称输入框可以删掉了，留言自动署登录的用户名；页面顶部加一块登录区：

```html
<div id="auth-area">
  <input id="username" placeholder="用户名">
  <input id="password" type="password" placeholder="密码">
  <button id="register-btn">注册</button>
  <button id="login-btn">登录</button>
  <span id="auth-msg"></span>
</div>
<p id="who"></p>
```

再把页面里的 JavaScript 换成下面这套（沿用第 11 章 fetch 的骨架：发请求、拆 JSON、再更新页面；`$` 是给 `document.querySelector` 起的小名，少打很多字）。先给第 17 章的留言区、留言输入框和提交按钮各补一个 id：留言区 `id="messages"`、输入框 `id="content"`、按钮 `id="send-btn"`（你文件里如果已经是别的名字，把下面代码里的对应名字换成你的就行）：

```javascript
const API = "http://localhost:3000";
const $ = (s) => document.querySelector(s);

async function refreshMe() {
  const data = await (await fetch(API + "/api/me")).json();
  $("#who").textContent = data.user
    ? "已登录：" + data.user.username
    : "还没登录，登录之后才能留言";
}

async function auth(path) {
  const res = await fetch(API + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: $("#username").value, password: $("#password").value }),
  });
  const data = await res.json();
  $("#auth-msg").textContent = res.ok ? "成功" : data.error;
  if (res.ok) refreshMe();
}
$("#register-btn").addEventListener("click", () => auth("/api/register"));
$("#login-btn").addEventListener("click", () => auth("/api/login"));

async function loadMessages() {
  const list = await (await fetch(API + "/api/messages")).json();
  const box = $("#messages");
  box.innerHTML = "";
  for (const m of list) {
    const div = document.createElement("div");
    div.textContent = m.username + "：" + m.content;
    box.appendChild(div);
  }
}

$("#send-btn").addEventListener("click", async () => {
  const res = await fetch(API + "/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: $("#content").value }),
  });
  if (res.ok) {
    $("#content").value = "";
    loadMessages();
  } else {
    alert("发表失败：" + (await res.json()).error);
  }
});

refreshMe();
loadMessages();
```

对照第 17 章看变化：`loadMessages` 不再读 localStorage，而是向后端要一份全站统一的列表，用第 10 章的 `createElement` 一条条摆出来（用 `textContent` 填文字，留言里就算有人写了尖括号也只会被当普通文字，顺手防了另一类攻击）。注册和登录共用 `auth` 函数，只是敲的窗口不同；通行证由浏览器自动保管、自动出示，代码里不用管它。后端回 401 时页面弹出提示——规矩在后端，前端只是转达。

全部改完，**重启后端**（在跑着 `node server.js` 的终端按 Ctrl + C 再重新运行），打开 `http://localhost:3000/guestbook.html` 走一遍：注册 → 页面显示"已登录：你的名字"→ 发一条留言 → 刷新，留言还在。再做个见证奇迹的实验：换一个浏览器（或开无痕窗口）打开同一个地址，留言板上躺着刚才那条留言——**数据第一次真正属于"网站"，而不是某一台设备**。第 17 章那个假留言板，正式转正了。

卡住时按顺序排查：后端终端还开着没（关了就全断）；地址是不是 localhost:3000 开头（file:// 页面带不上通行证）；再看后端终端打印的报错，密码错、SQL 写错都会写在那里。

## 19.6 也认识一下 MySQL

以后看招聘要求、公司老项目、别人的教程，你一定会撞见另一个名字：**MySQL**。它和 PostgreSQL 是同类——都是关系型数据库，都用表、行、列存数据，都说 SQL。MySQL 起步更早、名气极大，大批老牌网站和公司系统在用它（用 WordPress 搭的网站，背后默认就是它），同样免费开源。

**相同点**：模型相同（库、表、行、列、主键、外键同一套概念），SQL 主体相同（`SELECT`、`INSERT INTO` 等核心句式两边通用），在网站里的位置也相同。学会 PostgreSQL，MySQL 已经会了大半。**不同点主要是"方言"**：

| 对比项 | PostgreSQL | MySQL |
| --- | --- | --- |
| 默认端口 | 5432 | 3306 |
| 参数占位符 | `$1`、`$2` | `?` |
| 自增主键 | `GENERATED ALWAYS AS IDENTITY` | `AUTO_INCREMENT` |
| Node.js 驱动包 | `pg` | `mysql2` |

users 表用 MySQL 方言写出来，和 19.2 逐行对照，差异一目了然：

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

三处不同：整数写 `INT`，自增写 `AUTO_INCREMENT`，字符串类型 `VARCHAR` 要给长度上限（50、255 这种），PostgreSQL 的 `TEXT` 不用。Node.js 这边换 MySQL 也只动几行：

```javascript
const mysql = require("mysql2/promise");
const pool = mysql.createPool({
  user: "root",
  password: "安装 MySQL 时设的密码",
  database: "xiaobei",
  port: 3306,
});
const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
```

占位符从 `$1` 变成 `?`，查到的行从 `result.rows` 变成拆出来的 `[rows]`，除此之外，接口写法、参数化查询的规矩、哈希和会话的思路**全都不变**。这一节不要求你真去装 MySQL，看懂差异、知道它是谁即可。

选型建议一句话：**自己做新项目，跟着本书用 PostgreSQL 就好；去公司发现项目用 MySQL，也完全不用慌**——同一套模型换个方言，查一下文档就能上手。

## 本章要点

- 前端做不到三件事：让所有人共享同一份数据、把密码这样的秘密藏起来、让数据跟着账号而不是设备走——都要靠后端。
- 后端通过接口（API）和前端打交道：前端用 fetch 敲窗口，后端查数据库、守规矩，再把结果用 JSON 送出来。
- 数据库用表、行、列存数据：行是一条记录，列是一个字段；主键是每行的身份证号，外键负责把表关联起来。
- 密码永远不能明文存：只存"盐 + 哈希"；登录时把新密码按同样的盐再算一遍，用 `timingSafeEqual` 比对。
- 登录成功后，后端发一张通行证（随机 token），用 httpOnly Cookie 交给浏览器保管，请求时自动出示、后端查表认人；存内存的版本一重启就要重新登录。
- SQL 一律参数化查询：占位符加参数数组，用户输入永远只是数据，变不成命令——这是防 SQL 注入的根本办法。
- MySQL 和 PostgreSQL 是同类：模型和 SQL 主体相通，差异只是端口、占位符、自增写法、驱动包这些方言。

## 动手 Kata

1. **用 SQL 亲手加一条留言**。先在留言板页面注册一个用户，再回 psql 给 messages 表 INSERT 一条留言（user_id 填那个用户的 id），然后打开 `http://localhost:3000/api/messages`。做完应该看到：返回的 JSON 数组里躺着你刚加的留言，username 显示正确。
2. **确认密码存的是指纹**。注册一个新账号，密码用 `abc12345`，再在 psql 里执行 `SELECT * FROM users;`。做完应该看到：password_hash 是一长串"十六进制：十六进制"，全表找不到 `abc12345`；用这个密码在页面上又能顺利登录。
3. **补一个退出接口**。照着 `/api/me` 加一个 `POST /api/logout`，把当前用户的 token 从 sessions 里删掉（可能需要让认人函数把 token 也一并返回），前端再加一个"退出"按钮调用它。做完应该看到：退出后页面变回"还没登录"，发留言被 401 拦下；重新登录恢复正常。
4. **留言只看最近 10 条**。给查询留言的 SQL 末尾加上 `LIMIT 10`（放在 ORDER BY 后面），重启后端，连发十几条留言验证。做完应该看到：数据库里一条没少，但接口只返回最新的 10 条。
5. **换个浏览器当访客**。用无痕窗口打开留言板，不登录先试发留言，再注册新账号发一条。做完应该看到：没登录被拦下并提示先登录；新账号的留言和旧账号的并排在同一块板子上，署名不同。

## 翻车现场

小北写完 19.4 的登录，手有点痒：他嫌参数化查询"写起来啰嗦"，私下试了一版"简洁写法"——把用户名直接拼进 SQL 字符串，而且图快，查到用户就当登录成功，密码比对想着"明天再补"：

```javascript
const sql = "SELECT * FROM users WHERE username = '" + username + "'";
const result = await pool.query(sql);
const user = result.rows[0];
// 查到人就算登录成功（密码比对明天再补）
```

他拿这版给室友显摆。室友没输自己的名字，而是在用户名框敲进一串怪东西：`' OR '1'='1`。后端拼出来的 SQL 变成了：

```sql
SELECT * FROM users WHERE username = '' OR '1'='1'
```

逐段读这句被动了手脚的查询：前半句 `username = ''` 是假的，可后半句 `'1'='1'` **永远是真的**，中间用 OR 一连，整句条件永远成立——数据库把 users 表所有的行统统交了出来。代码拿了第一行 `rows[0]`，好巧不巧，全站第一个注册的用户正是小北本人。通行证就这样发到了室友手里，他顶着小北的身份进了留言板，小北看得目瞪口呆。

这一招叫 **SQL 注入**：把"数据"伪装成"命令"，骗数据库执行攻击者想要的查询。可怕在：只要有一个接口是拼接的，攻击者就可能绕过登录、拖走整张表、甚至删库。破解方法你已经用了整整一章：**参数化查询**。用 `$1` 占位、输入放进参数数组，pg 会明确标注"这是个数据"，数据库拿它只做匹配——拿 `' OR '1'='1` 去比对用户名，只会得到"查无此人"，引号和 OR 永远没机会变成命令。

教训有两条。第一，**SQL 拼接省下的那点事，赌上的是整个数据库**，正文的写法一个字都别"优化"。第二，"明天再补"的校验等于没有校验——室友要是心再狠一点，那天丢的就不只是面子了。
