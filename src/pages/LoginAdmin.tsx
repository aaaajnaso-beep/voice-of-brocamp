import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Shield } from "lucide-react";

const LoginAdmin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if using admin email
      if (email !== "brovoices@brocamp.com") {
        throw new Error("Only brovoices@brocamp.com can access admin login");
      }

      // Check if using admin password
      if (password !== "brototype@123") {
        throw new Error("Invalid admin password");
      }

      // Try to sign in first
      let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // If user doesn't exist, sign them up
      if (error?.message?.includes("Invalid login credentials")) {
        const signUpResult = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: "Admin",
            },
            emailRedirectTo: `${window.location.origin}/dashboard-admin`,
          },
        });

        if (signUpResult.error) throw signUpResult.error;
        data = signUpResult.data;
      } else if (error) {
        throw error;
      }

      if (!data.user) throw new Error("Authentication failed");

      // Assign admin role using secure RPC function
      const { error: roleError } = await supabase.rpc("assign_admin_role", {
        _user_id: data.user.id,
      });

      if (roleError) {
        console.error("Role assignment error:", roleError);
        throw new Error("Failed to assign admin privileges");
      }

      // Verify role was assigned successfully
      const { data: roleData, error: roleCheckError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .single();

      if (roleCheckError || !roleData) {
        console.error("Role verification failed:", roleCheckError);
        throw new Error("Failed to verify admin privileges");
      }

      toast({
        title: "Welcome Admin!",
        description: "You've successfully logged in.",
      });
      navigate("/dashboard-admin");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: error.message || "Invalid credentials or insufficient permissions",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="border-2 border-primary/20 shadow-lg transition-all hover:shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
            </div>
            <CardDescription>Administrative access only</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@brototype.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Admin Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full transition-transform hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying credentials...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Login as Admin
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginAdmin;
