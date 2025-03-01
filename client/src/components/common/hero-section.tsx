import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HeroSection() {
  return (
    <div className="relative min-h-screen flex items-center">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1534527489986-3e3394ca569c")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="container mx-auto px-4 z-10">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Transform Your Property Management Experience
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            AI-powered insights, real-time monitoring, and smart automation for
            modern property management.
          </p>
          <div className="flex gap-4">
            <Button size="lg" asChild>
              <Link href="/auth">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
