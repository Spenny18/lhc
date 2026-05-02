import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowRight,
  Search,
  MapPin,
  Award,
  ShieldCheck,
  Eye,
  Star,
  Phone,
  Mail,
  Send,
} from "lucide-react";
import { PublicLayout } from "@/components/public-layout";
import { ListingCard } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatPriceCompact } from "@/lib/format";
import type {
  PublicMlsListing,
  PublicNeighbourhood,
  PublicBlogPost,
  PublicTestimonial,
  PublicStats,
} from "@/lib/mls-types";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2400&h=1600&fit=crop";

const inquirySchema = z.object({
  name: z.string().min(2, "Please share your name"),
  email: z.string().email("Please share a valid email"),
  phone: z.string().optional(),
  message: z.string().min(10, "Tell me a little about what you're looking for"),
});

type InquiryForm = z.infer<typeof inquirySchema>;

function HeroSection() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState<string>("any");
  const [propertyType, setPropertyType] = useState<string>("any");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (priceRange !== "any") {
      const [min, max] = priceRange.split("-");
      if (min) params.set("minPrice", min);
      if (max && max !== "+") params.set("maxPrice", max);
    }
    if (propertyType !== "any") params.set("propertyType", propertyType);
    setLocation(`/mls?${params.toString()}`);
  };

  return (
    <section
      className="relative min-h-[88dvh] lg:min-h-[100dvh] flex flex-col"
      data-testid="section-hero"
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/40 to-black/85" />
      </div>

      {/* Content */}
      <div className="relative flex-1 flex flex-col justify-center max-w-[1400px] w-full mx-auto px-6 lg:px-10 pt-20 lg:pt-32 pb-16">
        <div className="font-display text-[11px] tracking-[0.32em] text-white/80 mb-6">
          CALGARY · ALBERTA
        </div>

        <h1
          className="font-serif text-white max-w-3xl text-[44px] sm:text-[56px] lg:text-[80px] leading-[0.96] tracking-tight"
          data-testid="hero-headline"
        >
          A quieter way to buy and sell Calgary's most prestigious homes.
        </h1>

        <p className="mt-8 max-w-2xl text-white/85 text-[16px] lg:text-[18px] leading-relaxed">
          Spencer Rivers represents buyers and sellers in Springbank Hill,
          Aspen Woods, Upper Mount Royal, Elbow Park, Britannia, and Bel-Aire
          — Calgary's six luxury markets — with discretion, data, and direct
          conversation.
        </p>

        {/* Search bar */}
        <form
          onSubmit={submit}
          className="mt-10 lg:mt-14 max-w-4xl bg-white/95 backdrop-blur-sm rounded-sm shadow-2xl border border-white/20 p-2 grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-2"
          data-testid="hero-search-form"
        >
          <div className="relative flex items-center">
            <Search
              className="absolute left-3 w-4 h-4 text-muted-foreground"
              strokeWidth={1.6}
            />
            <Input
              placeholder="Address, neighbourhood, or MLS#"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11 border-transparent bg-transparent focus-visible:bg-background focus-visible:ring-0 text-[14px]"
              data-testid="input-hero-search"
            />
          </div>
          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger
              className="h-11 border-transparent bg-transparent text-[13px] md:w-[160px]"
              data-testid="select-hero-price"
            >
              <SelectValue placeholder="Any price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any price</SelectItem>
              <SelectItem value="0-1500000">Up to $1.5M</SelectItem>
              <SelectItem value="1500000-2500000">$1.5M – $2.5M</SelectItem>
              <SelectItem value="2500000-4000000">$2.5M – $4M</SelectItem>
              <SelectItem value="4000000-6000000">$4M – $6M</SelectItem>
              <SelectItem value="6000000-+">$6M +</SelectItem>
            </SelectContent>
          </Select>
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger
              className="h-11 border-transparent bg-transparent text-[13px] md:w-[160px]"
              data-testid="select-hero-type"
            >
              <SelectValue placeholder="Any type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any type</SelectItem>
              <SelectItem value="Detached">Detached</SelectItem>
              <SelectItem value="Semi-Detached">Semi-Detached</SelectItem>
              <SelectItem value="Townhouse">Townhouse</SelectItem>
              <SelectItem value="Apartment">Apartment</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="submit"
            size="lg"
            className="h-11 font-display text-[11px] tracking-[0.18em] bg-black text-white hover:bg-black/90"
            data-testid="button-hero-search"
          >
            SEARCH MLS
          </Button>
        </form>

        <div className="mt-6 text-[12px] text-white/70 font-display tracking-[0.16em]">
          LIVE PILLAR 9 FEED · CALGARY MLS®
        </div>
      </div>
    </section>
  );
}

