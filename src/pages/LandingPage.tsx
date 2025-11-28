import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import brocampHero from "@/assets/brocamp-hero.jpg";
import { ArrowRight } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background with Image */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500">
        <img 
          src={brocampHero} 
          alt="Brocamp Learning Environment" 
          className="absolute right-0 top-0 h-full w-2/3 object-cover opacity-90 mask-gradient"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Voices of Brocamp
          </h1>
          
          <div className="flex gap-3 md:gap-4">
            <Button
              onClick={() => navigate("/login-student")}
              className="bg-white text-black hover:bg-white/90 font-semibold px-6 py-2 rounded-lg shadow-lg"
            >
              Login as Student
            </Button>
            <Button
              onClick={() => navigate("/login-admin")}
              className="bg-teal-500/30 text-white hover:bg-teal-500/40 font-semibold px-6 py-2 rounded-lg border border-white/30 backdrop-blur-sm group"
            >
              Login as Admin
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex items-center px-6 md:px-16 lg:px-24 pb-20">
          <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-left duration-700">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              What honest feedback feels like inside Brocamp
            </h2>
            
            <p className="text-xl md:text-2xl text-white/90 font-light max-w-2xl">
              Where Every Voice Matters — Your feedback shapes our community
            </p>

            <Button
              size="lg"
              onClick={() => navigate("/login-student")}
              className="bg-teal-300 hover:bg-teal-400 text-black font-bold px-8 py-6 text-lg rounded-xl shadow-xl transition-all hover:scale-105 group mt-8"
            >
              Submit Complaint
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
