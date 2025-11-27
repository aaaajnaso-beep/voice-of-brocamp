import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { z } from "zod";
import dashboardBg from "@/assets/dashboard-bg.png";

const complaintSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description too long"),
  category: z.string().min(1, "Please select a category"),
});

type Complaint = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  admin_notes: string | null;
};

type Profile = {
  full_name: string;
};

const DashboardStudent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [topComplainer, setTopComplainer] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login-student");
        return;
      }
      setUser(session.user);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();
      
      if (profileData) setProfile(profileData);

      // Fetch complaints
      fetchComplaints(session.user.id);
      fetchTopComplainer();
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/login-student");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchComplaints = async (userId: string) => {
    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load complaints",
      });
    } else {
      setComplaints(data || []);
    }
  };

  const fetchTopComplainer = async () => {
    const { data, error } = await supabase.rpc("get_top_complainer");

    if (error) {
      console.error("Error fetching top complainer:", error);
      return;
    }

    if (data && data.length > 0) {
      setTopComplainer(data[0].full_name);
    }
  };

  const handleSubmitComplaint = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const complaintData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
    };

    try {
      complaintSchema.parse(complaintData);

      const { error } = await supabase.from("complaints").insert({
        ...complaintData,
        user_id: user.id,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to submit complaint",
        });
      } else {
        toast({
          title: "Success!",
          description: "Your complaint has been submitted",
        });
        setIsDialogOpen(false);
        fetchComplaints(user.id);
        fetchTopComplainer();
        e.currentTarget.reset();
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: error.errors[0].message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500/50";
      case "In Progress":
        return "bg-blue-500/20 text-blue-700 border-blue-500/50";
      case "Solved":
        return "bg-green-500/20 text-green-700 border-green-500/50";
      default:
        return "bg-gray-500/20 text-gray-700 border-gray-500/50";
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src={dashboardBg} 
          alt="Dashboard Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/20 bg-black/30 backdrop-blur-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <p className="text-sm text-white/70">Brototype</p>
            <p className="font-medium text-white">{profile?.full_name || "Student"}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-white">
              🏆 Most Complaints By: <span className="font-medium">{topComplainer || "N/A"}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="bg-white text-black hover:bg-white/90">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto p-4 md:p-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">My Complaints</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>+ Submit Complaint</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Submit New Complaint</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitComplaint} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Provide detailed information about your complaint"
                      className="min-h-32"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hostel">Hostel</SelectItem>
                        <SelectItem value="Mentor">Mentor</SelectItem>
                        <SelectItem value="Technical">Technical</SelectItem>
                        <SelectItem value="Placement">Placement</SelectItem>
                        <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Submitting..." : "Submit Complaint"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Complaints List */}
          {complaints.length === 0 ? (
            <div className="border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center text-white">
              <p>No complaints yet. Click "Submit Complaint" to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {complaints.map((complaint) => (
                <Card key={complaint.id} className="bg-white/95 backdrop-blur-sm hover:shadow-xl transition-shadow border-white/30">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{complaint.title}</CardTitle>
                        <CardDescription>
                          {format(new Date(complaint.created_at), "PPP")}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(complaint.status)} variant="outline">
                        {complaint.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">{complaint.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="text-foreground">{complaint.description}</p>
                    </div>
                    {complaint.admin_notes && (
                      <div className="border-t pt-3">
                        <p className="text-sm text-muted-foreground">Admin Response</p>
                        <p className="text-foreground mt-1">{complaint.admin_notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardStudent;
