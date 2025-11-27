import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Search, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import dashboardBg from "@/assets/dashboard-bg.png";

type Complaint = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  admin_notes: string | null;
  user_id: string;
  profiles: {
    full_name: string;
  } | null;
};

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [topComplainer, setTopComplainer] = useState<string>("");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [adminNotes, setAdminNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const totalComplaints = complaints.length;
  const solvedComplaints = complaints.filter(c => c.status === "Solved").length;
  const pendingComplaints = complaints.filter(c => c.status === "Pending").length;
  const inProgressComplaints = complaints.filter(c => c.status === "In Progress").length;

  // Category breakdown for charts
  const categoryData = complaints.reduce((acc: any[], complaint) => {
    const existing = acc.find(item => item.name === complaint.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: complaint.category, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))'];
  
  const resolutionRate = totalComplaints > 0 ? ((solvedComplaints / totalComplaints) * 100).toFixed(1) : "0";

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login-admin");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roles || roles.role !== "admin") {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You do not have admin privileges.",
        });
        await supabase.auth.signOut();
        navigate("/");
        return;
      }

      setUser(session.user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();
      
      if (profileData) setProfile(profileData);

      fetchComplaints();
      fetchTopComplainer();
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/login-admin");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    let filtered = complaints;

    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    setFilteredComplaints(filtered);
  }, [searchTerm, statusFilter, complaints]);

  const fetchComplaints = async () => {
    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load complaints",
      });
      return;
    }

    // Fetch profiles separately to avoid type issues
    const userIds = [...new Set(data?.map(c => c.user_id) || [])];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);

    // Map profiles to complaints
    const profilesMap = new Map(
      profilesData?.map(p => [p.id, p]) || []
    );

    const complaintsWithProfiles = (data || []).map(complaint => ({
      ...complaint,
      profiles: profilesMap.get(complaint.user_id) || null
    }));

    setComplaints(complaintsWithProfiles as Complaint[]);
    setFilteredComplaints(complaintsWithProfiles as Complaint[]);
  };

  const fetchTopComplainer = async () => {
    const { data: complaintsData } = await supabase
      .from("complaints")
      .select("user_id, profiles(full_name)");

    if (complaintsData && complaintsData.length > 0) {
      const complaintCounts = complaintsData.reduce((acc: any, complaint: any) => {
        const userId = complaint.user_id;
        const userName = complaint.profiles?.full_name || "Unknown";
        acc[userId] = {
          name: userName,
          count: (acc[userId]?.count || 0) + 1
        };
        return acc;
      }, {});

      const topUser = Object.values(complaintCounts).reduce((max: any, user: any) => 
        user.count > (max?.count || 0) ? user : max
      , null);

      if (topUser) {
        setTopComplainer((topUser as any).name);
      }
    }
  };

  const handleUpdateStatus = async (complaintId: string, newStatus: string) => {
    setIsUpdating(true);

    const { error } = await supabase
      .from("complaints")
      .update({ status: newStatus })
      .eq("id", complaintId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status",
      });
    } else {
      toast({
        title: "Success",
        description: `Complaint marked as ${newStatus}`,
      });
      fetchComplaints();
      if (selectedComplaint?.id === complaintId) {
        setSelectedComplaint({ ...selectedComplaint, status: newStatus });
      }
    }

    setIsUpdating(false);
  };

  const handleSaveNotes = async () => {
    if (!selectedComplaint) return;

    setIsUpdating(true);

    const { error } = await supabase
      .from("complaints")
      .update({ admin_notes: adminNotes })
      .eq("id", selectedComplaint.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save notes",
      });
    } else {
      toast({
        title: "Success",
        description: "Admin notes saved successfully",
      });
      fetchComplaints();
      setSelectedComplaint({ ...selectedComplaint, admin_notes: adminNotes });
    }

    setIsUpdating(false);
  };

  const openComplaintDetail = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setAdminNotes(complaint.admin_notes || "");
    setIsDialogOpen(true);
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

      <header className="relative z-10 border-b border-white/20 bg-black/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-white">Voices of Brocamp</div>
            <Badge variant="secondary" className="text-xs bg-white/90 text-black">Admin</Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-white">
              {profile?.full_name || "Admin"}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 border border-white/30 rounded-lg backdrop-blur-sm">
              <TrendingUp className="h-4 w-4 text-white" />
              <span className="text-xs text-white/80">Most Active:</span>
              <span className="text-sm font-bold text-white">{topComplainer || "Loading..."}</span>
            </div>
            <Button variant="outline" onClick={handleLogout} className="bg-white text-black hover:bg-white/90">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-white/80">Manage and resolve student complaints</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/95 backdrop-blur-sm border-white/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Complaints</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalComplaints}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>
          <Card className="bg-white/95 backdrop-blur-sm border-white/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Solved</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{solvedComplaints}</div>
              <p className="text-xs text-muted-foreground mt-1">{resolutionRate}% resolution rate</p>
            </CardContent>
          </Card>
          <Card className="bg-white/95 backdrop-blur-sm border-white/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{inProgressComplaints}</div>
              <p className="text-xs text-muted-foreground mt-1">Being handled</p>
            </CardContent>
          </Card>
          <Card className="bg-white/95 backdrop-blur-sm border-white/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{pendingComplaints}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting action</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Section */}
        {categoryData.length > 0 && (
          <Card className="mb-8 bg-white/95 backdrop-blur-sm border-white/30">
            <CardHeader>
              <CardTitle>Complaint Categories Breakdown</CardTitle>
              <CardDescription>Distribution of complaints by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by student name or complaint title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Solved">Solved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredComplaints.length === 0 ? (
            <Card className="bg-white/95 backdrop-blur-sm border-white/30">
              <CardContent className="p-8 text-center text-muted-foreground">
                <p>No complaints to display.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/95 backdrop-blur-sm border-white/30">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComplaints.map((complaint) => (
                      <TableRow 
                        key={complaint.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => openComplaintDetail(complaint)}
                      >
                        <TableCell className="font-medium">
                          {complaint.profiles?.full_name || "Unknown"}
                        </TableCell>
                        <TableCell>{complaint.title}</TableCell>
                        <TableCell>{complaint.category}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(complaint.status)} variant="outline">
                            {complaint.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(complaint.created_at), "PPP")}</TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          {complaint.status !== "Solved" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(
                                complaint.id, 
                                complaint.status === "Pending" ? "In Progress" : "Solved"
                              )}
                              disabled={isUpdating}
                            >
                              {complaint.status === "Pending" ? "Mark In Progress" : "Mark Solved"}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Student</Label>
                <p className="font-medium">{selectedComplaint.profiles?.full_name || "Unknown"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Title</Label>
                <p className="font-medium">{selectedComplaint.title}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Category</Label>
                <p>{selectedComplaint.category}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge className={getStatusColor(selectedComplaint.status)} variant="outline">
                    {selectedComplaint.status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1 text-foreground">{selectedComplaint.description}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Date Submitted</Label>
                <p>{format(new Date(selectedComplaint.created_at), "PPPp")}</p>
              </div>
              <div>
                <Label htmlFor="admin-notes">Admin Notes</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes for this complaint..."
                  className="mt-1 min-h-24"
                />
                <Button 
                  onClick={handleSaveNotes} 
                  className="mt-2"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Saving..." : "Save Notes"}
                </Button>
              </div>
              <div className="flex gap-2 pt-4 border-t">
                {selectedComplaint.status === "Pending" && (
                  <Button 
                    onClick={() => handleUpdateStatus(selectedComplaint.id, "In Progress")}
                    disabled={isUpdating}
                  >
                    Mark as In Progress
                  </Button>
                )}
                {selectedComplaint.status === "In Progress" && (
                  <Button 
                    onClick={() => handleUpdateStatus(selectedComplaint.id, "Solved")}
                    disabled={isUpdating}
                  >
                    Mark as Solved
                  </Button>
                )}
                {selectedComplaint.status === "Solved" && (
                  <Badge className="bg-green-500/20 text-green-700 border-green-500/50 px-4 py-2" variant="outline">
                    ✓ Complaint Resolved
                  </Badge>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardAdmin;
