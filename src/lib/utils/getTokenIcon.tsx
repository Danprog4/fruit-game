import { Token } from "~/components/icons/Token";
import { FARMS_CONFIG } from "~/lib/farms.config";

export const getTokenIcon = (tokenName: string) => {
  const farm = FARMS_CONFIG.find((farm) => farm.tokenName === tokenName);
  return farm ? farm.icon : <Token width={28} height={28} viewBox="0 0 34 34" />; // Default icon if token not found in farms
};
