import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        {/* Hero Image Placeholder */}
        <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center border border-border">
          <p className="text-muted-foreground">Brocamp Photo (to be added)</p>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
          Voices of Brocamp
        </h1>
        <p className="text-xl text-muted-foreground">
          Where Every Voice Matters
        </p>

        {/* Login Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button
            size="lg"
            onClick={() => navigate("/login-student")}
            className="w-full sm:w-auto"
          >
            Login as Student
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/login-admin")}
            className="w-full sm:w-auto"
          >
            Login as Admin
          </Button>
        </div>

        {/* Footer with Brototype branding */}
        <div className="mt-16">
          <p className="text-sm text-muted-foreground">
            Powered by Brototype
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
