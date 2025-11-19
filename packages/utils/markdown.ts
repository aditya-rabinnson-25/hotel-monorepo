import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeStringify from "rehype-stringify";

/**
 * IMPORTANT: apps/web is 2 levels deeper than repo root.
 * docs live at ../../docs/contents relative to apps/web.
 */
const CONTENT_DIR = path.resolve(process.cwd(), "../../docs/contents");

export async function listDocSlugs(): Promise<string[]> {
  const files = await fs.readdir(CONTENT_DIR);
  return files.filter(f => f.endsWith(".md")).map(f => f.replace(/\.md$/, ""));
}

export async function loadDoc(slug: string): Promise<{ slug: string; html: string; meta: Record<string, any> }> {
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  const raw = await fs.readFile(filePath, "utf8");
  const { data: meta, content } = matter(raw);

  const file = await remark()
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);

  return { slug, html: String(file), meta: meta ?? {} };
}
