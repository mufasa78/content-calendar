import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Kanban, Sparkles, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-body">
      {/* Navbar */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold font-display tracking-tight">Malaica</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/api/login">
              <Button variant="ghost" className="font-medium">Log In</Button>
            </Link>
            <Link href="/api/login">
              <Button className="shadow-lg shadow-primary/25">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
          
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-enter">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Now in Early Access
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight mb-8 leading-[1.1] animate-enter [animation-delay:100ms]">
              The Operating System for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Elite Content Teams</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-enter [animation-delay:200ms]">
              Stop managing content in spreadsheets. Plan, create, and repurpose your content with strategic intelligence built-in.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-enter [animation-delay:300ms]">
              <Link href="/api/login">
                <Button size="lg" className="h-14 px-8 text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
                  Start Creating Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/api/login">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-white/50 backdrop-blur-sm">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 bg-white/50 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-display">Visual Calendar</h3>
                <p className="text-muted-foreground">Drag and drop your content to reschedule instantly. See your entire month at a glance.</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                  <Kanban className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-display">Focus Kanban</h3>
                <p className="text-muted-foreground">Move ideas from Creation to Curation to Conversation. Never lose track of a draft.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600 mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-display">Post Intelligence</h3>
                <p className="text-muted-foreground">Store mission, vision, and audience data with every post. Create with purpose.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof / Trust */}
        <section className="py-24 container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-display mb-12">Built for modern creators</h2>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Mock logos using text for simplicity */}
            {['Acme Corp', 'GlobalMedia', 'CreatorLabs', 'SaaS Flow'].map((brand) => (
              <span key={brand} className="text-2xl font-bold font-display">{brand}</span>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-12 bg-white">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2024 Malaica Content OS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
