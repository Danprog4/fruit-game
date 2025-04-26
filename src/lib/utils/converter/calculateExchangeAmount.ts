import tokenPrices from "~/tokenPrices";

// Exchange rate calculation based on token prices
const calculateExchangeAmount = (amount: string, from: string, to: string) => {
  if (!amount || isNaN(parseFloat(amount))) {
    return "0";
  }

  // Calculate based on relative token prices
  const fromPrice = tokenPrices[from as keyof typeof tokenPrices];
  const toPrice = tokenPrices[to as keyof typeof tokenPrices];
  const exchangeRate = fromPrice / toPrice;

  return (parseFloat(amount) * exchangeRate).toFixed(6);
};

export default calculateExchangeAmount;
