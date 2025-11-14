import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import brocampHero from "@/assets/brocamp-hero.jpg";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-5xl w-full text-center space-y-12">
        {/* Hero Image */}
        <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-border/50">
          <img 
            src={brocampHero} 
            alt="Brocamp Learning Environment" 
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight">
            Voices of Brocamp
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light">
            Where Every Voice Matters
          </p>
        </div>

        {/* Login Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
          <Button
            size="lg"
            onClick={() => navigate("/login-student")}
            className="w-full sm:w-auto text-lg px-12 py-6 h-auto transition-transform hover:scale-105"
          >
            Login as Student
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/login-admin")}
            className="w-full sm:w-auto text-lg px-12 py-6 h-auto transition-transform hover:scale-105"
          >
            Login as Admin
          </Button>
        </div>

        {/* Footer with Brototype branding */}
        <div className="pt-12">
          <p className="text-sm text-muted-foreground font-medium tracking-wider">
            POWERED BY BROTOTYPE
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
