import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useFamilyMembers } from "../hooks/use-family-members-query";
import { useCreateFamilyLink, useDeleteFamilyLink, useSearchUserByEmail } from "../hooks/use-family-members-mutations";
import { FamilyRole, getAllFamilyRoles, getFamilyRoleLabel } from "../types";
import type { FamilyMember } from "../types";
import { UserPlus, Trash2, Mail, Users, Search, AlertCircle, CheckCircle2 } from "lucide-react";

interface FamilyMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FamilyMembersDialog({ open, onOpenChange }: FamilyMembersDialogProps) {
  const { data: familyMembers, isLoading, refetch } = useFamilyMembers();
  const createLink = useCreateFamilyLink();
  const deleteLink = useDeleteFamilyLink();
  const searchUserMutation = useSearchUserByEmail();

  const [searchEmail, setSearchEmail] = useState("");
  const [memberName, setMemberName] = useState("");
  const [selectedRole, setSelectedRole] = useState<FamilyRole>(FamilyRole.OTHER);
  const [isAdding, setIsAdding] = useState(false);
  const [searchResult, setSearchResult] = useState<{ exists: boolean; userId?: string; email: string; name?: string } | null>(null);

  const handleSearchUser = async () => {
    if (!searchEmail) return;

    setSearchResult(null);
    
    try {
      const result = await searchUserMutation.mutateAsync(searchEmail);
      setSearchResult(result);
      
      // If user exists, pre-fill their name
      if (result?.exists && result.name) {
        setMemberName(result.name);
      } else if (!result?.exists) {
        // If user doesn't exist, pre-fill name from email
        setMemberName(searchEmail.split("@")[0]);
      }
    } catch (error) {
      console.error("Failed to search user:", error);
      setSearchResult({ exists: false, email: searchEmail });
    }
  };

  const handleAddMember = async () => {
    if (!searchEmail || !memberName || !selectedRole) return;

    // Check if user exists in our database
    if (!searchResult) {
      alert("Please search for the user first by clicking the search button.");
      return;
    }

    if (!searchResult.exists) {
      alert(
        `${searchEmail} is not registered in Oregon Health yet. They must create an account before you can add them as a family member.`
      );
      return;
    }

    setIsAdding(true);
    try {
      await createLink.mutateAsync({
        email: searchEmail,
        name: memberName,
        role: selectedRole,
      });

      // Reset form
      setSearchEmail("");
      setMemberName("");
      setSelectedRole(FamilyRole.OTHER);
      setSearchResult(null);

      // Refetch the list
      await refetch();
    } catch (error) {
      console.error("Failed to add family member:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to add family member. Please try again.";
      alert(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteMember = async (member: FamilyMember) => {
    if (!confirm(`Are you sure you want to remove ${member.name}?`)) return;

    try {
      await deleteLink.mutateAsync(member.id);
      await refetch();
    } catch (error) {
      console.error("Failed to delete family member:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Family Members
          </DialogTitle>
          <DialogDescription>
            Manage your family members and their roles in your health vault.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Family Members List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Current Members ({familyMembers?.length || 0})
            </h3>
            
            {isLoading ? (
              <div className="text-sm text-muted-foreground py-8 text-center">
                Loading family members...
              </div>
            ) : familyMembers && familyMembers.length > 0 ? (
              <div className="space-y-2">
                {familyMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{member.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {getFamilyRoleLabel(member.role)}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteMember(member)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-8 text-center border rounded-lg border-dashed">
                No family members yet. Add your first member below.
              </div>
            )}
          </div>

          {/* Add New Member Form */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add New Member
            </h3>

            <div className="space-y-3">
              <div className="space-y-2">
                <label htmlFor="member-email" className="text-sm font-medium">
                  Email Address
                </label>
                <div className="flex gap-2">
                  <Input
                    id="member-email"
                    type="email"
                    placeholder="family.member@example.com"
                    value={searchEmail}
                    onChange={(e) => {
                      setSearchEmail(e.target.value);
                      setSearchResult(null); // Reset search result when email changes
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSearchUser}
                    disabled={!searchEmail || searchUserMutation.isPending}
                    className="gap-2"
                  >
                    <Search className="h-4 w-4" />
                    {searchUserMutation.isPending ? "Searching..." : "Search"}
                  </Button>
                </div>
                
                {searchResult && (
                  <div className={`flex items-center gap-2 text-sm p-2 rounded-md ${
                    searchResult.exists 
                      ? "bg-green-50 text-green-700 border border-green-200" 
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    {searchResult.exists ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>User found! You can add them to your family.</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4" />
                        <span>User not registered. They must create an account first.</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="member-name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="member-name"
                  type="text"
                  placeholder="Full name"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="member-role" className="text-sm font-medium">
                  Relationship
                </label>
                <Select value={selectedRole} onValueChange={(value: string) => setSelectedRole(value as FamilyRole)}>
                  <SelectTrigger id="member-role">
                    <SelectValue placeholder="Select a relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllFamilyRoles().map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleAddMember}
                disabled={!searchEmail || !memberName || !selectedRole || isAdding || !searchResult}
                className="w-full gap-2"
              >
                <UserPlus className="h-4 w-4" />
                {isAdding ? "Adding..." : "Add Family Member"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
