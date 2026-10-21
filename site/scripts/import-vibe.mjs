// ============================================================
// import-vibe.mjs —— 把 content/zh/ 的 全书书稿导入为 nimbus 站点页面
// 用法：site/ 目录下 node scripts/import-vibe.mjs
// 由 `prebuild` 自动调用，保证构建永远用最新书稿
// 输出 15 页：落地页 1 + 14 章（每章一页，含本章全部小节）
// ============================================================
import { readdirSync, readFileSync, writeFileSync, rmSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = join(ROOT, '..', 'content', 'zh');
const OUT_DIR = join(ROOT, 'src', 'content', 'docs');
const IMAGES_DIR = join(ROOT, '..', 'images');
const PUBLIC_IMAGES_DIR = join(ROOT, 'public', 'images');
const PLAYGROUNDS_DIR = join(ROOT, '..', 'playgrounds');
const PUBLIC_PLAYGROUNDS_DIR = join(ROOT, 'public', 'playgrounds');

// 正文图片：仓库根 images/ → site/public/images/（public 映射到站点根，
// 构建后位于 <base>/images/，与 fixImagePaths 改写的路径对应）
function copyImages() {
  if (!existsSync(IMAGES_DIR)) return;
  mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
  let n = 0;
  for (const f of readdirSync(IMAGES_DIR)) {
    if (/\.(svg|png|jpe?g|webp|gif)$/i.test(f)) {
      copyFileSync(join(IMAGES_DIR, f), join(PUBLIC_IMAGES_DIR, f));
      n++;
    }
  }
  console.log(`import-vibe: 拷贝图片 ${n} 张`);
}

// 在线试玩快照：仓库根 playgrounds/ → site/public/playgrounds/
// （试玩壳在 site/public/playground/，按 ../playgrounds/<snap>.html 取快照）
function copyPlaygrounds() {
  if (!existsSync(PLAYGROUNDS_DIR)) return;
  mkdirSync(PUBLIC_PLAYGROUNDS_DIR, { recursive: true });
  let n = 0;
  for (const f of readdirSync(PLAYGROUNDS_DIR)) {
    if (/\.html$/i.test(f)) {
      copyFileSync(join(PLAYGROUNDS_DIR, f), join(PUBLIC_PLAYGROUNDS_DIR, f));
      n++;
    }
  }
  console.log(`import-vibe: 拷贝试玩快照 ${n} 份`);
}

// 正文里的 <!-- playground: chXX --> 标记展开为试玩框（仅站点构建时展开；
// 书稿里只是一行 HTML 注释，导出 EPUB/PDF 时不可见、不会带进去）
const expandPlayground = (body) =>
  body.replace(
    /^<!--\s*playground:\s*([\w-]+)\s*-->$/gm,
    [
      '## 动手玩一玩：本章的页面',
      '',
      '这就是本章结束时小北的网站长成的样子。左边是代码，可以直接改；右边是实时预览，改完马上能看到效果。改坏了也不怕，点试玩框右上角的「⟲ 重置代码」就能恢复。',
      '',
      `<iframe src="${SITE_BASE}playground/?snap=$1" title="在线试玩：本章的页面" loading="lazy" style="width:100%;height:700px;border:1px solid #dbe4f0;border-radius:12px;background:#fff;"></iframe>`,
    ].join('\n'),
  );

// 站点 base 路径（astro.config.ts 里的 base: "..."），图片引用要带上它，
// 否则部署到 GitHub Pages 项目路径下时图片 404
function readBase() {
  const cfg = readFileSync(join(ROOT, 'astro.config.ts'), 'utf8');
  const m = cfg.match(/base:\s*["']([^"']+)["']/);
  let b = m ? m[1] : '/';
  if (!b.endsWith('/')) b += '/';
  return b;
}
const SITE_BASE = readBase();

const stripNum = (name) => name.replace(/^\d+-/, '');

// ---- 极简 YAML 头解析（字段都是单行 key: value，值可能带引号/转义） ----
function parseHead(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { head: {}, body: text };
  const head = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'");
    }
    head[line.slice(0, i).trim()] = v;
  }
  return { head, body: text.slice(m[0].length) };
}

// 正文标题移位：书稿用 `#` 写小节，nimbus 页面标题来自 frontmatter，
// 把一级标题降为二级，避免一页两个 H1
const demoteH1 = (body) => body.replace(/^(#{1}) /gm, '## ');
// 正文里的 ../images/xxx 改写为 <base>/images/xxx（Astro 不会自动给
// markdown 里的根绝对路径加 base，必须手动带上）
const fixImagePaths = (body) => body.replace(/\.\.\/images\//g, `${SITE_BASE}images/`);

function frontmatter({ title, description, order, label, group }) {
  const esc = (s) => `"${String(s ?? '').replace(/"/g, '\\"')}"`;
  return [
    '---',
    `title: ${esc(title)}`,
    `description: ${esc(description)}`,
    'sidebar:',
    `  order: ${order}`,
    `  label: ${esc(label || title)}`,
    '  group:',
    `    label: ${esc(group)}`,
    '---',
    '',
  ].join('\n');
}

function main() {
  copyImages();
  copyPlaygrounds();
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });

  const groups = readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  let order = 0;
  let pages = 0;
  const chapters = [];

  const write = (relPath, fm, body) => {
    const full = join(OUT_DIR, relPath);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, fm + expandPlayground(demoteH1(fixImagePaths(body))).replace(/\s+$/, '') + '\n');
    pages++;
  };

  for (const g of groups) {
    const idxFile = join(CONTENT_DIR, g, '_index.md');
    if (!existsSync(idxFile)) {
      console.log(`skip 无正文: ${g}`);
      continue;
    }
    const { head, body } = parseHead(readFileSync(idxFile, 'utf8'));
    if (!body.trim()) {
      console.log(`skip 空页面: ${g}`);
      continue;
    }
    const chNum = chapters.length + 1;
    const chSlug = stripNum(g);
    const chTitle = head.title || `第${chNum}章`;
    // 14 章共用一个"章节"分组：每章本来就只有一页，不再按章建分组，
    // 否则分组名"第N章 · xxx"会和页面标题"第 N 章 xxx"里的章号重复
    const groupLabel = '章节';
    chapters.push({ slug: chSlug, title: chTitle });
    write(
      `${chSlug}/index.md`,
      frontmatter({
        title: chTitle,
        description: `《从零开始学习建网站》${chTitle}`,
        order: (order += 10),
        group: groupLabel,
      }),
      body,
    );
  }

  // 落地页 index.md（order 最小，排最前）
  const links = chapters
    .map((c) => `- [${c.title}](./${c.slug}/)`)
    .join('\n');
  write(
    'index.md',
    frontmatter({
      title: '从零开始学习建网站',
      description: '给零基础学生的 Web 编程入门：HTML、CSS、JavaScript、React、Tailwind 与 AI 编程助手',
      order: -100,
      label: '全书导读',
      group: '开篇',
    }),
    [
      '用 AI 从想法走到上线——不会写代码，也能做出自己的软件。',
      '',
      '作者：Tony Wu。目标读者：零基础的产品经理、创业者、小店主、学生。',
      '',
      '全书跟着一个贯穿案例走：烘焙店主林小满，用 AI 从零做出自家小店的线上订货系统。',
      '',
      '## 章节',
      '',
      links,
      '',
    ].join('\n'),
  );

  console.log(`import-vibe: 导入完成，${chapters.length} 章，共 ${pages} 页`);
}

main();
