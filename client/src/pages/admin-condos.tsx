// /admin/condos — self-serve CMS for the marquee condo pages.
//
// Master/detail layout: list of all condos on the left (scrollable), an edit
// form on the right. Save persists to the database via the admin API; the
// public condo pages re-fetch on next view. No code commits or deploys
// needed for content edits — the database is the source of truth.
//
// Hero image upload posts the file as a base64 data URL to
// POST /api/admin/condos/:slug/hero. Server saves it to the Fly persistent
// volume and updates the heroImage path. UI cache-busts via ?v=timestamp.
import { useEffect, useState, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { ChevronLeft, Save, Plus, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, apiUrl } from "@/lib/queryClient";

interface AdminCondo {
  slug: string;
  name: string;
  tagline: string;
  intro: string[];
  residencesCopy: string[];
  architecturalCopy: string[];
  locationCopy: string[];
  diningCopy: string[];
  shoppingCopy: string[];
  communityCopy: string[];
  schoolsCopy: string[];
  amenities: string[];
  address: string;
  addressAliases: string | null;
  neighbourhoodSlug: string;
  neighbourhood: string;
  quadrant: string;
  units: number | null;
  stories: number | null;
  builtIn: number | null;
  developer: string | null;
  architect: string | null;
  lat: number;
  lng: number;
  heroImage: string;
  sortOrder: number;
  featured: boolean;
}

// Helper: text area for a string[] copy field — one paragraph per blank-line block.
function CopyTextarea({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  rows?: number;
  placeholder?: string;
}) {
  const text = (value || []).join("\n\n");
  return (
    <div>
      <Label className="text-xs font-display tracking-[0.18em] text-muted-foreground">
        {label.toUpperCase()}
      </Label>
      <Textarea
        rows={rows}
        value={text}
        placeholder={placeholder ?? "One paragraph per blank line"}
        onChange={(e) => {
          const paragraphs = e.target.value
            .split(/\n\s*\n/)
            .map((p) => p.trim())
            .filter(Boolean);
          onChange(paragraphs);
        }}
        className="mt-1 font-serif"
      />
      <div className="mt-1 text-[10px] text-muted-foreground">
        {value?.length ?? 0} paragraph{(value?.length ?? 0) === 1 ? "" : "s"} · separate paragraphs with a blank line
      </div>
    </div>
  );
}

// Helper: comma-separated string[] for amenities.
function AmenitiesEditor({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const text = (value || []).join("\n");
  return (
    <div>
      <Label className="text-xs font-display tracking-[0.18em] text-muted-foreground">AMENITIES</Label>
      <Textarea
        rows={6}
        value={text}
        placeholder="One amenity per line"
        onChange={(e) =>
          onChange(
            e.target.value
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
          )
        }
        className="mt-1 text-sm"
      />
      <div className="mt-1 text-[10px] text-muted-foreground">{value?.length ?? 0} amenities · one per line</div>
    </div>
  );
}

export default function AdminCondosPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState<AdminCondo | null>(null);
  const [filter, setFilter] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const { data: condos, isLoading } = useQuery<AdminCondo[]>({
    queryKey: ["/api/admin/condos"],
  });

  const { data: selected } = useQuery<AdminCondo>({
    queryKey: ["/api/admin/condos", selectedSlug],
    enabled: !!selectedSlug,
  });

  // When the selected condo loads, snapshot it as the editable draft.
  useEffect(() => {
    if (selected) setDraft(selected);
  }, [selected]);

  const saveMutation = useMutation({
    mutationFn: async (patch: Partial<AdminCondo>) => {
      const r = await apiRequest("PATCH", `/api/admin/condos/${selectedSlug}`, patch);
      return r.json();
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["/api/admin/condos", selectedSlug], updated);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/condos"] });
      // Also invalidate public caches so public pages refetch with new content
      queryClient.invalidateQueries({ queryKey: ["/api/public/condos"] });
      toast({ title: "Saved", description: "Condo updated. Live in seconds." });
    },
    onError: (e: any) =>
      toast({ title: "Save failed", description: e?.message ?? "Try again", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const r = await apiRequest("DELETE", `/api/admin/condos/${selectedSlug}`);
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/condos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/public/condos"] });
      setSelectedSlug(null);
      setDraft(null);
      toast({ title: "Deleted", description: "Condo removed from site." });
    },
    onError: (e: any) =>
      toast({ title: "Delete failed", description: e?.message ?? "Try again", variant: "destructive" }),
  });

  const filteredCondos = useMemo(() => {
    if (!condos) return [];
    const q = filter.trim().toLowerCase();
    if (!q) return condos;
    return condos.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.neighbourhood.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q),
    );
  }, [condos, filter]);

  const handleHeroUpload = async (file: File) => {
    if (!selectedSlug || !file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Too large", description: "Max 10 MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const r = await apiRequest("POST", `/api/admin/condos/${selectedSlug}/hero`, { dataUrl });
      const json = await r.json();
      // Refresh both the detail view and the list so thumbnails refresh
      queryClient.setQueryData(["/api/admin/condos", selectedSlug], json.condo);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/condos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/public/condos"] });
      setDraft(json.condo);
      toast({ title: "Hero updated", description: "Live in seconds." });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e?.message ?? "Try again", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  // Resolve hero image path for preview — uploads use absolute API origin
  const heroPreviewSrc = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    if (path.startsWith("/uploads/")) return apiUrl(path);
    return path; // /condo-heroes/* is served from client/public
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 h-14 flex items-center gap-4">
          <Link href="/admin/dashboard">
            <a className="inline-flex items-center gap-1.5 text-[11px] font-display tracking-[0.18em] text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-3.5 h-3.5" />
              DASHBOARD
            </a>
          </Link>
          <div className="font-display text-[11px] tracking-[0.22em]">CONDO CMS</div>
          <div className="flex-1" />
          <div className="text-[11px] font-display tracking-[0.16em] text-muted-foreground">
            {condos?.length ?? "—"} BUILDINGS
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-0">
        {/* Left: condo list */}
        <aside className="border-r border-border bg-secondary/20 lg:h-[calc(100dvh-3.5rem)] lg:overflow-auto">
          <div className="p-4 sticky top-0 bg-secondary/40 backdrop-blur border-b border-border">
            <Input
              placeholder="Search condos…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm"
            />
          </div>
          {isLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : (
            <ul>
              {filteredCondos.map((c) => {
                const isActive = c.slug === selectedSlug;
                return (
                  <li key={c.slug}>
                    <button
                      onClick={() => setSelectedSlug(c.slug)}
                      className={`w-full text-left px-4 py-3 border-b border-border flex items-center gap-3 transition-colors ${
                        isActive ? "bg-foreground text-background" : "hover:bg-secondary/60"
                      }`}
                    >
                      <div className="w-12 h-9 bg-secondary rounded-sm overflow-hidden shrink-0">
                        <img
                          src={heroPreviewSrc(c.heroImage)}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => ((e.target as HTMLImageElement).style.opacity = "0.2")}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-serif text-[15px] truncate ${
                            isActive ? "" : "text-foreground"
                          }`}
                          style={{ letterSpacing: "-0.005em" }}
                        >
                          {c.name}
                        </div>
                        <div
                          className={`text-[10px] font-display tracking-[0.14em] truncate ${
                            isActive ? "text-background/70" : "text-muted-foreground"
                          }`}
                        >
                          {c.neighbourhood.toUpperCase()}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Right: edit form */}
        <main className="lg:h-[calc(100dvh-3.5rem)] lg:overflow-auto">
          {!draft ? (
            <div className="h-full flex items-center justify-center text-center px-6 py-32">
              <div>
                <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground/40" strokeWidth={1.4} />
                <div className="mt-4 font-serif text-2xl">Select a condo to edit</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Search or pick from the list on the left. Changes save to the live site within seconds.
                </div>
              </div>
            </div>
          ) : (
            <form
              className="max-w-[900px] mx-auto p-6 lg:p-10 space-y-8"
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate(draft);
              }}
            >
              {/* Top: title + save */}
              <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-display text-[10px] tracking-[0.22em] text-muted-foreground">
                    EDITING · {draft.slug}
                  </div>
                  <h1
                    className="font-serif text-3xl mt-1"
                    style={{ letterSpacing: "-0.01em" }}
                  >
                    {draft.name}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/condos/${draft.slug}`}>
                    <a
                      target="_blank"
                      className="text-[11px] font-display tracking-[0.18em] text-muted-foreground hover:text-foreground border border-border rounded-sm px-3 py-2"
                    >
                      VIEW LIVE
                    </a>
                  </Link>
                  <Button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="font-display tracking-[0.18em] text-[11px]"
                  >
                    <Save className="w-3.5 h-3.5 mr-2" />
                    {saveMutation.isPending ? "SAVING…" : "SAVE CHANGES"}
                  </Button>
                </div>
              </div>

              {/* Hero image */}
              <section className="border border-border rounded-sm p-5 bg-secondary/20">
                <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground mb-3">
                  HERO IMAGE
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4">
                  <div className="aspect-[4/3] bg-secondary rounded-sm overflow-hidden border border-border">
                    {draft.heroImage ? (
                      <img
                        src={heroPreviewSrc(draft.heroImage)}
                        alt={`${draft.name} hero`}
                        className="w-full h-full object-cover"
                        onError={(e) => ((e.target as HTMLImageElement).style.opacity = "0.2")}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        No hero
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <input
                      ref={fileInput}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleHeroUpload(f);
                        e.target.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => fileInput.current?.click()}
                      disabled={uploading}
                      className="w-full font-display tracking-[0.18em] text-[11px]"
                    >
                      <Upload className="w-3.5 h-3.5 mr-2" />
                      {uploading ? "UPLOADING…" : "UPLOAD NEW HERO"}
                    </Button>
                    <div className="text-[11px] text-muted-foreground leading-relaxed">
                      PNG, JPG, or WebP up to 10 MB. The new image goes live everywhere on the site within a few seconds — no save required.
                    </div>
                    <div>
                      <Label className="text-[10px] font-display tracking-[0.18em] text-muted-foreground">
                        OR PASTE A URL
                      </Label>
                      <Input
                        value={draft.heroImage || ""}
                        onChange={(e) => setDraft({ ...draft, heroImage: e.target.value })}
                        placeholder="https://… or /uploads/condo-heroes/…"
                        className="mt-1 text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Identity */}
              <section className="space-y-4">
                <SectionHeader>Building identity</SectionHeader>
                <Field label="Name">
                  <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                </Field>
                <Field label="Tagline">
                  <Input
                    value={draft.tagline}
                    onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
                  />
                </Field>
              </section>

              {/* Address + neighbourhood */}
              <section className="space-y-4">
                <SectionHeader>Location</SectionHeader>
                <Field label="Address">
                  <Input
                    value={draft.address}
                    onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                  />
                </Field>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Neighbourhood (display)">
                    <Input
                      value={draft.neighbourhood}
                      onChange={(e) => setDraft({ ...draft, neighbourhood: e.target.value })}
                    />
                  </Field>
                  <Field label="Neighbourhood slug">
                    <Input
                      value={draft.neighbourhoodSlug}
                      onChange={(e) =>
                        setDraft({ ...draft, neighbourhoodSlug: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Latitude">
                    <Input
                      type="number"
                      step="0.0001"
                      value={draft.lat ?? ""}
                      onChange={(e) =>
                        setDraft({ ...draft, lat: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </Field>
                  <Field label="Longitude">
                    <Input
                      type="number"
                      step="0.0001"
                      value={draft.lng ?? ""}
                      onChange={(e) =>
                        setDraft({ ...draft, lng: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </Field>
                  <Field label="Quadrant">
                    <Input
                      value={draft.quadrant}
                      onChange={(e) => setDraft({ ...draft, quadrant: e.target.value })}
                    />
                  </Field>
                </div>
                <Field label="Address aliases (comma-separated additional street numbers)">
                  <Input
                    value={draft.addressAliases ?? ""}
                    placeholder="e.g. 137 (for The River paired addresses)"
                    onChange={(e) =>
                      setDraft({ ...draft, addressAliases: e.target.value || null })
                    }
                  />
                </Field>
              </section>

              {/* Stats */}
              <section className="space-y-4">
                <SectionHeader>Building stats</SectionHeader>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Field label="Units">
                    <Input
                      type="number"
                      value={draft.units ?? ""}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          units: e.target.value ? parseInt(e.target.value, 10) : null,
                        })
                      }
                    />
                  </Field>
                  <Field label="Stories">
                    <Input
                      type="number"
                      value={draft.stories ?? ""}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          stories: e.target.value ? parseInt(e.target.value, 10) : null,
                        })
                      }
                    />
                  </Field>
                  <Field label="Year built">
                    <Input
                      type="number"
                      value={draft.builtIn ?? ""}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          builtIn: e.target.value ? parseInt(e.target.value, 10) : null,
                        })
                      }
                    />
                  </Field>
                  <Field label="Developer">
                    <Input
                      value={draft.developer ?? ""}
                      onChange={(e) =>
                        setDraft({ ...draft, developer: e.target.value || null })
                      }
                    />
                  </Field>
                  <Field label="Architect">
                    <Input
                      value={draft.architect ?? ""}
                      onChange={(e) =>
                        setDraft({ ...draft, architect: e.target.value || null })
                      }
                    />
                  </Field>
                  <Field label="Sort order">
                    <Input
                      type="number"
                      value={draft.sortOrder}
                      onChange={(e) =>
                        setDraft({ ...draft, sortOrder: parseInt(e.target.value, 10) || 0 })
                      }
                    />
                  </Field>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.featured}
                    onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
                  />
                  <span>Featured (appears first on /condos)</span>
                </label>
              </section>

              {/* Long-form copy */}
              <section className="space-y-4">
                <SectionHeader>Editorial copy</SectionHeader>
                <CopyTextarea
                  label="Intro"
                  value={draft.intro}
                  rows={4}
                  onChange={(v) => setDraft({ ...draft, intro: v })}
                  placeholder="Opening 1-2 paragraphs that introduce the building."
                />
                <CopyTextarea
                  label="Residences & finishes"
                  value={draft.residencesCopy}
                  rows={4}
                  onChange={(v) => setDraft({ ...draft, residencesCopy: v })}
                />
                <CopyTextarea
                  label="Architecture"
                  value={draft.architecturalCopy}
                  rows={4}
                  onChange={(v) => setDraft({ ...draft, architecturalCopy: v })}
                />
                <CopyTextarea
                  label="Prime location & transit access"
                  value={draft.locationCopy}
                  rows={4}
                  onChange={(v) => setDraft({ ...draft, locationCopy: v })}
                />
                <CopyTextarea
                  label="Dining & entertainment"
                  value={draft.diningCopy}
                  rows={4}
                  onChange={(v) => setDraft({ ...draft, diningCopy: v })}
                />
                <CopyTextarea
                  label="Shopping & daily essentials"
                  value={draft.shoppingCopy}
                  rows={4}
                  onChange={(v) => setDraft({ ...draft, shoppingCopy: v })}
                />
                <CopyTextarea
                  label="Community & culture"
                  value={draft.communityCopy}
                  rows={4}
                  onChange={(v) => setDraft({ ...draft, communityCopy: v })}
                />
                <CopyTextarea
                  label="Schools & education"
                  value={draft.schoolsCopy}
                  rows={4}
                  onChange={(v) => setDraft({ ...draft, schoolsCopy: v })}
                />
              </section>

              {/* Amenities */}
              <section>
                <SectionHeader>Amenities</SectionHeader>
                <AmenitiesEditor
                  value={draft.amenities}
                  onChange={(v) => setDraft({ ...draft, amenities: v })}
                />
              </section>

              {/* Footer: save + delete */}
              <div className="flex items-center justify-between border-t border-border pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (!confirm(`Delete "${draft.name}" permanently? This removes it from the live site.`)) return;
                    deleteMutation.mutate();
                  }}
                  disabled={deleteMutation.isPending}
                  className="font-display tracking-[0.18em] text-[11px] text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  {deleteMutation.isPending ? "DELETING…" : "DELETE CONDO"}
                </Button>
                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="font-display tracking-[0.18em] text-[11px]"
                >
                  <Save className="w-3.5 h-3.5 mr-2" />
                  {saveMutation.isPending ? "SAVING…" : "SAVE CHANGES"}
                </Button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground border-b border-border pb-2">
      {String(children).toUpperCase()}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-display tracking-[0.18em] text-muted-foreground">
        {label.toUpperCase()}
      </Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
