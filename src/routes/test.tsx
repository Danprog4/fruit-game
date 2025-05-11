import { createFileRoute } from "@tanstack/react-router";
import { getImageByLevel } from "~/lib/tree.config";

export const Route = createFileRoute("/test")({
  component: RouteComponent,
});

function RouteComponent() {
  const Image = getImageByLevel(1);
  return <img src={Image} alt="" />;
}
