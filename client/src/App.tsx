import { Switch, Route, Router, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/lib/auth";
import { useEffect, useRef } from "react";

// ---- Follow Up Boss pixel: SPA pageview tracker ----------------------------
// The initial pageview fires from the snippet in index.html. This hook fires
// a fresh pageview every time wouter's location changes, so deep navigations
// (e.g. /condos/the-river, /mls/A2305467) each register as their own event
// in FUB rather than the homepage being the only thing FUB ever sees.
declare global {
  interface Window {
    widgetTracker?: (...args: any[]) => void;
  }
}
function usePageviewTracker() {
  const [location] = useLocation();
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      // Skip — index.html's snippet already fired the first pageview.
      firstRender.current = false;
      return;
    }
    if (typeof window === "undefined" || !window.widgetTracker) return;
    window.widgetTracker("send", "pageview");
  }, [location]);
}

// Public pages
import HomePage from "@/pages/home";
import MlsSearchPage from "@/pages/mls-search";
import MlsDetailPage from "@/pages/mls-detail";
import NeighbourhoodsIndexPage from "@/pages/neighbourhoods-index";
import NeighbourhoodDetailPage from "@/pages/neighbourhood-detail";
import CondosIndexPage from "@/pages/condos-index";
import CondoDetailPage from "@/pages/condo-detail";
import AboutPage from "@/pages/about";
import BlogIndexPage from "@/pages/blog-index";
import BlogDetailPage from "@/pages/blog-detail";
import ContactPage from "@/pages/contact";
import HomeEvaluationPage from "@/pages/home-evaluation";
import WorkWithDetailPage, { WorkWithIndexPage } from "@/pages/work-with";
import AssignmentsPage from "@/pages/assignments";

// Admin (existing dashboard) pages — mounted under /admin/*
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth";
import DashboardPage from "@/pages/dashboard";
import ListingsPage from "@/pages/listings";
import ListingEditPage from "@/pages/listing-edit";
import ListingPublicPage from "@/pages/listing-public";
import LeadsPage from "@/pages/leads";
import MlsSyncPage from "@/pages/mls-sync";
import AdminCalendarPage from "@/pages/admin-calendar";
import AdminMarketingPage from "@/pages/admin-marketing";
import AdminAnalyticsPage from "@/pages/admin-analytics";
import AdminSavedSearchesPage from "@/pages/admin-saved-searches";
import AdminCondosPage from "@/pages/admin-condos";
import AdminBlogPage from "@/pages/admin-blog";
import AdminNeighbourhoodsPage from "@/pages/admin-neighbourhoods";

// Consumer portal (/account/*) pages
import AccountLoginPage from "@/pages/account-login";
import AccountDashboardPage from "@/pages/account-dashboard";
import AccountFavoritesPage from "@/pages/account-favorites";
import AccountSearchesPage from "@/pages/account-searches";
import AccountNotesPage from "@/pages/account-notes";
import AccountToursPage from "@/pages/account-tours";
import AccountReportsPage from "@/pages/account-reports";
import AccountCalendarPage from "@/pages/account-calendar";

function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) setLocation("/admin");
  }, [loading, user, setLocation]);

  if (loading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-background">
        <div className="font-display text-[11px] tracking-[0.22em] text-muted-foreground">
          LOADING
        </div>
      </div>
    );
  }
  if (!user) return null;
  return <Component />;
}

function AuthGate({ component: Component }: { component: React.ComponentType<any> }) {
  // If already signed in, send the user to the admin dashboard.
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  useEffect(() => {
    if (!loading && user) setLocation("/admin/dashboard");
  }, [loading, user, setLocation]);
  return <Component />;
}

