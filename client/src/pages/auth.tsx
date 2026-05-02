import { useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight, UserPlus, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

type Mode = "signin" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("spencer@riversrealestate.ca");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        if (!name.trim()) throw new Error("Please enter your name");
        await signUp(email, password, name);
      }
    } catch (err: any) {
      const msg = err?.message ?? "Something went wrong";
      // queryClient throws "401: text" — surface a friendlier message
      const cleaned = msg.replace(/^\d+:\s*/, "").replace(/^\{.*\}$/, "");
      try {
        const parsed = JSON.parse(cleaned);
        setError(parsed.message ?? cleaned);
      } catch {
        setError(cleaned || msg);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* LEFT — form panel */}
      <div className="flex flex-col bg-background px-8 py-10 lg:px-16 lg:py-14">
        <Logo layout="row" size={40} />

        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto py-10">
          <div className="eyebrow text-muted-foreground mb-4">Calgary · Luxury Market</div>
          <h1
            className="font-serif text-foreground"
            style={{ fontSize: "clamp(2.4rem, 1.6rem + 2.5vw, 3.4rem)", lineHeight: 1.05, letterSpacing: "-0.02em" }}
          >
            Quiet command
            <br />
            of your
            <span className="block italic">listings.</span>
          </h1>
          <p className="text-muted-foreground mt-4 text-[15px] leading-relaxed">
            The private workspace behind luxuryhomescalgary.ca — listings,
            buyer enquiries, and tours for Spencer Rivers and his clients in
            Calgary's most exacting neighbourhoods.
          </p>

          <div className="mt-8">
            <h2 className="font-serif text-2xl text-foreground" style={{ letterSpacing: "-0.01em" }}>
              {mode === "signin" ? "Welcome back, Spencer." : "Create your account"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "signin"
                ? "Sign in to manage your listings and enquiries."
                : "Set up access to the Rivers workspace."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="eyebrow">
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-testid="input-name"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="eyebrow">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-email"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="eyebrow">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signin" ? "Your password" : "At least 8 characters"}
                  data-testid="input-password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  data-testid="button-toggle-password"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

            </div>

            {error && (
              <div className="text-sm text-rose-700 dark:text-rose-400" data-testid="auth-error">
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={busy}
              className="w-full bg-foreground hover:bg-foreground/90 text-background rounded-sm h-11 font-display tracking-[0.18em] text-[12px]"
              data-testid={mode === "signin" ? "button-signin" : "button-signup"}
            >
              {busy ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> WORKING…
                </>
              ) : mode === "signin" ? (
                <>
                  SIGN IN <ArrowRight className="ml-2 w-4 h-4" />
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 w-4 h-4" /> CREATE ACCOUNT
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="text-xs text-muted-foreground font-display tracking-[0.14em]">
          © 2026 RIVERS REAL ESTATE · SYNTERRA REALTY
        </div>
      </div>

      {/* RIGHT — hero image panel */}
      <div className="hidden lg:block relative overflow-hidden bg-foreground">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&h=2000&fit=crop"
          alt="Calgary luxury home"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.92) 100%)",
          }}
        />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <div className="eyebrow text-white/70 mb-3">Featured · Aspen Woods</div>
          <h2 className="font-serif text-3xl lg:text-4xl text-white" style={{ letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            82 Aspen Summit Circle SW
            <br />
            <span className="italic text-white/85">$3,275,000</span>
          </h2>
          <p className="mt-3 text-sm text-white/75 max-w-md leading-relaxed">
            5 beds · 4.5 baths · 4,810 sqft · 0.42 acres. Mountain views from
            the primary, indoor sport court, walkout lower level.
          </p>
        </div>
      </div>
    </div>
  );
}
