import { createFileRoute } from "@tanstack/react-router";
import { TonConnectButton } from "@tonconnect/ui-react";

export const Route = createFileRoute("/wallet")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="text-center text-white">
      <header>
        <span>My App with React UI</span>
        <TonConnectButton />
      </header>
    </div>
  );
}
