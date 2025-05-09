export type AllianceLevelType = "capacity" | "coefficient" | "profitability";

export interface AllianceLevel {
  level: number;
  price: number;
  value: number;
}

export interface AllianceLevelsConfig {
  capacity: AllianceLevel[];
  coefficient: AllianceLevel[];
  profitability: AllianceLevel[];
}

export const ALLIANCE_LEVELS: AllianceLevelsConfig = {
  capacity: [
    { level: 0, price: 0, value: 1000 },
    { level: 1, price: 5000, value: 2000 },
    { level: 2, price: 20000, value: 3000 },
    { level: 3, price: 50000, value: 4000 },
    { level: 4, price: 100000, value: 6000 },
    { level: 5, price: 200000, value: 8000 },
    { level: 6, price: 500000, value: 10000 },
    { level: 7, price: 1000000, value: 15000 },
    { level: 8, price: 5000000, value: 20000 },
    { level: 9, price: 10000000, value: 30000 },
    { level: 10, price: 20000000, value: 50000 },
  ],

  coefficient: [
    { level: 0, price: 0, value: 0 },
    { level: 1, price: 10000, value: 1.1 },
    { level: 2, price: 20000, value: 1.2 },
    { level: 3, price: 50000, value: 1.3 },
    { level: 4, price: 100000, value: 1.5 },
    { level: 5, price: 150000, value: 1.8 },
    { level: 6, price: 200000, value: 2 },
    { level: 7, price: 300000, value: 2.5 },
    { level: 8, price: 400000, value: 3 },
    { level: 9, price: 500000, value: 4 },
    { level: 10, price: 1000000, value: 5 },
  ],

  profitability: [
    { level: 0, price: 0, value: 0 },
    { level: 1, price: 100000, value: 1 },
    { level: 2, price: 500000, value: 1.5 },
    { level: 3, price: 1000000, value: 2 },
    { level: 4, price: 2000000, value: 2.5 },
    { level: 5, price: 5000000, value: 3 },
    { level: 6, price: 10000000, value: 3.5 },
    { level: 7, price: 15000000, value: 4 },
    { level: 8, price: 20000000, value: 5 },
    { level: 9, price: 25000000, value: 5 },
    { level: 10, price: 50000000, value: 6 },
  ],
};

export const getCurrentAllianceLevelObject = (type: AllianceLevelType, level: number) => {
  return ALLIANCE_LEVELS[type].find((l) => l.level === level);
};

export const getNextAllianceLevelObject = (type: AllianceLevelType, level: number) => {
  return ALLIANCE_LEVELS[type].find((l) => l.level === level + 1);
};

export const getNextAllianceLevelPrice = (type: AllianceLevelType, level: number) => {
  const nextLevel = getNextAllianceLevelObject(type, level);
  if (!nextLevel) {
    return 0;
  }
  return nextLevel.price;
};
