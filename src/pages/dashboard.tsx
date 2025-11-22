import { useUser, signOut } from "@/shared/hooks/useAuth";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { FileText, Plus, Upload, Users, LogOut, User, Settings } from "lucide-react";
import { UploadHealthRecordDialog } from "@/modules/health-records/components/upload-health-record-dialog";
import { FamilyMembersDialog } from "@/modules/family-members/components/family-members-dialog";
import { useState } from "react";

export default function Dashboard() {
  const user = useUser();
  const [isFamilyDialogOpen, setIsFamilyDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <img src="src/assets/oregon.svg" alt="Oregon Health" className="h-14 w-14 text-primary" />
              <span className="text-xl font-bold">Oregon Health</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span className="text-muted-foreground">{user?.email}</span>
              </div>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Welcome to Your Family Health Vault
          </h1>
          <p className="text-muted-foreground">
            Manage, organize, and understand your family's medical records in one secure place.
          </p>
        </div>

        {/* Upload dialog trigger handled by card below */}

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Upload className="h-8 w-8 text-primary" />
                <Badge variant="secondary">New</Badge>
              </div>
              <CardTitle className="mt-4">Upload Records</CardTitle>
              <CardDescription>
                Drop PDFs, photos, or scans of medical documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full gap-2" onClick={() => setIsUploadDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Upload Files
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader>
              <Users className="h-8 w-8 text-primary" />
              <CardTitle className="mt-4">Family Members</CardTitle>
              <CardDescription>
                Add and manage family member profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => setIsFamilyDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Member
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader>
              <FileText className="h-8 w-8 text-primary" />
              <CardTitle className="mt-4">View Timeline</CardTitle>
              <CardDescription>
                Browse your family's health history chronologically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Open Timeline
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Records</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Family Members</CardDescription>
              <CardTitle className="text-3xl">1</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Recent Uploads</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Categories</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest health record interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No records yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                Start by uploading your first medical document. Our AI will automatically organize and explain it for you.
              </p>
              <Button className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Your First Record
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Family Members Dialog */}
      <FamilyMembersDialog
        open={isFamilyDialogOpen}
        onOpenChange={setIsFamilyDialogOpen}
      />
      <UploadHealthRecordDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
      />
    </div>
  );
}
