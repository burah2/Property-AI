import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import HeroSection from "@/components/common/hero-section";
import FeatureSection from "@/components/common/feature-section";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            PropSmart
          </h1>
          <div className="flex gap-4">
            {user ? (
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/auth">Get Started</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>

      <main>
        <HeroSection />
        <FeatureSection />
      </main>

      <footer className="bg-muted py-12 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 PropSmart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
