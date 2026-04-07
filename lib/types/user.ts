export type SubscriptionTier = "free" | "storyteller" | "family_legacy" | "legacy_forever";
export type FamilyRole = "owner" | "storyteller" | "listener" | "heir";
export type TransferTrigger = "inactivity" | "manual" | "date";
export type HeirStatus = "pending" | "notified" | "transferred" | "revoked";

export interface AccessibilityPrefs {
  fontSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
}

export interface Profile {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  bio: string | null;
  accessibilityPrefs: AccessibilityPrefs | null;
  subscriptionTier: SubscriptionTier;
  onboardingComplete: boolean;
  lastActiveAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyGroup {
  id: string;
  name: string;
  ownerId: string;
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMember {
  familyGroupId: string;
  userId: string;
  role: FamilyRole;
  relationship: string | null;
  createdAt: string;
  profile?: Profile;
}

export interface DesignatedHeir {
  id: string;
  ownerId: string;
  heirEmail: string;
  heirUserId: string | null;
  transferTrigger: TransferTrigger;
  inactivityMonths: number;
  transferDate: string | null;
  status: HeirStatus;
  createdAt: string;
  updatedAt: string;
}
