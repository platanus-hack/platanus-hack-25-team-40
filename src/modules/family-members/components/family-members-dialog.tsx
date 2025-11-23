import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(["family", "common"]);
  const { data: familyMembers, isLoading } = useFamilyMembers();
  const createLink = useCreateFamilyLink();
  const deleteLink = useDeleteFamilyLink();
  const searchUserMutation = useSearchUserByEmail();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<FamilyRole>(FamilyRole.OTHER);
  const [isAdding, setIsAdding] = useState(false);
  const [searchResult, setSearchResult] = useState<{ exists: boolean; userId?: string; email: string; name?: string } | null>(null);

  const handleSearchUser = async () => {
    if (!searchQuery.trim()) return;

    setSearchResult(null);
    
    try {
      const result = await searchUserMutation.mutateAsync(searchQuery.trim());
      setSearchResult(result);
    } catch (error) {
      console.error("Failed to search user:", error);
      setSearchResult({ exists: false, email: searchQuery.trim() });
    }
  };

  const handleAddMember = async () => {
    if (!searchQuery.trim() || !selectedRole) return;

    // Check if user exists in our database
    if (!searchResult) {
      alert(t("family:dialog.searchFirst"));
      return;
    }

    if (!searchResult.exists) {
      alert(t("family:dialog.notRegisteredAlert", { email: searchQuery }));
      return;
    }

    setIsAdding(true);
    try {
      await createLink.mutateAsync({
        email: searchResult.email,
        name: searchResult.name || searchResult.email.split("@")[0],
        role: selectedRole,
      });

      // Reset form
      setSearchQuery("");
      setSelectedRole(FamilyRole.OTHER);
      setSearchResult(null);
    } catch (error) {
      console.error("Failed to add family member:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to add family member. Please try again.";
      alert(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteMember = async (member: FamilyMember) => {
    if (!confirm(t("family:dialog.confirmDelete", { name: member.name }))) return;

    try {
      await deleteLink.mutateAsync(member.id);
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
            {t("family:title")}
          </DialogTitle>
          <DialogDescription>
            {t("family:dialog.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current {t("family:title")} List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {t("family:dialog.currentMembers")} ({familyMembers?.length || 0})
            </h3>
            
            {isLoading ? (
              <div className="text-sm text-muted-foreground py-8 text-center">
                {t("family:dialog.loading")}
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
                {t("family:dialog.noMembers")}
              </div>
            )}
          </div>

          {/* {t("family:dialog.addNew")} Form */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              {t("family:dialog.addNew")}
            </h3>

            <div className="space-y-3">
              <div className="space-y-2">
                <label htmlFor="search-query" className="text-sm font-medium">
                  {t("family:dialog.searchLabel")}
                </label>
                <div className="flex gap-2">
                  <Input
                    id="search-query"
                    type="text"
                    placeholder={t("family:dialog.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchResult(null); // Reset search result when query changes
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchUser();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSearchUser}
                    disabled={!searchQuery.trim() || searchUserMutation.isPending}
                    className="gap-2"
                  >
                    <Search className="h-4 w-4" />
                    {searchUserMutation.isPending ? t("family:dialog.searching") : t("family:dialog.searchButton")}
                  </Button>
                </div>
                
                {searchResult && (
                  <div className={`flex items-start gap-2 text-sm p-3 rounded-md ${
                    searchResult.exists 
                      ? "bg-green-50 text-green-700 border border-green-200" 
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    {searchResult.exists ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium">{searchResult.name || t("family:dialog.userFound")}</p>
                          <p className="text-xs opacity-90">{searchResult.email}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium">{t("family:dialog.userNotRegistered")}</p>
                          <p className="text-xs opacity-90">{t("family:dialog.mustRegister")}</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="member-role" className="text-sm font-medium">
                  {t("family:fields.relationship")}
                </label>
                <Select value={selectedRole} onValueChange={(value: string) => setSelectedRole(value as FamilyRole)}>
                  <SelectTrigger id="member-role">
                    <SelectValue placeholder={t("family:dialog.selectRelationship")} />
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
                disabled={!searchQuery.trim() || !selectedRole || isAdding || !searchResult?.exists}
                className="w-full gap-2"
              >
                <UserPlus className="h-4 w-4" />
                {isAdding ? t("family:dialog.adding") : t("family:addMember")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
