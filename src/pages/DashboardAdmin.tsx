const DashboardAdmin = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">Brototype</p>
            <p className="font-medium">Admin Name</p>
          </div>
          <div className="text-sm">
            🏆 Most Complaints By: <span className="font-medium">[Student Name]</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-border rounded-lg p-6">
              <p className="text-sm text-muted-foreground">Total Complaints</p>
              <p className="text-3xl font-bold mt-2">0</p>
            </div>
            <div className="border border-border rounded-lg p-6">
              <p className="text-sm text-muted-foreground">Solved Complaints</p>
              <p className="text-3xl font-bold mt-2">0</p>
            </div>
            <div className="border border-border rounded-lg p-6">
              <p className="text-sm text-muted-foreground">Pending Complaints</p>
              <p className="text-3xl font-bold mt-2">0</p>
            </div>
          </div>

          {/* Complaints Table Placeholder */}
          <div className="border border-border rounded-lg p-8 text-center text-muted-foreground">
            <p>No complaints to display.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardAdmin;
