import { atom } from "jotai";
import { HealthRecordsGateway } from "@/modules/health-records/gateways/gateway-health-records";
import { FamilyMembersGateway } from "@/modules/family-members/gateways/gateway-family-members";
import { ProfileGateway } from "@/modules/profile/gateways/gateway-profile";

/**
 * Gateway dependency injection atoms
 * These provide gateway instances to other atoms
 */
export const healthRecordsGatewayAtom = atom(new HealthRecordsGateway());
export const gatewayFamilyMembersAtom = atom(new FamilyMembersGateway());
export const profileGatewayAtom = atom(new ProfileGateway());
