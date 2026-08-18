/**
 * Public homepage.
 *
 * Nothing on this page is hardcoded any more: the section list, its order,
 * and every string/image inside it come from the CMS (/admin/home) via
 * /api/public/pages/home. The block components live in
 * components/home-blocks.tsx and the content model in shared/home-content.ts.
 *
 * When the URL carries ?cmsPreview=1 the page is running inside the editor's
 * preview iframe: it renders the unsaved draft pushed over postMessage and
 * makes each section clickable so the editor can select it.
 */
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/public-layout";
import { SeoHead } from "@/components/seo-head";
import { HomeBlock, type BlockContext } from "@/components/home-blocks";
import { usePreviewContent } from "@/lib/cms-preview";
import { defaultHomePage, type PageContent } from "@shared/home-content";
import type {
  PublicMlsListing,
  PublicNeighbourhood,
  PublicBlogPost,
  PublicTestimonial,
  PublicStats,
} from "@/lib/mls-types";

export default function HomePage() {
  const preview = usePreviewContent();

  // The CMS page. Falls back to the factory page if the request fails, so a
  // cold API can never blank the homepage.
  const page = useQuery<PageContent>({
    queryKey: ["/api/public/pages", "home"],
  });

  const featured = useQuery<PublicMlsListing[]>({
    queryKey: ["/api/public/mls/featured"],
  });
  const neighbourhoods = useQuery<PublicNeighbourhood[]>({
    queryKey: ["/api/public/neighbourhoods"],
  });
  const blog = useQuery<PublicBlogPost[]>({ queryKey: ["/api/public/blog"] });
  const testimonials = useQuery<PublicTestimonial[]>({
    queryKey: ["/api/public/testimonials"],
  });
  const stats = useQuery<PublicStats>({ queryKey: ["/api/public/stats"] });

  const content: PageContent = preview.page ?? page.data ?? defaultHomePage();
  // The editor's draft carries hidden blocks too (so toggling visibility is
  // instant in the preview); the public API has already filtered them.
  const blocks = content.blocks.filter((b) => b.enabled !== false);

  const ctx: BlockContext = {
    listings: featured.data ?? [],
    listingsLoading: featured.isLoading,
    neighbourhoods: neighbourhoods.data ?? [],
    posts: blog.data ?? [],
    testimonials: testimonials.data ?? [],
    stats: stats.data,
  };

  return (
    <PublicLayout transparentHeader>
      <SeoHead
        title={content.seo.title}
        description={content.seo.description}
        canonical={content.seo.canonical || undefined}
        ogImage={content.seo.ogImage || undefined}
        noindex={content.seo.noindex || preview.active}
      />
      {blocks.map((block) =>
        preview.active ? (
          <div
            key={block.id}
            onClick={() => preview.selectBlock(block.id)}
            className={`relative cursor-pointer transition-shadow ${
              preview.selectedId === block.id
                ? "ring-2 ring-inset ring-sky-500"
                : "hover:ring-2 hover:ring-inset hover:ring-sky-300"
            }`}
            data-cms-block={block.id}
          >
            <HomeBlock block={block} ctx={ctx} />
          </div>
        ) : (
          <HomeBlock key={block.id} block={block} ctx={ctx} />
        ),
      )}
    </PublicLayout>
  );
}
