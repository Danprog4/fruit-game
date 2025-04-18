import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { backButton, init, mockTelegramEnv } from "@telegram-apps/sdk-react";
import { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "~/components/AuthProvider";
import appCss from "~/lib/styles/app.css?url";
import { TRPCRouter } from "~/trpc/init/router";

// Define Telegram WebApp types to fix TypeScript errors
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        expand: () => void;
        version: string;
        disableVerticalSwipes: () => void;
        platform: string;
        requestFullscreen: () => void;
        lockOrientation: () => void;
        enableClosingConfirmation: () => void;
      };
    };
  }
}

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
        content: "width=device-width, initial-scale=1",
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
  }, []);

  // Set up Telegram WebApp mock in development mode or configure for production

  // Configure Telegram WebApp features if it exists
  if (window.Telegram && window.Telegram.WebApp) {
    try {
      window.Telegram.WebApp.expand();
      const telegramVersion = Number(window.Telegram.WebApp.version);

      if (telegramVersion >= 7.7) {
        // We're handling scrolling ourselves, so prevent Telegram's swipe gestures
        window.Telegram.WebApp.disableVerticalSwipes();
      }

      const isMobile =
        window.Telegram.WebApp.platform === "ios" ||
        window.Telegram.WebApp.platform === "android" ||
        window.Telegram.WebApp.platform === "android_x";

      // Enable proper scrolling for mobile devices
      if (isMobile) {
        // Add a class to the body element to indicate we're on mobile
        document.body.classList.add("telegram-mobile");

        // Set up the app container for scrolling
        const rootElement = document.getElementById("root");
        if (rootElement) {
          rootElement.classList.add("telegram-app-container");
          rootElement.style.overflowY = "auto";
          rootElement.style.height = "100%";
          (rootElement.style as any)["-webkit-overflow-scrolling"] = "touch";
        }
      }

      if (telegramVersion >= 8 && isMobile) {
        window.Telegram.WebApp.requestFullscreen();
        window.Telegram.WebApp.lockOrientation();
      }

      // Enable closing confirmation
      window.Telegram.WebApp.enableClosingConfirmation();
    } catch (e) {
      console.warn("Error configuring Telegram WebApp:", e);
    }
  }

  return (
    <RootDocument>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </RootDocument>
  );
}

const isDev = import.meta.env.DEV;
const isErudaEnabled = import.meta.env.VITE_ERUDA_ENABLED === "true";

function RootDocument({ children }: { readonly children: React.ReactNode }) {
  useEffect(() => {
    if (isDev && isErudaEnabled) {
      import("eruda").then((eruda) => {
        eruda.default.init();
      });
    }
  }, []);

  return (
    // suppress since we're updating the "dark" class in a custom script below
    <html suppressHydrationWarning>
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
