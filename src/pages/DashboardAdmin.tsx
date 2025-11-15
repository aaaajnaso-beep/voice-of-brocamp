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
import { Search } from "lucide-react";

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
        .single();

      if (roles?.role !== "admin") {
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
      .select(`
        *,
        profiles (
          full_name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load complaints",
      });
    } else {
      setComplaints(data || []);
      setFilteredComplaints(data || []);
    }
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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">Brototype</p>
            <p className="font-medium">{profile?.full_name || "Admin"}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              🏆 Most Complaints By: <span className="font-medium">{topComplainer || "N/A"}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Complaints</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalComplaints}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Solved Complaints</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{solvedComplaints}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Pending Complaints</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-600">{pendingComplaints}</p>
              </CardContent>
            </Card>
          </div>

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
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <p>No complaints to display.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
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
