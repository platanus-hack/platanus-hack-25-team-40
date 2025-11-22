import { atom } from "jotai";
import { HealthRecordsGateway } from "@/modules/health-records/gateways/gateway-health-records";

/**
 * Gateway dependency injection atoms
 * These provide gateway instances to other atoms
 */
export const healthRecordsGatewayAtom = atom(new HealthRecordsGateway());
