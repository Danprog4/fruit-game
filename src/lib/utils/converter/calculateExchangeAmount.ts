import { FARMS_CONFIG } from "farms.config";

// Exchange rate calculation based on farm config rates
const calculateExchangeAmount = (amount: string, from: string, to: string) => {
  if (!amount || isNaN(parseFloat(amount))) {
    return "0";
  }

  // Get the farm config for both tokens
  const fromFarm = FARMS_CONFIG.find((farm) => farm.tokenName === from);
  const toFarm = FARMS_CONFIG.find((farm) => farm.tokenName === to);

  // If either token is FRU, use the rateFru value
  if (from === "FRU" && toFarm) {
    return (parseFloat(amount) * toFarm.rateFru).toFixed(6);
  } else if (to === "FRU" && fromFarm) {
    return (parseFloat(amount) / fromFarm.rateFru).toFixed(6);
  }

  // If neither token is FRU, convert through FRU
  if (fromFarm && toFarm) {
    const amountInFru = parseFloat(amount) / fromFarm.rateFru;
    return (amountInFru * toFarm.rateFru).toFixed(6);
  }

  // If from and to are the same token, return the same amount
  if (from === to) {
    return parseFloat(amount).toFixed(6);
  }

  // Fallback case if farm configs aren't found
  return (parseFloat(amount) * fromFarm!.rateFru).toFixed(6);
};

export default calculateExchangeAmount;