function StatsBand({ stats }: { stats: PublicStats | undefined }) {
  const items = [
    { label: "Active Listings", value: stats?.activeListings ?? "—" },
    { label: "Years in Calgary", value: "12" },
    { label: "Neighbourhoods Served", value: "6" },
    { label: "Avg. Sale-to-List", value: "98.4%" },
  ];
  return (
    <section
      className="border-y border-border bg-secondary/40"
      data-testid="section-stats"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12 lg:py-16 grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6">
        {items.map((it) => (
          <div key={it.label} className="text-center lg:text-left">
            <div
              className="font-serif text-[40px] lg:text-[56px] leading-none text-foreground tabular-nums"
              data-testid={`stat-${it.label.toLowerCase().replace(/\s/g, "-")}`}
            >
              {it.value}
            </div>
            <div className="mt-2 lg:mt-3 font-display text-[10px] lg:text-[11px] tracking-[0.22em] text-muted-foreground">
              {it.label.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturedListings({
  listings,
  loading,
}: {
  listings: PublicMlsListing[];
  loading: boolean;
}) {
  return (
    <section
      className="py-20 lg:py-32 bg-background"
      data-testid="section-featured"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="flex items-end justify-between gap-6 mb-12 lg:mb-16">
          <div>
            <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground mb-4">
              ON THE MARKET
            </div>
            <h2 className="font-serif text-[36px] lg:text-[52px] leading-[1.05] tracking-tight max-w-2xl">
              Featured Calgary luxury listings.
            </h2>
          </div>
          <Link href="/mls">
            <a
              className="hidden md:inline-flex items-center gap-2 font-display text-[11px] tracking-[0.22em] text-foreground hover:gap-3 transition-all"
              data-testid="link-view-all-listings"
            >
              VIEW ALL LISTINGS
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.6} />
            </a>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[5/4]" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="border border-border rounded-sm p-12 text-center">
            <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground">
              NO ACTIVE LISTINGS
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Spencer's current inventory is moving — call directly for
              off-market opportunities.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {listings.slice(0, 6).map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}

        <div className="mt-10 md:hidden text-center">
          <Link href="/mls">
            <a className="inline-flex items-center gap-2 font-display text-[11px] tracking-[0.22em] text-foreground">
              VIEW ALL LISTINGS
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.6} />
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
}

function NeighbourhoodPicker({
  neighbourhoods,
}: {
  neighbourhoods: PublicNeighbourhood[];
}) {
  return (
    <section
      className="py-20 lg:py-32 bg-secondary/30 border-y border-border"
      data-testid="section-neighbourhoods"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="max-w-3xl mb-14 lg:mb-20">
          <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground mb-4">
            CALGARY · LUXURY MARKETS
          </div>
          <h2 className="font-serif text-[36px] lg:text-[52px] leading-[1.05] tracking-tight">
            Six neighbourhoods. One advisor who knows them block by block.
          </h2>
          <p className="mt-6 text-[15px] lg:text-[16px] text-muted-foreground leading-relaxed">
            Each of Calgary's prestige communities has its own character,
            inventory rhythm, and pricing logic. Spencer works in all six —
            full-time, year-round.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {neighbourhoods.map((n) => (
            <Link key={n.slug} href={`/neighbourhoods/${n.slug}`}>
              <a
                className="group relative block aspect-[5/6] overflow-hidden rounded-sm bg-black"
                data-testid={`card-neighbourhood-${n.slug}`}
              >
                <img
                  src={n.heroImage}
                  alt={n.name}
                  loading="lazy"
                  className="w-full h-full object-cover opacity-75 transition-all duration-700 group-hover:scale-[1.04] group-hover:opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7 lg:p-8 text-white">
                  <div className="font-display text-[10px] tracking-[0.22em] text-white/65 mb-2">
                    {formatPriceCompact(n.avgPrice)} AVG
                  </div>
                  <div className="font-serif text-[28px] lg:text-[32px] leading-none">
                    {n.name}
                  </div>
                  <div className="mt-3 text-[13px] text-white/80 leading-snug line-clamp-2">
                    {n.tagline}
                  </div>
                  <div className="mt-5 inline-flex items-center gap-2 font-display text-[10px] tracking-[0.22em] text-white">
                    EXPLORE
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" strokeWidth={1.8} />
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyUs() {
  const points = [
    {
      icon: Award,
      title: "12 years in the prestige market",
      body: "Working exclusively in Calgary's six luxury communities — the same streets, year over year — means I know the lots, the neighbours, and the rebuild history of every listing.",
    },
    {
      icon: ShieldCheck,
      title: "Discretion as the default",
      body: "Roughly half of Calgary's $2M+ sales now move off-market. I run a private buyer database and an established agent network for clients who want to keep a sale quiet.",
    },
    {
      icon: Eye,
      title: "Pricing built on data, not opinion",
      body: "Every pricing recommendation is anchored to comparable sales, days-on-market trends, and the specific lot characteristics that drive value in your community.",
    },
  ];
  return (
    <section
      className="py-20 lg:py-32 bg-background"
      data-testid="section-why-us"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        <div className="lg:col-span-5">
          <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground mb-4">
            THE RIVERS APPROACH
          </div>
          <h2 className="font-serif text-[36px] lg:text-[52px] leading-[1.05] tracking-tight">
            Quieter, sharper, fewer surprises.
          </h2>
          <p className="mt-8 text-[15px] lg:text-[16px] text-muted-foreground leading-relaxed">
            Most luxury sellers in Calgary aren't looking for billboards or
            branded swag — they want a transaction handled with judgment, by
            someone who actually answers the phone. That's what I do.
          </p>
          <Link href="/about">
            <a
              className="mt-10 inline-flex items-center gap-2 font-display text-[11px] tracking-[0.22em] text-foreground hover:gap-3 transition-all"
              data-testid="link-about-spencer"
            >
              READ MORE ABOUT SPENCER
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.6} />
            </a>
          </Link>
        </div>

        <div className="lg:col-span-7 grid gap-px bg-border">
          {points.map(({ icon: Icon, title, body }, i) => (
            <div
              key={title}
              className={`bg-background p-8 lg:p-10 ${i === 0 ? "" : "border-t border-border"}`}
            >
              <Icon className="w-6 h-6 text-foreground" strokeWidth={1.4} />
              <h3 className="mt-5 font-serif text-[22px] lg:text-[26px] leading-tight">
                {title}
              </h3>
              <p className="mt-4 text-[14px] text-muted-foreground leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlogTeaser({ posts }: { posts: PublicBlogPost[] }) {
  if (!posts.length) return null;
  return (
    <section
      className="py-20 lg:py-32 bg-secondary/30 border-y border-border"
      data-testid="section-blog-teaser"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="flex items-end justify-between gap-6 mb-12 lg:mb-16">
          <div>
            <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground mb-4">
              JOURNAL
            </div>
            <h2 className="font-serif text-[36px] lg:text-[52px] leading-[1.05] tracking-tight max-w-2xl">
              Notes from the Calgary luxury market.
            </h2>
          </div>
          <Link href="/blog">
            <a
              className="hidden md:inline-flex items-center gap-2 font-display text-[11px] tracking-[0.22em] text-foreground hover:gap-3 transition-all"
              data-testid="link-all-posts"
            >
              ALL ENTRIES
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.6} />
            </a>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
          {posts.slice(0, 3).map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`}>
              <a
                className="group block"
                data-testid={`card-blog-${p.slug}`}
              >
                <div className="aspect-[4/3] overflow-hidden rounded-sm bg-secondary">
                  <img
                    src={p.heroImage}
                    alt={p.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="mt-6 font-display text-[10px] tracking-[0.22em] text-muted-foreground">
                  {p.category.toUpperCase()} · {p.readMinutes} MIN
                </div>
                <h3 className="mt-3 font-serif text-[24px] lg:text-[28px] leading-[1.15] tracking-tight">
                  {p.title}
                </h3>
                <p className="mt-3 text-[14px] text-muted-foreground leading-relaxed line-clamp-3">
                  {p.excerpt}
                </p>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials({ items }: { items: PublicTestimonial[] }) {
  const [idx, setIdx] = useState(0);
  const visible = useMemo(() => items.slice(0, 6), [items]);
  if (!visible.length) return null;
  const t = visible[idx % visible.length];

  return (
    <section
      className="py-24 lg:py-36 bg-black text-white"
      data-testid="section-testimonials"
    >
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10 text-center">
        <div className="font-display text-[11px] tracking-[0.22em] text-white/55 mb-6">
          CLIENT VOICES
        </div>
        <div className="flex justify-center mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < t.rating ? "fill-white text-white" : "text-white/30"}`}
            />
          ))}
        </div>
        <blockquote
          className="font-serif text-[26px] lg:text-[40px] leading-[1.25] tracking-tight"
          data-testid="testimonial-body"
        >
          "{t.body}"
        </blockquote>
        <div className="mt-10 font-display text-[11px] tracking-[0.22em] text-white/75">
          {t.authorName.toUpperCase()}
        </div>
        <div className="mt-2 text-[13px] text-white/55">{t.authorRole}</div>

        {visible.length > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            {visible.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-8 h-px transition-colors ${
                  i === idx % visible.length ? "bg-white" : "bg-white/25"
                }`}
                aria-label={`Show testimonial ${i + 1}`}
                data-testid={`testimonial-dot-${i}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ContactCTA() {
  const { toast } = useToast();
  const form = useForm<InquiryForm>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  const onSubmit = async (data: InquiryForm) => {
    try {
      await apiRequest("POST", "/api/inquiry", {
        ...data,
        source: "Homepage CTA",
      });
      toast({
        title: "Message sent",
        description: "I'll be in touch within one business day.",
      });
      form.reset();
    } catch (err: any) {
      toast({
        title: "Couldn't send",
        description: err.message ?? "Please try again, or call directly.",
        variant: "destructive",
      });
    }
  };

  return (
    <section
      className="py-20 lg:py-32 bg-background"
      data-testid="section-contact-cta"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        <div className="lg:col-span-5">
          <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground mb-4">
            START THE CONVERSATION
          </div>
          <h2 className="font-serif text-[36px] lg:text-[52px] leading-[1.05] tracking-tight">
            Considering a move? Let's talk.
          </h2>
          <p className="mt-8 text-[15px] text-muted-foreground leading-relaxed">
            The best conversations start three to six months before a listing
            goes live. Whether you're a year out or testing the market this
            week, send a note — every inquiry gets a personal reply.
          </p>

          <div className="mt-10 space-y-4 text-[14px]">
            <a
              href="tel:+14039669237"
              className="flex items-center gap-3 hover:opacity-70 transition-opacity"
              data-testid="contact-phone"
            >
              <span className="w-9 h-9 border border-border rounded-full flex items-center justify-center">
                <Phone className="w-3.5 h-3.5" strokeWidth={1.6} />
              </span>
              <div>
                <div className="font-medium">(403) 966-9237</div>
                <div className="text-muted-foreground text-[12px]">Direct line</div>
              </div>
            </a>
            <a
              href="mailto:spencer@riversrealestate.ca"
              className="flex items-center gap-3 hover:opacity-70 transition-opacity"
              data-testid="contact-email"
            >
              <span className="w-9 h-9 border border-border rounded-full flex items-center justify-center">
                <Mail className="w-3.5 h-3.5" strokeWidth={1.6} />
              </span>
              <div>
                <div className="font-medium">spencer@riversrealestate.ca</div>
                <div className="text-muted-foreground text-[12px]">Replied within 1 business day</div>
              </div>
            </a>
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 border border-border rounded-full flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5" strokeWidth={1.6} />
              </span>
              <div>
                <div className="font-medium">Synterra Realty</div>
                <div className="text-muted-foreground text-[12px]">Calgary, Alberta</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="border border-border rounded-sm p-6 lg:p-10 bg-card">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
                data-testid="form-home-inquiry"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-display text-[10px] tracking-[0.22em] text-muted-foreground">
                          NAME
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Jane Doe"
                            data-testid="input-inquiry-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-display text-[10px] tracking-[0.22em] text-muted-foreground">
                          EMAIL
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="jane@example.com"
                            data-testid="input-inquiry-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-display text-[10px] tracking-[0.22em] text-muted-foreground">
                        PHONE (OPTIONAL)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="(403) 555-0123"
                          data-testid="input-inquiry-phone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-display text-[10px] tracking-[0.22em] text-muted-foreground">
                        WHAT CAN I HELP WITH?
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={5}
                          placeholder="Buying, selling, just exploring — tell me a bit about what you're thinking."
                          data-testid="textarea-inquiry-message"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="w-full md:w-auto h-12 px-8 font-display text-[11px] tracking-[0.22em] bg-black text-white hover:bg-black/90"
                  disabled={form.formState.isSubmitting}
                  data-testid="button-submit-inquiry"
                >
                  {form.formState.isSubmitting ? "SENDING..." : (
                    <>
                      <Send className="w-3.5 h-3.5 mr-2" strokeWidth={1.6} />
                      SEND MESSAGE
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const featured = useQuery<PublicMlsListing[]>({
    queryKey: ["/api/public/mls/featured"],
  });
  const neighbourhoods = useQuery<PublicNeighbourhood[]>({
    queryKey: ["/api/public/neighbourhoods"],
  });
  const blog = useQuery<PublicBlogPost[]>({
    queryKey: ["/api/public/blog"],
  });
  const testimonials = useQuery<PublicTestimonial[]>({
    queryKey: ["/api/public/testimonials"],
  });
  const stats = useQuery<PublicStats>({
    queryKey: ["/api/public/stats"],
  });

  return (
    <PublicLayout transparentHeader>
      <HeroSection />
      <StatsBand stats={stats.data} />
      <FeaturedListings
        listings={featured.data ?? []}
        loading={featured.isLoading}
      />
      <NeighbourhoodPicker neighbourhoods={neighbourhoods.data ?? []} />
      <WhyUs />
      <BlogTeaser posts={blog.data ?? []} />
      <Testimonials items={testimonials.data ?? []} />
      <ContactCTA />
    </PublicLayout>
  );
}
