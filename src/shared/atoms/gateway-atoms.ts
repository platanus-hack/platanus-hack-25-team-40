import { atom } from "jotai";
import { HealthRecordsGateway } from "@/modules/health-records/gateways/gateway-health-records";

// Create gateway instances
const healthRecordsGateway = new HealthRecordsGateway();

// Export as atoms for dependency injection
export const healthRecordsGatewayAtom = atom(healthRecordsGateway);

// Example: Users Gateway (to be implemented)
export const usersGatewayAtom = atom<any | null>(null);

// Initialize gateways atom - call this in your provider if needed for lazy initialization
export const initGatewaysAtom = atom(null, (get, set) => {
  // You can add lazy initialization logic here if needed
  // const healthRecordsGateway = new HealthRecordsGateway();
  // set(healthRecordsGatewayAtom, healthRecordsGateway);
});
