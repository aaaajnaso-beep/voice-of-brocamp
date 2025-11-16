import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import brocampHero from "@/assets/brocamp-hero.jpg";
import { ArrowRight } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col items-center justify-center p-4">
      <div className="max-w-5xl w-full text-center space-y-12 animate-in fade-in duration-1000">
        {/* Hero Image */}
        <div className="w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-border/50 transform transition-transform hover:scale-[1.01] duration-300">
          <img 
            src={brocampHero} 
            alt="Brocamp Learning Environment" 
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Title */}
        <div className="space-y-4 animate-in slide-in-from-bottom duration-700">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight leading-tight">
            Voices of Brocamp
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto">
            Where Every Voice Matters — Your feedback shapes our community
          </p>
        </div>

        {/* Login Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4 animate-in slide-in-from-bottom duration-700 delay-150">
          <Button
            size="lg"
            onClick={() => navigate("/login-student")}
            className="w-full sm:w-auto text-lg px-12 py-6 h-auto transition-all hover:scale-105 shadow-lg hover:shadow-xl group"
          >
            Login as Student
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/login-admin")}
            className="w-full sm:w-auto text-lg px-12 py-6 h-auto transition-all hover:scale-105 shadow-lg hover:shadow-xl border-2 group"
          >
            Login as Admin
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Footer with Brototype branding */}
        <div className="pt-12 animate-in fade-in duration-700 delay-300">
          <div className="inline-block px-6 py-3 bg-card border border-border rounded-full shadow-sm">
            <p className="text-sm text-muted-foreground font-semibold tracking-wider">
              ⚡ POWERED BY BROTOTYPE
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
