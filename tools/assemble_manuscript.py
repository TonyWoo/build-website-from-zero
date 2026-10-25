#!/usr/bin/env python3
"""把 content/zh/ 下前言 + 19 章 _index.md 装配成单文件 manuscript.md（供 Pandoc 构建 PDF/EPUB）。

装配规则（对齐《无工之日》的 export 管线）：
- 开头生成扉页：书名（Pandoc 不编号标记 {-}）+ 作者 + 副标题题引。
- 每章标题取自各 _index.md 的 frontmatter title，作为 H1；章内小节（##）保持不动，
  使目录里章、小节分层（--toc-depth=2）；EPUB 用 --split-level=1 按章切分。
- frontmatter 在装配时剥离。
- 图片路径改写：正文里的 `](../images/…)` 以章节目录为基准，装配后统一改为仓库根基准的
  `](images/…)`，Pandoc 才能找到图（22 张蓝图风 SVG 随文入书）。
- 每章末尾的 `<!-- playground: … -->` 注释是试玩框挂载点，EPUB/PDF 里不渲染，
  试玩功能按立规不进电子书。

用法：python3 tools/assemble_manuscript.py [输出文件]
默认输出仓库根 manuscript.md。
"""
import re
import sys
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content" / "zh"
OUT = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "manuscript.md"

TITLE = "从零开始学习建网站"
SUBTITLE = "给零基础学生的 Web 编程入门——HTML、CSS、JavaScript、Git、React、Tailwind 与 AI 编程助手"
AUTHOR = "Tony Wu"

DOCS = [
    "000-preface",
    "010-meet-web",
    "020-tools",
    "030-html-basics",
    "040-html-advanced",
    "050-css-basics",
    "060-css-layout",
    "070-css-advanced",
    "080-js-basics",
    "090-js-logic",
    "100-js-dom",
    "110-js-advanced",
    "120-git",
    "130-react-thinking",
    "140-react-practice",
    "150-tailwind",
    "160-deepseek-companion",
    "170-ai-agents",
    "180-launch",
    "190-backend",
]


def parse_doc(path):
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
    if not m:
        raise ValueError(f"bad frontmatter: {path}")
    meta = {}
    for line in m.group(1).split("\n"):
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip().strip('"')
    if "title" not in meta:
        raise ValueError(f"missing title: {path}")
    return meta["title"], m.group(2).strip("\n")


def rewrite_images(body):
    """章节内图片以章节目录为基准（../images/），装配后改为仓库根基准。"""
    return body.replace("](../images/", "](images/")


def main():
    parts = []
    parts.append(f"# {TITLE} {{-}}\n\n{AUTHOR}\n\n> {SUBTITLE}\n")

    for slug in DOCS:
        path = CONTENT / slug / "_index.md"
        if not path.exists():
            raise SystemExit(f"missing doc: {path}")
        title, body = parse_doc(path)
        body = rewrite_images(body)
        parts.append(f"# {title}\n\n{body}\n")

    OUT.write_text("\n".join(parts), encoding="utf-8")
    han = len(re.findall(r"[一-鿿]", OUT.read_text(encoding="utf-8")))
    print(f"assembled -> {OUT} （{len(DOCS)} 篇，汉字约 {han}）")


if __name__ == "__main__":
    main()