function AppRouter() {
  usePageviewTracker();
  return (
    <Switch>
      {/* PUBLIC marketing site */}
      <Route path="/" component={HomePage} />
      <Route path="/mls" component={MlsSearchPage} />
      <Route path="/mls/:id" component={MlsDetailPage} />
      <Route path="/neighbourhoods" component={NeighbourhoodsIndexPage} />
      <Route path="/neighbourhoods/:slug" component={NeighbourhoodDetailPage} />
      <Route path="/condos" component={CondosIndexPage} />
      <Route path="/condos/:slug" component={CondoDetailPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/blog" component={BlogIndexPage} />
      <Route path="/blog/:slug" component={BlogDetailPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/home-evaluation" component={HomeEvaluationPage} />
      <Route path="/work-with" component={WorkWithIndexPage} />
      <Route path="/work-with/:slug" component={WorkWithDetailPage} />
      <Route path="/assignments" component={AssignmentsPage} />

      {/* Public-facing single-listing page (slug-based, agent's own listings) */}
      <Route path="/p/:slug" component={ListingPublicPage} />

      {/* CONSUMER PORTAL — /account/* */}
      <Route path="/account" component={AccountLoginPage} />
      <Route path="/account/login" component={AccountLoginPage} />
      <Route path="/account/dashboard" component={AccountDashboardPage} />
      <Route path="/account/favorites" component={AccountFavoritesPage} />
      <Route path="/account/searches" component={AccountSearchesPage} />
      <Route path="/account/notes" component={AccountNotesPage} />
      <Route path="/account/tours" component={AccountToursPage} />
      <Route path="/account/reports" component={AccountReportsPage} />
      <Route path="/account/calendar" component={AccountCalendarPage} />

      {/* ADMIN — agent back office */}
      <Route path="/admin" component={() => <AuthGate component={AuthPage} />} />
      <Route path="/admin/login" component={() => <AuthGate component={AuthPage} />} />
      <Route
        path="/admin/dashboard"
        component={() => <ProtectedRoute component={DashboardPage} />}
      />
      <Route
        path="/admin/listings"
        component={() => <ProtectedRoute component={ListingsPage} />}
      />
      <Route
        path="/admin/listings/:id"
        component={(p: any) => (
          <ProtectedRoute component={() => <ListingEditPage {...p} />} />
        )}
      />
      <Route
        path="/admin/leads"
        component={() => <ProtectedRoute component={LeadsPage} />}
      />
      <Route
        path="/admin/calendar"
        component={() => <ProtectedRoute component={AdminCalendarPage} />}
      />
      <Route
        path="/admin/marketing"
        component={() => <ProtectedRoute component={AdminMarketingPage} />}
      />
      <Route
        path="/admin/analytics"
        component={() => <ProtectedRoute component={AdminAnalyticsPage} />}
      />
      <Route
        path="/admin/saved-searches"
        component={() => <ProtectedRoute component={AdminSavedSearchesPage} />}
      />
      <Route
        path="/admin/condos"
        component={() => <ProtectedRoute component={AdminCondosPage} />}
      />
      <Route
        path="/admin/blog"
        component={() => <ProtectedRoute component={AdminBlogPage} />}
      />
      <Route
        path="/admin/neighbourhoods"
        component={() => <ProtectedRoute component={AdminNeighbourhoodsPage} />}
      />
      <Route
        path="/admin/mls-sync"
        component={() => <ProtectedRoute component={MlsSyncPage} />}
      />

      <Route component={NotFound} />
    </Switch>
  );
}

// `ssrPath`/`ssrSearch` pin wouter to the requested URL during server
// rendering; `client` lets the server pass a per-request QueryClient (the
// browser keeps using the module singleton). Both are undefined in the
// browser, so client behaviour is unchanged.
function App({
  ssrPath,
  ssrSearch,
  client = queryClient,
}: {
  ssrPath?: string;
  ssrSearch?: string;
  client?: typeof queryClient;
} = {}) {
  return (
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router ssrPath={ssrPath} ssrSearch={ssrSearch}>
            <AuthProvider>
              <AppRouter />
            </AuthProvider>
          </Router>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
