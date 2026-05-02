import { useRoute, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  ExternalLink,
  Save,
  Eye,
  Users,
  Image as ImageIcon,
  X,
  Plus,
  Copy,
  Check,
  Trash2,
  Loader2,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PublicListing } from "@/lib/types";
import NotFound from "./not-found";

type ListingDraft = {
  id: string;
  slug: string;
  title: string;
  address: string;
  neighbourhood: string;
  city: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  lotSize: string | null;
  yearBuilt: number;
  type: string;
  status: string;
  description: string;
  features: string[];
  heroImage: string;
  gallery: string[];
  lat: number;
  lng: number;
};

const NEIGHBOURHOODS = [
  "Springbank Hill",
  "Aspen Woods",
  "Upper Mount Royal",
  "Elbow Park",
  "Britannia",
  "Bel-Aire",
];

// Approximate centroid for each luxury neighbourhood — used when creating a new listing
const NEIGHBOURHOOD_COORDS: Record<string, { lat: number; lng: number }> = {
  "Springbank Hill": { lat: 51.0383, lng: -114.2076 },
  "Aspen Woods": { lat: 51.041, lng: -114.196 },
  "Upper Mount Royal": { lat: 51.034, lng: -114.0865 },
  "Elbow Park": { lat: 51.026, lng: -114.085 },
  "Britannia": { lat: 51.013, lng: -114.083 },
  "Bel-Aire": { lat: 51.0, lng: -114.1015 },
};

