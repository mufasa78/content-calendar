import { SignInButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 text-center space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <img
            src="/Malaica-Logo-2025-01-1536x795.png"
            alt="Malaica Logo"
            className="h-20 w-auto object-contain"
          />
        </div>

        {/* Purpose */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight leading-tight">
            Content Calendar for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Dr. Lorraine Muluka
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Strategic content management for LinkedIn. Plan, create, and schedule your content.
          </p>
        </div>

        {/* Sign Up Button */}
        <div className="pt-4">
          <SignInButton mode="modal">
            <Button size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all">
              Get Started
            </Button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
}
