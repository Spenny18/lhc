import { Switch, Route, Router, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/lib/auth";
import { useEffect } from "react";

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

      {/* Public-facing single-listing page (slug-based, agent's own listings) */}
      <Route path="/p/:slug" component={ListingPublicPage} />

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
        path="/admin/mls-sync"
        component={() => <ProtectedRoute component={MlsSyncPage} />}
      />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router hook={useHashLocation}>
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
