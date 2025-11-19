import { loadDoc } from "@repo/utils";

export default async function AboutUsPage() {
  const doc = await loadDoc("about-us");
  return (
    <main className="max-w-3xl mx-auto p-6">
      <article
        className="prose prose-zinc lg:prose-lg"
        dangerouslySetInnerHTML={{ __html: doc.html }}
      />
    </main>
  );
}
