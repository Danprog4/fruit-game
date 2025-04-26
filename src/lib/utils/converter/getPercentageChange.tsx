// Fake percentage change
const getPercentageChange = () => {
  // Generate random percentage between -10% and +50%
  const randomChange = (Math.random() * 60 - 10).toFixed(2);
  const isPositive = parseFloat(randomChange) >= 0;
  return {
    value: randomChange,
    isPositive,
  };
};

export default getPercentageChange;
