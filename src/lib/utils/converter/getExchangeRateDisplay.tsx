import tokenPrices from "~/tokenPrices";

// Calculate exchange rate display
const getExchangeRateDisplay = (fromToken: string, toToken: string) => {
  const fromPrice = tokenPrices[fromToken as keyof typeof tokenPrices];
  const toPrice = tokenPrices[toToken as keyof typeof tokenPrices];
  const rate = (fromPrice / toPrice).toFixed(6);
  return `1 ${fromToken} = ${rate} ${toToken}`;
};

export default getExchangeRateDisplay;
