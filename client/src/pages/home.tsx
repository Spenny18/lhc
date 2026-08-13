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
  Check,
  Play,
  Instagram,
  Home,
  Users,
  Building2,
  TrendingUp,
  Sparkles,
  Heart,
  Briefcase,
  Compass,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
          <Link href="/mls" className="hidden md:inline-flex items-center gap-2 font-display text-[11px] tracking-[0.22em] text-foreground hover:gap-3 transition-all"
              data-testid="link-view-all-listings">
              VIEW ALL LISTINGS
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.6} />
            
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
          <Link href="/mls" className="inline-flex items-center gap-2 font-display text-[11px] tracking-[0.22em] text-foreground">
              VIEW ALL LISTINGS
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.6} />
            
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
            <Link key={n.slug} href={`/neighbourhoods/${n.slug}`} className="group relative block aspect-[5/6] overflow-hidden rounded-sm bg-black"
                data-testid={`card-neighbourhood-${n.slug}`}>
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
          <Link href="/about" className="mt-10 inline-flex items-center gap-2 font-display text-[11px] tracking-[0.22em] text-foreground hover:gap-3 transition-all"
              data-testid="link-about-spencer">
              READ MORE ABOUT SPENCER
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.6} />
            
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
          <Link href="/blog" className="hidden md:inline-flex items-center gap-2 font-display text-[11px] tracking-[0.22em] text-foreground hover:gap-3 transition-all"
              data-testid="link-all-posts">
              ALL ENTRIES
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.6} />
            
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
          {posts.slice(0, 6).map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="group block"
                data-testid={`card-blog-${p.slug}`}>
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

// =====================================================================
// NEW SECTIONS — built to mirror luxuryhomescalgary.ca homepage parity.
// Section order in the final HomePage render is:
//   Hero · RecentSales · Authority · NoFluffProcess · StatsBand ·
//   FeaturedListings · NeighbourhoodPicker · NeighbourhoodLinkGrid ·
//   CalgaryZones · VideoBlock · BigStatsBand · BuyerSellerTabs · WhyUs ·
//   AudienceSegments · AwardsStrip · LuxuryMarketOverview · BlogTeaser ·
//   Testimonials · InstagramFeed · ContactCTA
// =====================================================================

// --- A1: Recent Sales (3-up sold listings) ----------------------------
function RecentSales() {
  // Real listing photography for Spencer's actual sales (same images the
  // old WordPress homepage used) — not stock stand-ins.
  const sales = [
    {
      address: "102 Malibou Road SW",
      img: "https://luxuryhomescalgary.ca/wp-content/uploads/2024/12/005-102-Malibou-rd-TW-2-scaled-1.jpg",
      caption: "Sold · Mayfair / Bel-Aire",
    },
    {
      address: "1105 East Chestermere Drive",
      img: "https://luxuryhomescalgary.ca/wp-content/uploads/2025/12/029-1105-E-chestermere-DR-14-scaled-1-scaled.jpg",
      caption: "Sold · East Chestermere",
    },
    {
      address: "43 Red Willow Crescent West",
      img: "https://luxuryhomescalgary.ca/wp-content/uploads/2025/12/dg_006.jpeg",
      caption: "Sold · Heritage Pointe",
    },
  ];
  return (
    <section
      className="py-20 lg:py-28 bg-background"
      data-testid="section-recent-sales"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="flex items-end justify-between gap-6 mb-12 lg:mb-16">
          <div>
            <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground mb-4">
              SELECTED · SOLD
            </div>
            <h2 className="font-serif text-[36px] lg:text-[52px] leading-[1.05] tracking-tight max-w-2xl">
              Recent sales.
            </h2>
          </div>
          <Link href="/contact" className="hidden md:inline-flex items-center gap-2 font-display text-[11px] tracking-[0.22em] text-foreground hover:gap-3 transition-all"
              data-testid="link-view-more-sold">
              VIEW MORE RECENT SALES
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.6} />
            
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {sales.map((s) => (
            <div key={s.address} className="group">
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-secondary">
                <img
                  src={s.img}
                  alt={s.address}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/85 text-white font-display text-[10px] tracking-[0.22em] rounded-sm">
                  SOLD
                </div>
              </div>
              <div className="mt-5 font-serif text-[22px] lg:text-[24px] leading-tight">
                {s.address}
              </div>
              <div className="mt-2 font-display text-[10px] tracking-[0.22em] text-muted-foreground">
                {s.caption.toUpperCase()}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 md:hidden text-center">
          <Link href="/contact" className="inline-flex items-center gap-2 font-display text-[11px] tracking-[0.22em] text-foreground">
              VIEW MORE RECENT SALES
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.6} />
            
          </Link>
        </div>
      </div>
    </section>
  );
}

// --- A2: Authority / "Calgary's Most Trusted" -------------------------
function AuthorityBlock() {
  return (
    <section
      className="py-20 lg:py-32 bg-secondary/30 border-y border-border"
      data-testid="section-authority"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
        <div className="lg:col-span-5 order-2 lg:order-1">
          <div className="aspect-[4/5] overflow-hidden rounded-sm bg-secondary">
            <img
              src="https://luxuryhomescalgary.ca/wp-content/uploads/2024/10/006-102-Malibou-rd-1-1-scaled.jpg"
              alt="Calgary luxury home sold by Spencer Rivers"
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="lg:col-span-7 order-1 lg:order-2">
          <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground mb-4">
            SPENCER RIVERS
          </div>
          <h2 className="font-serif text-[36px] lg:text-[56px] leading-[1.04] tracking-tight">
            Calgary's most trusted luxury real estate expert.
          </h2>
          <p className="mt-6 text-[15px] lg:text-[17px] text-muted-foreground leading-relaxed">
            Recognized for market expertise and client satisfaction. Calgary's
            most responsive real estate professional and the city's market
            volatility navigation expert — working full-time, year-round, in
            Calgary's six prestige communities.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/about" className="inline-flex items-center gap-2 px-6 h-12 bg-foreground text-background font-display text-[11px] tracking-[0.22em]"
                data-testid="link-authority-about">
                ABOUT SPENCER
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.6} />
              
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 px-6 h-12 border border-foreground font-display text-[11px] tracking-[0.22em]"
                data-testid="link-authority-contact">
                CONTACT SPENCER
              
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- A3: No-Fluff Process strip --------------------------------------
function NoFluffProcess() {
  const promises = [
    "Honest market assessment with no pressure to decide quickly",
    "Regular feedback after every showing — you'll always know where you stand",
    "We organize lawyers, inspections, and all complex details",
    "Responsive communication because timely responses are crucial",
  ];
  return (
    <section
      className="py-20 lg:py-32 bg-background"
      data-testid="section-no-fluff"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="max-w-3xl mb-14 lg:mb-20">
          <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground mb-4">
            OUR STRESS-FREE BUYING / SELLING PROCESS
          </div>
          <h2 className="font-serif text-[36px] lg:text-[56px] leading-[1.04] tracking-tight">
            No fluff, just results.
          </h2>
          <p className="mt-6 text-[15px] lg:text-[17px] text-muted-foreground leading-relaxed">
            From market volatility to final closing — we handle every detail.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 max-w-4xl">
          {promises.map((p) => (
            <div key={p} className="flex items-start gap-4">
              <span className="mt-1 w-7 h-7 flex-shrink-0 rounded-full bg-foreground text-background flex items-center justify-center">
                <Check className="w-3.5 h-3.5" strokeWidth={2.4} />
              </span>
              <p className="text-[15px] lg:text-[16px] leading-relaxed">{p}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 h-12 bg-foreground text-background font-display text-[11px] tracking-[0.22em]"
              data-testid="link-nofluff-contact">
              CONTACT SPENCER
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.6} />
            
          </Link>
        </div>
      </div>
    </section>
  );
}

// --- A4: Calgary Zones panel -----------------------------------------
function CalgaryZones() {
  const zones = [
    {
      name: "Southwest Established Prestige",
      summary:
        "Springbank Hill, Aspen Woods, Bel-Aire, Britannia, Mayfair — Calgary's deepest concentration of $2M+ inventory.",
    },
    {
      name: "City Centre Urban Luxury",
      summary:
        "Upper Mount Royal, Elbow Park, Roxboro, Rideau Park, Mission, Beltline — historic estates and new-build penthouses.",
    },
    {
      name: "Northwest Family Communities",
      summary:
        "Edgemont, Hidden Valley, Tuscany, Varsity, Bearspaw acreage — established neighbourhoods near top schools.",
    },
    {
      name: "Southeast Value & Community",
      summary:
        "Mahogany, Auburn Bay, Cranston, McKenzie Lake — newer lake communities with strong amenity premiums.",
    },
    {
      name: "Northeast Rising Communities",
      summary:
        "Skyview Ranch, Redstone, Cityscape — growth markets with the best $/sq-ft for new construction.",
    },
  ];
  return (
    <section
      className="py-20 lg:py-32 bg-secondary/30 border-y border-border"
      data-testid="section-zones"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-5">
            <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground mb-4">
              CALGARY NEIGHBOURHOOD EXPERT
            </div>
            <h2 className="font-serif text-[36px] lg:text-[52px] leading-[1.04] tracking-tight">
              Every zone, every community.
            </h2>
            <p className="mt-6 text-[15px] lg:text-[17px] text-muted-foreground leading-relaxed">
              Calgary's diversity across zones requires deep local knowledge.
              We know them all — from the prestige streets of the inner
              southwest to the new-construction communities of the northeast.
            </p>
            <Link href="/neighbourhoods" className="mt-8 inline-flex items-center gap-2 font-display text-[11px] tracking-[0.22em] text-foreground hover:gap-3 transition-all"
                data-testid="link-view-all-zones">
                VIEW ALL AREAS
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.6} />
              
            </Link>
          </div>

          <div className="lg:col-span-7 divide-y divide-border border-y border-border">
            {zones.map((z, i) => (
              <div
                key={z.name}
                className="py-6 lg:py-7 grid grid-cols-[40px_1fr] gap-5"
              >
                <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground pt-1.5">
                  0{i + 1}
                </div>
                <div>
                  <h3 className="font-serif text-[22px] lg:text-[24px] leading-tight">
                    {z.name}
                  </h3>
                  <p className="mt-2 text-[14px] text-muted-foreground leading-relaxed">
                    {z.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// --- A5: YouTube video block -----------------------------------------
function VideoBlock() {
  const [playing, setPlaying] = useState(false);
  return (
    <section
      className="py-20 lg:py-32 bg-background"
      data-testid="section-video"
    >
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10 text-center">
        <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground mb-4">
          MEET SPENCER
        </div>
        <h2 className="font-serif text-[32px] lg:text-[48px] leading-[1.08] tracking-tight max-w-3xl mx-auto">
          Why Spencer Rivers is the best luxury realtor in Calgary.
        </h2>

        <div className="mt-12 lg:mt-16 relative aspect-video rounded-sm overflow-hidden bg-black shadow-2xl">
          {playing ? (
            <iframe
              src="https://www.youtube.com/embed/TV0Rm0fZxI8?autoplay=1&rel=0"
              title="Why Spencer Rivers is the best luxury realtor in Calgary"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              onClick={() => setPlaying(true)}
              className="group absolute inset-0 w-full h-full"
              aria-label="Play video about Spencer Rivers"
              data-testid="btn-play-video"
            >
              <img
                src="https://i.ytimg.com/vi/TV0Rm0fZxI8/maxresdefault.jpg"
                alt="Spencer Rivers video thumbnail"
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-white/95 group-hover:bg-white flex items-center justify-center transition-transform group-hover:scale-105">
                  <Play
                    className="w-8 h-8 lg:w-10 lg:h-10 text-black ml-1"
                    strokeWidth={1.6}
                    fill="currentColor"
                  />
                </span>
              </div>
            </button>
          )}
        </div>

        <p className="mt-10 lg:mt-12 max-w-2xl mx-auto text-[15px] text-muted-foreground leading-relaxed">
          With nearly 8,500 REALTORS® in Calgary, choosing the right one for
          your luxury home sale or purchase matters. Spencer brings 12 years
          of focused experience in Calgary's prestige market — every street,
          every block, every comparable sale.
        </p>
      </div>
    </section>
  );
}

// --- A6: Big-Stats Band (the headline marquee stats) -----------------
function BigStatsBand() {
  const stats = [
    {
      value: "$100M+",
      label: "In sales to date",
      sub: "No. 1 Luxury Realtor in Calgary",
    },
    {
      value: "Top 1%",
      label: "Realtor in Canada",
      sub: "Recognized nationally",
    },
    {
      value: "100%",
      label: "List price to sales ratio",
      sub: "Sellers earn their asking price",
    },
    {
      value: "900+",
      label: "Clients helped",
      sub: "And counting in 2025",
    },
  ];
  return (
    <section
      className="py-20 lg:py-32 bg-black text-white"
      data-testid="section-big-stats"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="font-display text-[11px] tracking-[0.22em] text-white/55 mb-4">
            BY THE NUMBERS
          </div>
          <h2 className="font-serif text-[32px] lg:text-[48px] leading-[1.08] tracking-tight">
            Calgary's most responsive real estate professional. Calgary's
            market volatility navigation expert.
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-14 gap-x-6 lg:gap-x-10">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-serif text-[44px] lg:text-[72px] leading-none tabular-nums">
                {s.value}
              </div>
              <div className="mt-4 font-display text-[10px] lg:text-[11px] tracking-[0.22em] text-white/75">
                {s.label.toUpperCase()}
              </div>
              <div className="mt-2 text-[12px] text-white/55 leading-relaxed">
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- A7: Buyer/Seller pain-point tabs --------------------------------
function BuyerSellerTabs() {
  const buyerCards = [
    {
      title: "Competitive market navigation",
      problem:
        "Multiple offers and bidding wars make it impossible to get a fair deal.",
      solution:
        "Spencer's experience with 900+ Calgary transactions means he knows how to position your offer to win without overpaying — including off-market access most buyers never see.",
    },
    {
      title: "Current market advantages",
      problem: "Is now the right time to buy?",
      solution:
        "Real-time read on inventory, mortgage rates, and seasonal price patterns by community. Buy when YOUR target is soft, not when the headline market is.",
    },
    {
      title: "Property discovery & access",
      problem:
        "The best properties seem to sell before I even see them.",
      solution:
        "Private buyer database and an established agent network — roughly half of Calgary's $2M+ sales now move off-market. You see them first.",
    },
    {
      title: "Neighbourhood expertise",
      problem:
        "I need to understand the community, schools, investment potential.",
      solution:
        "Block-by-block knowledge of Calgary's six prestige communities — lot characteristics, neighbour history, rebuild patterns, and which streets hold value.",
    },
    {
      title: "Due diligence & protection",
      problem:
        "How do I avoid costly mistakes and hidden problems?",
      solution:
        "We organize lawyers, inspections, environmental reports, and every complex detail. You make the decision; we surface the risks.",
    },
  ];
  const sellerCards = [
    {
      title: "Stress & anxiety relief",
      problem: "Selling feels overwhelming — too many moving pieces.",
      solution:
        "Every detail handled. 98% of Spencer's sellers report a stress-free experience. You get clarity, weekly updates, and one direct line.",
    },
    {
      title: "Market volatility navigation",
      problem:
        "Rates, inventory, and prices keep shifting — when do I list?",
      solution:
        "Pricing built on data, not opinion: comparable sales, days-on-market trends, and the specific lot characteristics that drive value in your community.",
    },
    {
      title: "Communication & transparency",
      problem:
        "Agents disappear after the sign goes up.",
      solution:
        "Regular feedback after every showing. You'll always know where you stand, who saw the home, and what they said.",
    },
    {
      title: "Neighbourhood expertise authority",
      problem:
        "Generalists pricing a luxury home in a market they don't actually work in.",
      solution:
        "Spencer works exclusively in Calgary's six prestige communities — full-time, year-round. Same streets, year after year.",
    },
  ];

  const results = [
    { value: "7 Days", label: "Avg. days on market", sub: "(vs 23 Calgary average)" },
    { value: "103%", label: "Of list price achieved", sub: "On average" },
    { value: "98%", label: "Stress-free experience", sub: "Of sellers report" },
    { value: "100%", label: "Detail management", sub: "Lawyers, inspections, every step" },
  ];

  return (
    <section
      className="py-20 lg:py-32 bg-background"
      data-testid="section-buyer-seller-tabs"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground mb-4">
            HOW WE WORK
          </div>
          <h2 className="font-serif text-[36px] lg:text-[56px] leading-[1.04] tracking-tight">
            How we'll get the best deal for you.
          </h2>
        </div>

        <Tabs defaultValue="buyer" className="w-full">
          <TabsList className="mx-auto flex w-fit bg-secondary/60 p-1 rounded-sm">
            <TabsTrigger
              value="buyer"
              className="px-8 py-2.5 font-display text-[11px] tracking-[0.22em] data-[state=active]:bg-foreground data-[state=active]:text-background"
              data-testid="tab-buyer"
            >
              FOR BUYERS
            </TabsTrigger>
            <TabsTrigger
              value="seller"
              className="px-8 py-2.5 font-display text-[11px] tracking-[0.22em] data-[state=active]:bg-foreground data-[state=active]:text-background"
              data-testid="tab-seller"
            >
              FOR SELLERS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buyer" className="mt-12 lg:mt-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {buyerCards.map((c) => (
                <div
                  key={c.title}
                  className="border border-border rounded-sm p-7 lg:p-8 bg-card hover:border-foreground/40 transition-colors"
                >
                  <div className="font-display text-[10px] tracking-[0.22em] text-muted-foreground">
                    {c.title.toUpperCase()}
                  </div>
                  <p className="mt-4 font-serif text-[18px] leading-snug italic text-foreground/85">
                    "{c.problem}"
                  </p>
                  <p className="mt-5 text-[14px] text-muted-foreground leading-relaxed">
                    {c.solution}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="seller" className="mt-12 lg:mt-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {sellerCards.map((c) => (
                <div
                  key={c.title}
                  className="border border-border rounded-sm p-7 lg:p-8 bg-card hover:border-foreground/40 transition-colors"
                >
                  <div className="font-display text-[10px] tracking-[0.22em] text-muted-foreground">
                    {c.title.toUpperCase()}
                  </div>
                  <p className="mt-4 font-serif text-[18px] leading-snug italic text-foreground/85">
                    "{c.problem}"
                  </p>
                  <p className="mt-5 text-[14px] text-muted-foreground leading-relaxed">
                    {c.solution}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-16 lg:mt-20 border border-foreground rounded-sm p-8 lg:p-12 bg-card">
              <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground mb-2">
                OUR PROVEN RESULTS FORMULA
              </div>
              <h3 className="font-serif text-[26px] lg:text-[36px] leading-tight">
                What "no fluff, just results" actually looks like.
              </h3>
              <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-6">
                {results.map((r) => (
                  <div key={r.label}>
                    <div className="font-serif text-[32px] lg:text-[44px] leading-none tabular-nums">
                      {r.value}
                    </div>
                    <div className="mt-3 font-display text-[10px] tracking-[0.22em] text-muted-foreground">
                      {r.label.toUpperCase()}
                    </div>
                    <div className="mt-1 text-[12px] text-muted-foreground/85">
                      {r.sub}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-12 lg:mt-16 text-center">
          <Link href="/home-evaluation" className="inline-flex items-center gap-2 px-7 h-12 bg-foreground text-background font-display text-[11px] tracking-[0.22em]"
              data-testid="link-tabs-home-eval">
              GET YOUR CUSTOM HOME VALUATION
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.6} />
            
          </Link>
        </div>
      </div>
    </section>
  );
}

// --- A8: Awards & Accolades strip ------------------------------------
function AwardsStrip() {
  const awards = [
    "Top 1% Realtor in Canada",
    "$100M+ in Career Sales",
    "Certified Luxury Home Specialist",
    "Synterra Realty",
    "Calgary Real Estate Board",
    "REALTOR®",
  ];
  return (
    <section
      className="py-16 lg:py-20 bg-secondary/30 border-y border-border"
      data-testid="section-awards"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 text-center">
        <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground mb-3">
          SPENCER RIVERS
        </div>
        <h2 className="font-serif text-[28px] lg:text-[40px] leading-tight">
          Awards and accolades.
        </h2>
        <div className="mt-10 lg:mt-14 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-8 gap-x-6 items-center">
          {awards.map((a) => (
            <div
              key={a}
              className="border border-border rounded-sm px-4 py-5 lg:py-6 text-center font-display text-[10px] tracking-[0.22em] text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors"
            >
              {a.toUpperCase()}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- A9: Audience Segments grid (8 cards) ----------------------------
function AudienceSegments() {
  const segments = [
    {
      icon: Sparkles,
      title: "Luxury Properties",
      body: "Shop Calgary's finest estates, penthouses, and villas. Private showings, VIP off-market access, and expert negotiation for $1M+ buyers.",
      href: "/work-with/luxury-properties",
    },
    {
      icon: Home,
      title: "First-Time Home Sellers",
      body: "Sell your first home with confidence. We walk you through pricing, timing, prep, and every form so nothing gets missed.",
      href: "/work-with/first-time-home-sellers",
    },
    {
      icon: Heart,
      title: "Empty Nesters",
      body: "Right-size without compromise. Downsize into a luxury condo, lock-and-leave bungalow, or curated build — without losing equity in the move.",
      href: "/work-with/empty-nesters",
    },
    {
      icon: Compass,
      title: "First-Time Home Buyers",
      body: "Buy smart, not fast. We coach you through financing, inspections, and the Calgary submarkets where your budget goes furthest.",
      href: "/work-with/first-time-home-buyers",
    },
    {
      icon: Building2,
      title: "Innercity Properties",
      body: "Upper Mount Royal, Elbow Park, Roxboro, Mission, Beltline — Calgary's most walkable luxury submarkets.",
      href: "/work-with/innercity-properties",
    },
    {
      icon: TrendingUp,
      title: "Move-Ups",
      body: "Trading up to your forever home? We coordinate the sell-and-buy sequence so you're not stuck between two mortgages.",
      href: "/work-with/move-ups",
    },
    {
      icon: Users,
      title: "Family-Focused Properties",
      body: "School zones, cul-de-sacs, oversized lots, basement suites — the Calgary submarkets built for growing families.",
      href: "/work-with/family-focused-properties",
    },
    {
      icon: Briefcase,
      title: "Urban Properties",
      body: "Loft condos, executive townhomes, and walkable inner-city neighbourhoods for professionals and downsizers.",
      href: "/work-with/urban-properties",
    },
  ];
  return (
    <section
      className="py-20 lg:py-32 bg-background"
      data-testid="section-audience"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-3xl mx-auto mb-14 lg:mb-20">
          <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground mb-4">
            WHO WE WORK WITH
          </div>
          <h2 className="font-serif text-[36px] lg:text-[52px] leading-[1.04] tracking-tight">
            We are your team for buying or selling.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {segments.map(({ icon: Icon, title, body, href }) => (
            <Link key={title} href={href} className="group block border border-border rounded-sm p-7 lg:p-8 bg-card hover:border-foreground/40 transition-colors"
                data-testid={`card-segment-${title.toLowerCase().replace(/\s/g, "-")}`}>
                <Icon className="w-6 h-6 text-foreground" strokeWidth={1.4} />
                <h3 className="mt-5 font-serif text-[20px] leading-tight">
                  {title}
                </h3>
                <p className="mt-3 text-[13px] text-muted-foreground leading-relaxed">
                  {body}
                </p>
                <div className="mt-6 inline-flex items-center gap-2 font-display text-[10px] tracking-[0.22em] text-foreground group-hover:gap-3 transition-all">
                  LEARN MORE
                  <ArrowRight className="w-3 h-3" strokeWidth={1.8} />
                </div>
              
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- A10: 15-neighbourhood name grid (SEO meat) ----------------------
function NeighbourhoodLinkGrid() {
  const nbhds = [
    { name: "Altadore", slug: "altadore" },
    { name: "Aspen Woods", slug: "aspen-woods" },
    { name: "Bearspaw", slug: "bearspaw" },
    { name: "Beltline", slug: "beltline" },
    { name: "Bel-Aire", slug: "bel-aire" },
    { name: "Britannia", slug: "britannia" },
    { name: "Edgemont", slug: "edgemont" },
    { name: "Elbow Park", slug: "elbow-park" },
    { name: "Evanston", slug: "evanston" },
    { name: "Mahogany", slug: "mahogany" },
    { name: "McKenzie Lake", slug: "mckenzie-lake" },
    { name: "Rosedale", slug: "rosedale" },
    { name: "Roxboro", slug: "roxboro" },
    { name: "Springbank Hill", slug: "springbank-hill" },
    { name: "Upper Mount Royal", slug: "upper-mount-royal" },
  ];
  return (
    <section
      className="py-20 lg:py-28 bg-background"
      data-testid="section-nbhd-grid"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="max-w-3xl mb-12 lg:mb-16">
          <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground mb-4">
            CALGARY NEIGHBOURHOOD EXPERT
          </div>
          <h2 className="font-serif text-[32px] lg:text-[48px] leading-[1.05] tracking-tight">
            Some of Calgary's best neighbourhoods.
          </h2>
          <p className="mt-6 text-[15px] text-muted-foreground leading-relaxed">
            Find local expertise and discover each neighbourhood's dynamic
            market.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border">
          {nbhds.map((n) => (
            <Link key={n.slug} href={`/neighbourhoods/${n.slug}`} className="group flex items-center justify-between px-6 py-5 lg:py-6 bg-background hover:bg-secondary/40 transition-colors"
                data-testid={`link-nbhd-${n.slug}`}>
                <span className="font-serif text-[20px] lg:text-[22px]">
                  {n.name}
                </span>
                <ArrowRight
                  className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all"
                  strokeWidth={1.4}
                />
              
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/neighbourhoods" className="inline-flex items-center gap-2 font-display text-[11px] tracking-[0.22em] text-foreground hover:gap-3 transition-all"
              data-testid="link-view-all-nbhds">
              VIEW ALL AREAS
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.6} />
            
          </Link>
        </div>
      </div>
    </section>
  );
}

// --- A11: Luxury Market Overview / Resources -------------------------
function LuxuryMarketOverview() {
  const resources = [
    {
      title: "Market Condition Updates",
      body: "Current Calgary trends, inventory levels, and the price moves shaping each prestige submarket.",
    },
    {
      title: "Stress-Free Selling Guide",
      body: "Step-by-step process from pre-list prep through closing — every detail Spencer handles for you.",
    },
    {
      title: "Neighbourhood Market Analysis",
      body: "Area-specific insights: which streets are selling, which are sitting, and why.",
    },
    {
      title: "Buyer's Market Insight",
      body: "An honest read on when and where today's buyers have leverage in the Calgary market.",
    },
  ];
  return (
    <section
      className="py-20 lg:py-32 bg-secondary/30 border-y border-border"
      data-testid="section-market-overview"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-3xl mx-auto mb-14 lg:mb-20">
          <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground mb-4">
            CALGARY REAL ESTATE RESOURCES
          </div>
          <h2 className="font-serif text-[36px] lg:text-[56px] leading-[1.04] tracking-tight">
            Luxury market overview.
          </h2>
          <p className="mt-6 text-[15px] lg:text-[17px] text-muted-foreground leading-relaxed">
            Calgary's luxury market moves on its own clock — different
            inventory cycles, different buyer pools, different pricing logic.
            Here's how to read it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {resources.map((r) => (
            <div
              key={r.title}
              className="border border-border rounded-sm p-7 bg-background"
            >
              <h3 className="font-serif text-[20px] leading-tight">{r.title}</h3>
              <p className="mt-3 text-[13px] text-muted-foreground leading-relaxed">
                {r.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 lg:mt-20 flex flex-wrap justify-center gap-4">
          <Link href="/mls" className="inline-flex items-center gap-2 px-6 h-12 bg-foreground text-background font-display text-[11px] tracking-[0.22em]"
              data-testid="link-vip-listings">
              ACCESS VIP LISTINGS
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.6} />
            
          </Link>
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 h-12 border border-foreground font-display text-[11px] tracking-[0.22em]"
              data-testid="link-off-market">
              OFF-MARKET LISTINGS
            
          </Link>
          <Link href="/home-evaluation" className="inline-flex items-center gap-2 px-6 h-12 border border-foreground font-display text-[11px] tracking-[0.22em]"
              data-testid="link-custom-insight">
              GET CUSTOM MARKET INSIGHT
            
          </Link>
        </div>
      </div>
    </section>
  );
}

// --- A12: Instagram Feed strip ---------------------------------------
interface InstagramPost {
  image: string;
  permalink: string;
  caption: string;
}

function InstagramFeed() {
  // Real posts from @riversrealtor, via /api/public/instagram (which
  // proxies the WP site's Smash Balloon cache — see server/routes.ts).
  // Server-prefetched, so the tiles are in the SSR HTML. If the feed is
  // ever empty (endpoint down, no posts), the section renders nothing —
  // better no strip than stock photos pretending to be Instagram.
  const feed = useQuery<InstagramPost[]>({
    queryKey: ["/api/public/instagram"],
  });
  const posts = (feed.data ?? []).filter((p) => p.image && p.permalink).slice(0, 8);
  if (posts.length === 0) return null;
  return (
    <section
      className="py-20 lg:py-28 bg-background"
      data-testid="section-instagram"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="flex items-end justify-between gap-6 mb-10 lg:mb-14 flex-wrap">
          <div>
            <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground mb-3">
              @RIVERSREALTOR
            </div>
            <h2 className="font-serif text-[30px] lg:text-[44px] leading-[1.08] tracking-tight">
              Follow Spencer on Instagram.
            </h2>
          </div>
          <a
            href="https://instagram.com/riversrealtor"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 h-11 bg-foreground text-background font-display text-[11px] tracking-[0.22em]"
            data-testid="link-ig-follow"
          >
            <Instagram className="w-4 h-4" strokeWidth={1.6} />
            FOLLOW SPENCER
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 lg:gap-3">
          {posts.map((post, i) => (
            <a
              key={post.permalink}
              href={post.permalink}
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-square overflow-hidden rounded-sm bg-secondary"
              data-testid={`ig-tile-${i}`}
            >
              <img
                src={post.image}
                alt={post.caption ? post.caption.slice(0, 100) : "Instagram post by @riversrealtor"}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <Instagram
                  className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  strokeWidth={1.6}
                />
              </div>
            </a>
          ))}
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
      <RecentSales />
      <AuthorityBlock />
      <NoFluffProcess />
      <StatsBand stats={stats.data} />
      <FeaturedListings
        listings={featured.data ?? []}
        loading={featured.isLoading}
      />
      <NeighbourhoodPicker neighbourhoods={neighbourhoods.data ?? []} />
      <NeighbourhoodLinkGrid />
      <CalgaryZones />
      <VideoBlock />
      <BigStatsBand />
      <BuyerSellerTabs />
      <WhyUs />
      <AudienceSegments />
      <AwardsStrip />
      <LuxuryMarketOverview />
      <BlogTeaser posts={blog.data ?? []} />
      <Testimonials items={testimonials.data ?? []} />
      <InstagramFeed />
      <ContactCTA />
    </PublicLayout>
  );
}
