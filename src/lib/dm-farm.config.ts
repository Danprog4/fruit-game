export interface FarmLevel {
  level: number;
  incomePerHour: number;
  priceInStars: number;
  priceInTgStars: number;
  bonusPercentage?: number;
}

export const farmLevels: FarmLevel[] = [
  { level: 1, incomePerHour: 1, priceInStars: 0, priceInTgStars: 0 },
  { level: 2, incomePerHour: 2, priceInStars: 100, priceInTgStars: 10 },
  { level: 3, incomePerHour: 4, priceInStars: 500, priceInTgStars: 3 },
  { level: 4, incomePerHour: 6, priceInStars: 1000, priceInTgStars: 50 },
  { level: 5, incomePerHour: 8, priceInStars: 1500, priceInTgStars: 70 },
  { level: 6, incomePerHour: 10, priceInStars: 2000, priceInTgStars: 90 },
  { level: 7, incomePerHour: 12, priceInStars: 3000, priceInTgStars: 100 },
  { level: 8, incomePerHour: 14, priceInStars: 4000, priceInTgStars: 140 },
  { level: 9, incomePerHour: 16, priceInStars: 5000, priceInTgStars: 180 },
  {
    level: 10,
    incomePerHour: 18,
    priceInStars: 6000,
    priceInTgStars: 200,
    bonusPercentage: 1,
  },
  { level: 11, incomePerHour: 20, priceInStars: 10000, priceInTgStars: 230 },
  { level: 12, incomePerHour: 30, priceInStars: 15000, priceInTgStars: 260 },
  { level: 13, incomePerHour: 40, priceInStars: 20000, priceInTgStars: 290 },
  { level: 14, incomePerHour: 50, priceInStars: 25000, priceInTgStars: 300 },
  { level: 15, incomePerHour: 60, priceInStars: 30000, priceInTgStars: 350 },
  { level: 16, incomePerHour: 70, priceInStars: 35000, priceInTgStars: 400 },
  { level: 17, incomePerHour: 80, priceInStars: 40000, priceInTgStars: 450 },
  { level: 18, incomePerHour: 100, priceInStars: 45000, priceInTgStars: 500 },
  { level: 19, incomePerHour: 150, priceInStars: 100000, priceInTgStars: 600 },
  {
    level: 20,
    incomePerHour: 200,
    priceInStars: 150000,
    priceInTgStars: 700,
    bonusPercentage: 3,
  },
  { level: 21, incomePerHour: 250, priceInStars: 200000, priceInTgStars: 800 },
  { level: 22, incomePerHour: 300, priceInStars: 250000, priceInTgStars: 900 },
  { level: 23, incomePerHour: 350, priceInStars: 300000, priceInTgStars: 1000 },
  { level: 24, incomePerHour: 400, priceInStars: 500000, priceInTgStars: 1500 },
  { level: 25, incomePerHour: 500, priceInStars: 700000, priceInTgStars: 2000 },
  { level: 26, incomePerHour: 600, priceInStars: 900000, priceInTgStars: 2500 },
  { level: 27, incomePerHour: 700, priceInStars: 1000000, priceInTgStars: 3000 },
  { level: 28, incomePerHour: 1000, priceInStars: 2000000, priceInTgStars: 3500 },
  { level: 29, incomePerHour: 2000, priceInStars: 3000000, priceInTgStars: 4000 },
  {
    level: 30,
    incomePerHour: 3000,
    priceInStars: 4000000,
    priceInTgStars: 5000,
    bonusPercentage: 5,
  },
  { level: 31, incomePerHour: 3100, priceInStars: 5000000, priceInTgStars: 5100 },
  { level: 32, incomePerHour: 3200, priceInStars: 6000000, priceInTgStars: 5200 },
  { level: 33, incomePerHour: 3300, priceInStars: 7000000, priceInTgStars: 5300 },
  { level: 34, incomePerHour: 3400, priceInStars: 8000000, priceInTgStars: 5400 },
  {
    level: 35,
    incomePerHour: 3500,
    priceInStars: 9000000,
    priceInTgStars: 5500,
    bonusPercentage: 7,
  },
  { level: 36, incomePerHour: 3600, priceInStars: 10000000, priceInTgStars: 5600 },
  { level: 37, incomePerHour: 3700, priceInStars: 11000000, priceInTgStars: 5700 },
  { level: 38, incomePerHour: 3800, priceInStars: 12000000, priceInTgStars: 5800 },
  { level: 39, incomePerHour: 3900, priceInStars: 13000000, priceInTgStars: 5900 },
  {
    level: 40,
    incomePerHour: 4000,
    priceInStars: 14000000,
    priceInTgStars: 6000,
    bonusPercentage: 10,
  },
  { level: 41, incomePerHour: 4100, priceInStars: 15000000, priceInTgStars: 6100 },
  { level: 42, incomePerHour: 4200, priceInStars: 16000000, priceInTgStars: 6200 },
  { level: 43, incomePerHour: 4300, priceInStars: 17000000, priceInTgStars: 6300 },
  { level: 44, incomePerHour: 4400, priceInStars: 18000000, priceInTgStars: 6400 },
  {
    level: 45,
    incomePerHour: 4500,
    priceInStars: 19000000,
    priceInTgStars: 10000,
    bonusPercentage: 15,
  },
  { level: 46, incomePerHour: 4600, priceInStars: 20000000, priceInTgStars: 11000 },
  { level: 47, incomePerHour: 4700, priceInStars: 21000000, priceInTgStars: 12000 },
  { level: 48, incomePerHour: 4800, priceInStars: 22000000, priceInTgStars: 13000 },
  { level: 49, incomePerHour: 4900, priceInStars: 23000000, priceInTgStars: 14000 },
  {
    level: 50,
    incomePerHour: 5000,
    priceInStars: 24000000,
    priceInTgStars: 20000,
    bonusPercentage: 20,
  },
];

export const getNextFarmLevel = (currentLevel: number): FarmLevel | null => {
  if (currentLevel >= 50) return null;
  return farmLevels.find((level) => level.level === currentLevel + 1) || null;
};

export const getFarmLevelByLevel = (level: number): FarmLevel | null => {
  return farmLevels.find((item) => item.level === level) || null;
};

export const getMaxFarmLevel = (): number => {
  return 50;
};

export default {
  farmLevels,
  getNextFarmLevel,
  getFarmLevelByLevel,
  getMaxFarmLevel,
};
