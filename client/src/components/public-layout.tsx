import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Logo } from "@/components/logo";
import { useTheme } from "@/components/theme-provider";
import { Menu, X, Sun, Moon, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SPENCER_PHONE, SPENCER_PHONE_HREF } from "@/lib/format";

interface NavItem {
  label: string;
  href: string;
}

const NAV: NavItem[] = [
  { label: "MLS Search", href: "/mls" },
  { label: "Neighbourhoods", href: "/neighbourhoods" },
  { label: "Condos", href: "/condos" },
  { label: "About", href: "/about" },
  { label: "Journal", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

function NavLink({
  item,
  active,
  invert = false,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  invert?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      data-testid={`nav-public-${item.label.toLowerCase().replace(/\s/g, "-")}`}
    >
      <a
        onClick={onClick}
        className={`relative font-display text-[11px] tracking-[0.22em] py-1 transition-opacity ${
          invert ? "text-white" : "text-foreground"
        } ${active ? "opacity-100" : "opacity-65 hover:opacity-100"}`}
        style={{ fontWeight: active ? 600 : 500 }}
      >
        {item.label.toUpperCase()}
        {active && (
          <span
            className={`absolute -bottom-1 left-0 right-0 h-px ${invert ? "bg-white" : "bg-foreground"}`}
          />
        )}
      </a>
    </Link>
  );
}

export function PublicHeader({ transparent = false }: { transparent?: boolean }) {
  const [location] = useLocation();
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const matches = (href: string) => {
    if (href === "/") return location === "/";
    return location === href || location.startsWith(href);
  };

  // The transparent variant is only used over a dark hero — keep header dark
  // text styles when scrolled past or on subpages.
  // Track scroll: when the page has scrolled past the hero, switch the
  // transparent header to the solid styling so the dark text stays legible.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!transparent) return;
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparent]);

  const isOverlay = transparent && !scrolled;
  const baseBg = isOverlay
    ? "bg-transparent"
    : "bg-background/85 backdrop-blur border-b border-border";
  const positioning = transparent ? "fixed top-0 left-0 right-0" : "sticky top-0";

  return (
    <header
      className={`${positioning} z-40 ${baseBg} transition-colors`}
      data-testid="public-header"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 lg:h-20 flex items-center gap-6">
        <Link href="/" data-testid="link-home-logo">
          <a className="flex items-center gap-3 shrink-0">
            <Logo
              layout="row"
              size={36}
              invert={isOverlay}
            />
          </a>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 ml-6">
          {NAV.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={matches(item.href)}
              invert={isOverlay}
            />
          ))}
        </nav>

        <div className="flex-1" />

        <a
          href={SPENCER_PHONE_HREF}
          className={`hidden md:inline-flex items-center gap-2 font-display text-[11px] tracking-[0.18em] ${
            isOverlay ? "text-white" : "text-foreground"
          }`}
          data-testid="link-call-spencer"
        >
          <Phone className="w-3.5 h-3.5" strokeWidth={1.6} />
          {SPENCER_PHONE}
        </a>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className={`rounded-full hidden md:inline-flex ${isOverlay ? "text-white hover:bg-white/10 hover:text-white" : ""}`}
          aria-label="Toggle theme"
          data-testid="button-public-theme-toggle"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" strokeWidth={1.6} />
          ) : (
            <Moon className="w-4 h-4" strokeWidth={1.6} />
          )}
        </Button>

        <button
          className={`lg:hidden p-2 ${isOverlay ? "text-white" : "text-foreground"}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          data-testid="button-mobile-menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="px-6 py-5 flex flex-col gap-4">
            {NAV.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={matches(item.href)}
                onClick={() => setMobileOpen(false)}
              />
            ))}
            <a
              href={SPENCER_PHONE_HREF}
              className="font-display text-[11px] tracking-[0.18em] text-foreground inline-flex items-center gap-2 pt-3 border-t border-border"
            >
              <Phone className="w-3.5 h-3.5" strokeWidth={1.6} />
              {SPENCER_PHONE}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer
      className="bg-black text-white"
      data-testid="public-footer"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <Logo layout="stack" size={48} invert />
          <p className="mt-6 max-w-md text-sm leading-relaxed text-white/65">
            Spencer Rivers represents buyers and sellers in Calgary's
            most established luxury communities — Springbank Hill, Aspen
            Woods, Upper Mount Royal, Elbow Park, Britannia, and Bel-Aire.
          </p>
          <div className="mt-8 flex flex-col gap-2 text-[13px] text-white/75">
            <a
              href={SPENCER_PHONE_HREF}
              className="hover:text-white transition-colors inline-flex items-center gap-2"
              data-testid="footer-phone"
            >
              <Phone className="w-3.5 h-3.5" strokeWidth={1.6} />
              {SPENCER_PHONE}
            </a>
            <a
              href="mailto:spencer@riversrealestate.ca"
              className="hover:text-white transition-colors"
              data-testid="footer-email"
            >
              spencer@riversrealestate.ca
            </a>
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="font-display text-[10px] tracking-[0.22em] text-white/55 mb-4">
            EXPLORE
          </div>
          <ul className="space-y-2.5 text-[13px] text-white/75">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href}>
                  <a className="hover:text-white transition-colors">{n.label}</a>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <div className="font-display text-[10px] tracking-[0.22em] text-white/55 mb-4">
            BROKERAGE
          </div>
          <div className="text-[13px] text-white/75 leading-relaxed">
            Synterra Realty
            <br />
            Calgary, Alberta
            <br />
            <span className="text-white/55">REALTOR® | CLHMS, CNE, CIPS, CCS, LLS</span>
            <br />
            <span className="text-white/55">Million Dollar Guild</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[11px] text-white/45 font-display tracking-[0.14em]">
          <div>© {new Date().getFullYear()} RIVERS REAL ESTATE · ALL RIGHTS RESERVED</div>
          <div className="flex gap-6">
            <span>LUXURYHOMESCALGARY.CA</span>
            <Link href="/admin">
              <a
                className="hover:text-white/80 transition-colors"
                data-testid="footer-link-admin"
              >
                AGENT LOGIN
              </a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout({
  children,
  transparentHeader = false,
  fullBleed = false,
}: {
  children: ReactNode;
  transparentHeader?: boolean;
  fullBleed?: boolean;
}) {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col">
      <PublicHeader transparent={transparentHeader} />
      <main
        className={fullBleed ? "flex-1 w-full" : "flex-1"}
        data-testid="public-main"
      >
        {children}
      </main>
      {!fullBleed && <PublicFooter />}
    </div>
  );
}
