import Level1 from "../../public/tree/tree1.png";
import Level2 from "../../public/tree/tree2.png";
import Level3 from "../../public/tree/tree3.png";
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
};

export const getImageByLevel = (level: number) => {
  return treeConfig[level as keyof typeof treeConfig];
};
