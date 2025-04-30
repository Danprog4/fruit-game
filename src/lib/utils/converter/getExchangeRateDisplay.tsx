import { FARMS_CONFIG } from "~/lib/farms.config";

// Calculate exchange rate display based on farm config rates
const getExchangeRateDisplay = (fromToken: string, toToken: string) => {
  // Get the farm config for both tokens
  const fromFarm = FARMS_CONFIG.find((farm) => farm.tokenName === fromToken);
  const toFarm = FARMS_CONFIG.find((farm) => farm.tokenName === toToken);

  let rate = "0";

  // If either token is FRU, use the rateFru value
  if (fromToken === "FRU" && toFarm) {
    rate = toFarm.rateFru.toFixed(6);
  } else if (toToken === "FRU" && fromFarm) {
    rate = (1 / fromFarm.rateFru).toFixed(6);
  }
  // If neither token is FRU, convert through FRU
  else if (fromFarm && toFarm) {
    const rateInFru = 1 / fromFarm.rateFru;
    rate = (rateInFru * toFarm.rateFru).toFixed(6);
  }
  // If from and to are the same token, rate is 1
  else if (fromToken === toToken) {
    rate = "1.000000";
  }

  return `1 ${fromToken} = ${rate} ${toToken}`;
};

export default getExchangeRateDisplay;
