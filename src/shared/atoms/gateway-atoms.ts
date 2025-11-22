import { atom } from "jotai";
import { HealthRecordsGateway } from "@/modules/health-records/gateways/gateway-health-records";
import { FamilyMembersGateway } from "@/modules/family-members/gateways/gateway-family-members";
import { SuggestionsGateway } from "@/modules/suggestions/gateways/gateway-suggestions";

/**
 * Gateway dependency injection atoms
 * These provide gateway instances to other atoms
 */
export const healthRecordsGatewayAtom = atom(new HealthRecordsGateway());
export const gatewayFamilyMembersAtom = atom(new FamilyMembersGateway());
export const suggestionsGatewayAtom = atom(new SuggestionsGateway());
