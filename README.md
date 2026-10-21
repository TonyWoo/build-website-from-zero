# 《从零开始学习建网站》

**给零基础学生的 Web 编程入门——HTML、CSS、JavaScript、Git、React、Tailwind 与 AI 编程助手**

作者：Tony Wu ｜ 联系：tonywoo@outlook.com

这是一本写给零基础学生的 Web 编程入门书：不预设任何编程经验，不堆概念，
每章都动手做出看得见的东西。从认识网页、写下第一行 HTML 开始，经过 CSS 美化、
JavaScript 交互、Git 版本管理、React 与 Tailwind CSS，最后认识 DeepSeek、
DeepSeek Harness 与腾讯 WorkBuddy 这些 AI 编程助手，并把自己的网站发布上线。

贯穿全书的作品是 **小北的个人网站**：大一学生小北从一张纯 HTML 主页开始，
一路把它升级成 React 应用并部署到全世界都能打开的网址。你跟着做，
学完这本书，手里就有一个真正属于自己的网站。
（案例人物为虚构，代码与方法都是真实可用的。）

## 章节大纲（前言 + 18 章）

| 章 | 目录 | 主题 |
|---|---|---|
| 前言 | `content/zh/000-preface/` | 写在前面：零基础也能学会建网站 |
| 1 | `content/zh/010-meet-web/` | 认识 Web：网页是怎么跑起来的 |
| 2 | `content/zh/020-tools/` | 工欲善其事：装好你的工具箱 |
| 3 | `content/zh/030-html-basics/` | HTML 入门：写出你的第一个网页 |
| 4 | `content/zh/040-html-advanced/` | HTML 进阶：做一张完整的个人主页 |
| 5 | `content/zh/050-css-basics/` | CSS 入门：给网页化妆 |
| 6 | `content/zh/060-css-layout/` | CSS 布局：把页面排整齐 |
| 7 | `content/zh/070-css-advanced/` | CSS 进阶：好看又好用 |
| 8 | `content/zh/080-js-basics/` | JavaScript 入门：先在控制台玩起来 |
| 9 | `content/zh/090-js-logic/` | 逻辑与函数：把重复的事交给代码 |
| 10 | `content/zh/100-js-dom/` | DOM 与事件：让网页动起来 |
| 11 | `content/zh/110-js-advanced/` | JavaScript 进阶：和真实世界打交道 |
| 12 | `content/zh/120-git/` | Git 版本管理：给你的代码上一份保险 |
| 13 | `content/zh/130-react-thinking/` | React 入门：换个方式想页面 |
| 14 | `content/zh/140-react-practice/` | React 实战：重构小北的网站 |
| 15 | `content/zh/150-tailwind/` | Tailwind CSS：用类名写样式 |
| 16 | `content/zh/160-deepseek-companion/` | 认识 DeepSeek：用 AI 当陪练 |
| 17 | `content/zh/170-ai-agents/` | AI 编程代理实战：DeepSeek Harness 与 WorkBuddy |
| 18 | `content/zh/180-launch/` | 毕业作品：把你的网站发布到全世界 |

每章体例：白话讲解 + 可运行的代码示例 + 贯穿作品推进 + 本章要点 + 动手 Kata + 翻车现场。
全书写作规范与案例口径见 `WRITING.md`。

## 书站

本站用 Astro + Nimbus 构建，源码在 `site/`，push 到 main 后由 GitHub Actions
自动部署到 GitHub Pages：https://tonywoo.github.io/build-website-from-zero/

本地预览：

```bash
cd site
npm ci
npm run dev   # prebuild 会自动把 content/zh/ 书稿导入站点
```
