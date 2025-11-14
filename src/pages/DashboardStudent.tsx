import { Button } from "@/components/ui/button";

const DashboardStudent = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">Brototype</p>
            <p className="font-medium">Student Name</p>
          </div>
          <div className="text-sm">
            🏆 Most Complaints By: <span className="font-medium">[Student Name]</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">My Complaints</h1>
            <Button>+ Submit Complaint</Button>
          </div>

          {/* Complaint List Placeholder */}
          <div className="border border-border rounded-lg p-8 text-center text-muted-foreground">
            <p>No complaints yet. Click "Submit Complaint" to get started.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardStudent;
