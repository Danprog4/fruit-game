import Level1 from "../../public/tree/tree1.png";
import Level10 from "../../public/tree/tree10.png";
import Level11 from "../../public/tree/tree11.png";
import Level12 from "../../public/tree/tree12.png";
import Level13 from "../../public/tree/tree13.png";
import Level14 from "../../public/tree/tree14.png";
import Level15 from "../../public/tree/tree15.png";
import Level16 from "../../public/tree/tree16.png";
import Level17 from "../../public/tree/tree17.png";
import Level18 from "../../public/tree/tree18.png";
import Level19 from "../../public/tree/tree19.png";
import Level2 from "../../public/tree/tree2.png";
import Level20 from "../../public/tree/tree20.png";
import Level21 from "../../public/tree/tree21.png";
import Level22 from "../../public/tree/tree22.png";
import Level23 from "../../public/tree/tree23.png";
import Level24 from "../../public/tree/tree24.png";
import Level25 from "../../public/tree/tree25.png";
import Level26 from "../../public/tree/tree26.png";
import Level27 from "../../public/tree/tree27.png";
import Level28 from "../../public/tree/tree28.png";
import Level29 from "../../public/tree/tree29.png";
import Level3 from "../../public/tree/tree3.png";
import Level30 from "../../public/tree/tree30.png";
import Level4 from "../../public/tree/tree4.png";
import Level5 from "../../public/tree/tree5.png";
import Level6 from "../../public/tree/tree6.png";
import Level7 from "../../public/tree/tree7.png";
import Level8 from "../../public/tree/tree8.png";
import Level9 from "../../public/tree/tree9.png";

export const treeConfig = {
  1: Level1,
  2: Level2,
  3: Level3,
  4: Level4,
  5: Level5,
  6: Level6,
  7: Level7,
  8: Level8,
  9: Level9,
  10: Level10,
  11: Level11,
  12: Level12,
  13: Level13,
  14: Level14,
  15: Level15,
  16: Level16,
  17: Level17,
  18: Level18,
  19: Level19,
  20: Level20,
  21: Level21,
  22: Level22,
  23: Level23,
  24: Level24,
  25: Level25,
  26: Level26,
  27: Level27,
  28: Level28,
  29: Level29,
  30: Level30,
  31: Level30,
};

export const getImageByLevel = (level: number) => {
  return treeConfig[level as keyof typeof treeConfig];
};
