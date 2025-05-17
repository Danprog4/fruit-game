export const FRIENDS_CONFIG = [
  {
    level: 1,
    maxFarms: 10,
    description: "количество ферм меньше 10",
  },
  {
    level: 2,
    maxFarms: 20,
    description: "количество ферм меньше 20",
  },
  {
    level: 3,
    maxFarms: 30,
    description: "количество ферм меньше 30",
  },
  {
    level: 4,
    maxFarms: 50,
    description: "количество ферм меньше 50",
  },
  {
    level: 5,
    maxFarms: 80,
    description: "количество ферм меньше 80",
  },
  {
    level: 6,
    maxFarms: 130,
    description: "количество ферм меньше 130",
  },
  {
    level: 7,
    maxFarms: 210,
    description: "количество ферм меньше 210",
  },
  {
    level: 8,
    maxFarms: 340,
    description: "количество ферм меньше 340",
  },
  {
    level: 9,
    maxFarms: 550,
    description: "количество ферм меньше 550",
  },
];

export type FriendLevel = (typeof FRIENDS_CONFIG)[number];
export const getFriendLevel = (farmCount: number): number => {
  for (let i = 0; i < FRIENDS_CONFIG.length; i++) {
    if (farmCount < FRIENDS_CONFIG[i].maxFarms) {
      return FRIENDS_CONFIG[i].level;
    }
  }
  return FRIENDS_CONFIG[0].level;
};
