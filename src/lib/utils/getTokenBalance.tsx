import { FARMS_CONFIG } from "farms.config";

export const getTokenBalance = (tokenName: string, balances: Record<string, number>) => {
  const farm = FARMS_CONFIG.find((farm) => farm.tokenName === tokenName);

  const balanceKey = farm?.id!;
  // Format the balance to show only 3 decimal places
  const balance = balances?.[balanceKey] || 0;
  return Number(balance.toFixed(3)) || 0;
};
