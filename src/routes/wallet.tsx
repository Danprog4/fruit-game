import { createFileRoute } from "@tanstack/react-router";
import { TonConnectButton } from "@tonconnect/ui-react";

export const Route = createFileRoute("/wallet")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="text-center text-white">
      <header className="flex items-center justify-between p-4">
        <div className="ml-auto">
          <div className="relative">
            <button className="rounded-full bg-[#6ab3f3] px-4 py-2 font-medium text-white transition-colors hover:bg-[#5288c1]">
              Connect Wallet
            </button>
            <div className="absolute inset-0 opacity-0">
              <TonConnectButton className="h-full w-full" />
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
