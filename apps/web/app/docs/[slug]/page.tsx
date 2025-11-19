import { listDocSlugs, loadDoc } from "@repo/utils";
import { notFound } from "next/navigation";

type Props = { params: { slug: string } };

export default async function DocPage(context: Props) {
  const params = await context.params; // If context.params is a Promise
  const slugs = await listDocSlugs();
  if (!slugs.includes(params.slug)) return notFound();
  const doc = await loadDoc(params.slug);
  return (
    <main className="max-w-3xl mx-auto p-6">
      <article className="prose prose-zinc lg:prose-lg" dangerouslySetInnerHTML={{ __html: doc.html }} />
    </main>
  );
}
