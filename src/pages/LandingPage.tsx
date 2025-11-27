import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import brocampHero from "@/assets/brocamp-hero.jpg";
import { ArrowRight } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Hero Image as Background */}
      <div className="absolute inset-0">
        <img 
          src={brocampHero} 
          alt="Brocamp Learning Environment" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 max-w-5xl w-full text-center space-y-8 animate-in fade-in duration-1000">
        {/* Title */}
        <div className="space-y-4 animate-in slide-in-from-bottom duration-700">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight drop-shadow-2xl">
            Voices of Brocamp
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-light max-w-2xl mx-auto drop-shadow-lg">
            Where Every Voice Matters — Your feedback shapes our community
          </p>
        </div>

        {/* Login Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-16 animate-in slide-in-from-bottom duration-700 delay-150">
          <Button
            size="lg"
            onClick={() => navigate("/login-student")}
            className="w-full sm:w-auto text-lg px-12 py-6 h-auto transition-all hover:scale-105 shadow-2xl hover:shadow-xl group bg-white text-black hover:bg-white/90"
          >
            Login as Student
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/login-admin")}
            className="w-full sm:w-auto text-lg px-12 py-6 h-auto transition-all hover:scale-105 shadow-2xl hover:shadow-xl border-2 border-white bg-black/30 text-white hover:bg-black/50 group"
          >
            Login as Admin
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Footer with Brototype branding */}
        <div className="pt-12 animate-in fade-in duration-700 delay-300">
          <div className="inline-block px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full shadow-lg">
            <p className="text-sm text-white font-semibold tracking-wider">
              ⚡ POWERED BY BROTOTYPE
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