function emptyDraft(): ListingDraft {
  return {
    id: "",
    slug: "",
    title: "",
    address: "",
    neighbourhood: "Springbank Hill",
    city: "Calgary, AB",
    price: 0,
    beds: 0,
    baths: 0,
    sqft: 0,
    lotSize: null,
    yearBuilt: new Date().getFullYear(),
    type: "Single Family",
    status: "draft",
    description: "",
    features: [],
    heroImage:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=1000&fit=crop",
    gallery: [],
    lat: NEIGHBOURHOOD_COORDS["Springbank Hill"].lat,
    lng: NEIGHBOURHOOD_COORDS["Springbank Hill"].lng,
  };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

export default function ListingEditPage() {
  const [, params] = useRoute("/admin/listings/:id");
  const [, setLocation] = useLocation();
  const id = params?.id ?? "";
  const isNew = id === "new";
  const { toast } = useToast();

  const { data: listing, isLoading, error } = useQuery<PublicListing>({
    queryKey: ["/api/listings", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/listings/${id}`);
      return res.json();
    },
    enabled: !isNew && !!id,
  });

  const [draft, setDraft] = useState<ListingDraft>(emptyDraft);
  const [newFeature, setNewFeature] = useState("");
  const [copied, setCopied] = useState(false);

  // Sync draft when listing arrives
  useEffect(() => {
    if (listing) {
      setDraft({
        id: listing.id,
        slug: listing.slug,
        title: listing.title,
        address: listing.address,
        neighbourhood: listing.neighbourhood,
        city: listing.city,
        price: listing.price,
        beds: listing.beds,
        baths: listing.baths,
        sqft: listing.sqft,
        lotSize: listing.lotSize,
        yearBuilt: listing.yearBuilt,
        type: listing.type,
        status: listing.status,
        description: listing.description,
        features: listing.features || [],
        heroImage: listing.heroImage,
        gallery: listing.gallery || [],
        lat: listing.lat,
        lng: listing.lng,
      });
    }
  }, [listing]);

  const set = <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Build payload — auto-generate slug + id for new listings
      const payload = {
        ...draft,
        slug: draft.slug || slugify(draft.address || draft.title),
        id: isNew ? `l-${Date.now()}` : draft.id,
        features: draft.features,
        gallery: draft.gallery,
      };
      if (isNew) {
        const res = await apiRequest("POST", "/api/listings", payload);
        return res.json();
      } else {
        const res = await apiRequest("PATCH", `/api/listings/${draft.id}`, payload);
        return res.json();
      }
    },
    onSuccess: (saved: PublicListing) => {
      toast({
        title: isNew ? "Listing created" : "Listing saved",
        description: saved.title,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      if (isNew) {
        setLocation(`/admin/listings/${saved.id}`);
      }
    },
    onError: (err: any) => {
      toast({
        title: "Could not save",
        description: err?.message || "Please review the fields and try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/listings/${draft.id}`);
    },
    onSuccess: () => {
      toast({ title: "Listing archived" });
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      setLocation("/admin/listings");
    },
  });

  if (!isNew && error) return <NotFound />;
  if (!isNew && isLoading) {
    return (
      <AppShell pageTitle="LOADING">
        <div className="px-8 py-7">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  const publicUrl = draft.slug ? `luxuryhomescalgary.ca/p/${draft.slug}` : "";

  const handleCopy = () => {
    navigator.clipboard?.writeText(`https://${publicUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const addFeature = () => {
    const v = newFeature.trim();
    if (!v) return;
    set("features", [...draft.features, v]);
    setNewFeature("");
  };

  return (
    <AppShell
      pageTitle={isNew ? "NEW LISTING" : (draft.title || "EDIT LISTING").toUpperCase()}
      pageActions={
        <div className="flex items-center gap-2">
          {!isNew && draft.slug && (
            <Link href={`/p/${draft.slug}`}>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                data-testid="button-preview"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Preview
              </Button>
            </Link>
          )}
          <Button
            size="sm"
            className="rounded-full"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            data-testid="button-save"
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 mr-1.5" />
            )}
            Save
          </Button>
        </div>
      }
    >
      <div className="px-8 py-7 space-y-6 max-w-7xl">
        <Link href="/admin/listings">
          <a className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> All listings
          </a>
        </Link>

        {!isNew && listing && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5">
                <div className="eyebrow">Public URL</div>
                <div className="mt-2 flex items-center gap-2">
                  <code
                    className="flex-1 text-xs bg-secondary px-2.5 py-1.5 rounded text-foreground truncate"
                    data-testid="text-public-url"
                  >
                    {publicUrl || "—"}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={handleCopy}
                    disabled={!publicUrl}
                    data-testid="button-copy-url"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="eyebrow">Total views</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-serif text-2xl tabular-nums">
                    {listing.views.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Eye className="w-3 h-3" /> since publish
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="eyebrow">Status</div>
                <div className="mt-1 flex items-center gap-2">
                  <Badge
                    className={
                      draft.status === "active"
                        ? "bg-foreground text-background border-transparent capitalize"
                        : draft.status === "sold"
                          ? "bg-muted text-muted-foreground border-transparent line-through capitalize"
                          : "bg-secondary text-foreground border-transparent capitalize"
                    }
                  >
                    {draft.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" /> {draft.neighbourhood}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details" data-testid="tab-details">
              Details
            </TabsTrigger>
            <TabsTrigger value="media" data-testid="tab-media">
              Media
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* DETAILS */}
          <TabsContent value="details" className="mt-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <Card className="lg:col-span-2">
                <CardContent className="p-6 space-y-5">
                  <div>
                    <h3 className="font-serif text-lg mb-1" style={{ letterSpacing: "-0.01em" }}>
                      Property details
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      What appears on the public landing page.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="eyebrow">Listing title</Label>
                      <Input
                        value={draft.title}
                        onChange={(e) => set("title", e.target.value)}
                        placeholder="e.g. Aspen Summit"
                        data-testid="input-title"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="eyebrow">Address</Label>
                      <Input
                        value={draft.address}
                        onChange={(e) => {
                          set("address", e.target.value);
                          if (!draft.slug || isNew) {
                            set("slug", slugify(e.target.value));
                          }
                        }}
                        placeholder="120 13th Street SW"
                        data-testid="input-address"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="eyebrow">Neighbourhood</Label>
                      <Select
                        value={draft.neighbourhood}
                        onValueChange={(v) => {
                          set("neighbourhood", v);
                          const c = NEIGHBOURHOOD_COORDS[v];
                          if (c) {
                            set("lat", c.lat);
                            set("lng", c.lng);
                          }
                        }}
                      >
                        <SelectTrigger data-testid="select-neighbourhood">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {NEIGHBOURHOODS.map((n) => (
                            <SelectItem key={n} value={n}>
                              {n}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="eyebrow">City</Label>
                      <Input
                        value={draft.city}
                        onChange={(e) => set("city", e.target.value)}
                        data-testid="input-city"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="eyebrow">Price (CAD)</Label>
                      <Input
                        type="number"
                        value={draft.price || ""}
                        onChange={(e) => set("price", parseInt(e.target.value, 10) || 0)}
                        className="tabular-nums"
                        data-testid="input-price"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="eyebrow">Property type</Label>
                      <Select value={draft.type} onValueChange={(v) => set("type", v)}>
                        <SelectTrigger data-testid="select-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Single Family">Single Family</SelectItem>
                          <SelectItem value="Estate">Estate</SelectItem>
                          <SelectItem value="Condo">Condo</SelectItem>
                          <SelectItem value="Townhouse">Townhouse</SelectItem>
                          <SelectItem value="Acreage">Acreage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="eyebrow">Bedrooms</Label>
                      <Input
                        type="number"
                        value={draft.beds || ""}
                        onChange={(e) => set("beds", parseInt(e.target.value, 10) || 0)}
                        className="tabular-nums"
                        data-testid="input-beds"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="eyebrow">Bathrooms</Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={draft.baths || ""}
                        onChange={(e) => set("baths", parseFloat(e.target.value) || 0)}
                        className="tabular-nums"
                        data-testid="input-baths"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="eyebrow">Square feet</Label>
                      <Input
                        type="number"
                        value={draft.sqft || ""}
                        onChange={(e) => set("sqft", parseInt(e.target.value, 10) || 0)}
                        className="tabular-nums"
                        data-testid="input-sqft"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="eyebrow">Year built</Label>
                      <Input
                        type="number"
                        value={draft.yearBuilt}
                        onChange={(e) =>
                          set("yearBuilt", parseInt(e.target.value, 10) || new Date().getFullYear())
                        }
                        className="tabular-nums"
                        data-testid="input-year"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="eyebrow">Lot size (optional)</Label>
                      <Input
                        value={draft.lotSize ?? ""}
                        onChange={(e) => set("lotSize", e.target.value || null)}
                        placeholder="0.38 acres"
                        data-testid="input-lot"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="eyebrow">Description</Label>
                    <Textarea
                      value={draft.description}
                      onChange={(e) => set("description", e.target.value)}
                      placeholder="Direct, specific, no filler. What makes this property worth a private showing?"
                      rows={6}
                      data-testid="input-description"
                    />
                    <p className="text-[11px] text-muted-foreground italic">
                      Keep it specific. Avoid "stunning," "nestled," "must-see," and other empty
                      filler. Lead with what's unique.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="eyebrow">Highlight features</Label>
                    <div className="flex flex-wrap gap-2">
                      {draft.features.map((f, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="rounded-full pl-3 pr-1.5 py-1 bg-secondary text-foreground border-transparent"
                        >
                          {f}
                          <button
                            className="ml-1.5 text-muted-foreground hover:text-foreground"
                            onClick={() =>
                              set(
                                "features",
                                draft.features.filter((_, idx) => idx !== i),
                              )
                            }
                            data-testid={`button-remove-feature-${i}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addFeature();
                          }
                        }}
                        placeholder="e.g. Glenmore Reservoir views"
                        className="flex-1 text-sm"
                        data-testid="input-new-feature"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={addFeature}
                        data-testid="button-add-feature"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sidebar */}
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-5 space-y-4">
                    <div>
                      <h3 className="font-serif text-base mb-3">Publishing</h3>
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label className="eyebrow">Status</Label>
                          <Select value={draft.status} onValueChange={(v) => set("status", v)}>
                            <SelectTrigger data-testid="select-status-detail">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="sold">Sold</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="eyebrow">URL slug</Label>
                          <Input
                            value={draft.slug}
                            onChange={(e) => set("slug", slugify(e.target.value))}
                            placeholder="120-13th-street-sw"
                            className="font-mono text-xs"
                            data-testid="input-slug"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="eyebrow mb-2">Map coordinates</div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        step="0.0001"
                        value={draft.lat}
                        onChange={(e) => set("lat", parseFloat(e.target.value) || 0)}
                        className="font-mono text-xs tabular-nums"
                        data-testid="input-lat"
                      />
                      <Input
                        type="number"
                        step="0.0001"
                        value={draft.lng}
                        onChange={(e) => set("lng", parseFloat(e.target.value) || 0)}
                        className="font-mono text-xs tabular-nums"
                        data-testid="input-lng"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      Auto-set from neighbourhood. Override for precise placement on the public map.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* MEDIA */}
          <TabsContent value="media" className="mt-5">
            <Card>
              <CardContent className="p-6 space-y-5">
                <div>
                  <h3 className="font-serif text-lg" style={{ letterSpacing: "-0.01em" }}>
                    Photography
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Hero image is the first frame visitors see. Add gallery photos by URL below.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="eyebrow">Hero image URL</Label>
                  <Input
                    value={draft.heroImage}
                    onChange={(e) => set("heroImage", e.target.value)}
                    placeholder="https://..."
                    className="font-mono text-xs"
                    data-testid="input-hero"
                  />
                  {draft.heroImage && (
                    <div className="aspect-[16/9] rounded-lg overflow-hidden bg-secondary border border-border">
                      <img
                        src={draft.heroImage}
                        alt=""
                        className="w-full h-full object-cover"
                        data-testid="img-hero-preview"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="eyebrow">Gallery</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {draft.gallery.map((g, i) => (
                      <div
                        key={i}
                        className="aspect-[4/3] rounded-lg overflow-hidden bg-secondary relative group"
                      >
                        <img src={g} alt="" className="w-full h-full object-cover" />
                        <button
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-background/90 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() =>
                            set(
                              "gallery",
                              draft.gallery.filter((_, idx) => idx !== i),
                            )
                          }
                          data-testid={`button-remove-gallery-${i}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      className="aspect-[4/3] rounded-lg border-2 border-dashed border-border hover:border-foreground/40 hover:bg-secondary/40 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
                      onClick={() => {
                        const url = window.prompt("Image URL:");
                        if (url) set("gallery", [...draft.gallery, url]);
                      }}
                      data-testid="button-add-photo"
                    >
                      <ImageIcon className="w-6 h-6" />
                      <span className="text-xs font-medium">Add photo</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SETTINGS */}
          <TabsContent value="settings" className="mt-5">
            <Card>
              <CardContent className="p-6 space-y-4 max-w-xl">
                <h3 className="font-serif text-lg" style={{ letterSpacing: "-0.01em" }}>
                  Listing settings
                </h3>
                <p className="text-sm text-muted-foreground">
                  Inquiries from this property route to spencer@riversrealestate.ca and create a
                  lead in your pipeline.
                </p>
                {!isNew && (
                  <div className="pt-3 border-t border-border">
                    <Label className="eyebrow">Danger zone</Label>
                    <p className="text-xs text-muted-foreground mt-1 mb-3">
                      Archiving removes the listing from the public site and your dashboard. This
                      cannot be undone.
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (window.confirm(`Archive "${draft.title}"? This cannot be undone.`)) {
                          deleteMutation.mutate();
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      data-testid="button-archive"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Archive listing
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
