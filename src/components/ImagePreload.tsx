import { treeConfig } from "~/lib/tree.config";

export const ImagePreload = () => {
  return (
    <>
      {Object.values(treeConfig).map((level) => (
        <img
          className="pointer-events-none invisible absolute -translate-x-[2000px] -translate-y-[2000px]"
          key={level}
          src={level}
        />
      ))}
    </>
  );
};
