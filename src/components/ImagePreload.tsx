import { treeConfig } from "~/lib/tree.config";

export const ImagePreload = () => {
  return (
    <>
      {Object.values(treeConfig).map((level) => (
        <img key={level} src={level} />
      ))}
    </>
  );
};
