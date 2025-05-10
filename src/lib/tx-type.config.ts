export const TX_TYPE_CONFIG = {
  STRAWBERRY_FARM: "Straberry Farm",
  CHERRY_FARM: "Cherry Farm",
  COCONUT_FARM: "Coconut Farm",
} as const;

export type AllianceTxType =
  | "Alliance capacity"
  | "Alliance coefficient"
  | "Alliance profitability";

export const ALLIANCE_TX_TYPES: AllianceTxType[] = [
  "Alliance capacity",
  "Alliance coefficient",
  "Alliance profitability",
] as const;

export const ALLIANCE_TX_TYPE_MAPPING = {
  "Alliance capacity": "capacity",
  "Alliance coefficient": "coefficient",
  "Alliance profitability": "profitability",
} as const;

export const ALLIANCE_TX_TYPE_MAPPING_REVERSE = {
  capacity: "Alliance capacity",
  coefficient: "Alliance coefficient",
  profitability: "Alliance profitability",
} as const;

export const ALLIANCE_CREATION_TX_TYPES = ["alliance"];

export const ALL_TX_TYPES = [
  ...Object.values(TX_TYPE_CONFIG),
  ...ALLIANCE_TX_TYPES,
  ...ALLIANCE_CREATION_TX_TYPES,
];
