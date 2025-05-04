import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";

export const APIRoute = createAPIFileRoute("/api/process-withdraw")({
  GET: async () => {
    return json({ success: true });
  },
});
