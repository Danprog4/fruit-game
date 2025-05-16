import type { QueryClient } from "@tanstack/react-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import {
  backButton,
  init,
  mockTelegramEnv,
  swipeBehavior,
  viewport,
} from "@telegram-apps/sdk-react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "~/components/AuthProvider";
import appCss from "~/lib/styles/app.css?url";
import { useTRPC } from "~/trpc/init/react";
import { TRPCRouter } from "~/trpc/init/router";

import { Buffer } from "buffer";
import { ImagePreload } from "~/components/ImagePreload";
import { Navbar } from "~/components/Navbar";
import { useTaskStatusPolling } from "~/hooks/useTasks";
import { activateLocale, defaultLocale } from "~/i18n";

if (typeof window !== "undefined" && !window.Buffer) {
  window.Buffer = Buffer;
}

// now anywhere in your client code you can:
const buf = Buffer.from("hello world");
console.log(buf.toString("hex"));

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  trpc: TRPCOptionsProxy<TRPCRouter>;
}>()({
  ssr: false,
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, maximum-scale=1",
      },
      {
        title: "React TanStarter",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  useEffect(() => {
    const themeParams = {
      accent_text_color: "#6ab2f2",
      bg_color: "#17212b",
      button_color: "#5288c1",
      button_text_color: "#ffffff",
      destructive_text_color: "#ec3942",
      header_bg_color: "#17212b",
      hint_color: "#708499",
      link_color: "#6ab3f3",
      secondary_bg_color: "#232e3c",
      section_bg_color: "#17212b",
      section_header_text_color: "#6ab3f3",
      subtitle_text_color: "#708499",
      text_color: "#f5f5f5",
    } as const;

    if (import.meta.env.DEV) {
      mockTelegramEnv({
        launchParams: {
          tgWebAppPlatform: "web",
          tgWebAppVersion: "8.0.0",
          tgWebAppData: import.meta.env.VITE_MOCK_INIT_DATA,
          tgWebAppThemeParams: themeParams,
          tgWebAppStartParam: "ref=3",
        },
      });
    }

    init();

    backButton.mount();

    if (swipeBehavior.mount.isAvailable()) {
      swipeBehavior.mount();
      swipeBehavior.isMounted();
      swipeBehavior.disableVertical();
      swipeBehavior.isVerticalEnabled();
    }

    if (viewport.expand.isAvailable()) {
      viewport.expand();
    }
  }, []);

  useTaskStatusPolling();

  return (
    <RootDocument>
      <ImagePreload />

      <AuthProvider>
        <TonConnectUIProvider
          manifestUrl="https://fruit-game-eight.vercel.app/tonconnect-manifest.json"
          actionsConfiguration={{
            twaReturnUrl: "https://t.me/FruitUtopia_bot",
          }}
        >
          <Outlet />
          <Navbar />
        </TonConnectUIProvider>
      </AuthProvider>
    </RootDocument>
  );
}

const isDev = import.meta.env.DEV;
const isErudaEnabled = import.meta.env.VITE_ERUDA_ENABLED === "true";

function RootDocument({ children }: { readonly children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const { data: user } = useQuery(trpc.main.getUser.queryOptions());
  const prefetch = async () => {
    // await queryClient.prefetchQuery(trpc.main.getFriends.queryOptions());
    await queryClient.prefetchQuery(trpc.main.getUser.queryOptions());
    await queryClient.prefetchQuery(trpc.alliances.getAlliances.queryOptions());
    await queryClient.prefetchQuery(trpc.alliances.getSeason.queryOptions());
  };

  useEffect(() => {
    if (isDev && isErudaEnabled) {
      import("eruda").then((eruda) => {
        eruda.default.init();
      });
    }
  }, []);

  useEffect(() => {
    prefetch();
  }, []);

  useEffect(() => {
    console.log(user?.language, "user?.language");
    activateLocale(user?.language || defaultLocale);
  }, [user?.language]);

  return (
    <html className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              backgroundColor: "#85BF1A",
              color: "#fff",
              borderRadius: "16px",
              border: "1px solid #76AD10",
            },
          }}
        />
        <Scripts />
      </body>
    </html>
  );
}
