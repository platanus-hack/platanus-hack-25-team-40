/**
 * Family relationship roles
 */
export const FamilyRole = {
  MOTHER: "mother",
  FATHER: "father",
  SON: "son",
  DAUGHTER: "daughter",
  BROTHER: "brother",
  SISTER: "sister",
  GRANDFATHER: "grandfather",
  GRANDMOTHER: "grandmother",
  GRANDSON: "grandson",
  GRANDDAUGHTER: "granddaughter",
  UNCLE: "uncle",
  AUNT: "aunt",
  NEPHEW: "nephew",
  NIECE: "niece",
  COUSIN: "cousin",
  SPOUSE: "spouse",
  PARTNER: "partner",
  OTHER: "other",
} as const;

export type FamilyRole = typeof FamilyRole[keyof typeof FamilyRole];

/**
 * Family member/link in the system
 */
export interface FamilyMember {
  id: string;
  userId: string; // The user ID in the system (if they have an account)
  email: string;
  name: string;
  role: FamilyRole;
  linkedBy: string; // User ID who created the link
  createdAt: string;
  updatedAt: string;
}

/**
 * Input for creating a new family link
 */
export interface CreateFamilyLinkInput {
  email: string;
  name: string;
  role: FamilyRole;
}

/**
 * Input for updating a family link
 */
export interface UpdateFamilyLinkInput {
  id: string;
  name?: string;
  role?: FamilyRole;
}

/**
 * Get human-readable label for a family role
 */
export function getFamilyRoleLabel(role: FamilyRole): string {
  const labels: Record<FamilyRole, string> = {
    [FamilyRole.MOTHER]: "Mother",
    [FamilyRole.FATHER]: "Father",
    [FamilyRole.SON]: "Son",
    [FamilyRole.DAUGHTER]: "Daughter",
    [FamilyRole.BROTHER]: "Brother",
    [FamilyRole.SISTER]: "Sister",
    [FamilyRole.GRANDFATHER]: "Grandfather",
    [FamilyRole.GRANDMOTHER]: "Grandmother",
    [FamilyRole.GRANDSON]: "Grandson",
    [FamilyRole.GRANDDAUGHTER]: "Granddaughter",
    [FamilyRole.UNCLE]: "Uncle",
    [FamilyRole.AUNT]: "Aunt",
    [FamilyRole.NEPHEW]: "Nephew",
    [FamilyRole.NIECE]: "Niece",
    [FamilyRole.COUSIN]: "Cousin",
    [FamilyRole.SPOUSE]: "Spouse",
    [FamilyRole.PARTNER]: "Partner",
    [FamilyRole.OTHER]: "Other",
  };
  return labels[role];
}

/**
 * Get all family roles for selection
 */
export function getAllFamilyRoles(): Array<{ value: FamilyRole; label: string }> {
  return Object.values(FamilyRole).map((role) => ({
    value: role,
    label: getFamilyRoleLabel(role),
  }));
}
