import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "@tanstack/react-router";

import { queryClient } from "@/app/query-client";
import { router } from "@/app/router";
import { registerSessionExpiredHandler } from "@/features/auth";
import "@fontsource/roboto-mono/latin-400.css";
import "@fontsource/roboto-mono/latin-500.css";
import "@fontsource/roboto-mono/latin-700.css";
import "@/index.css";

const mocksEnabled = import.meta.env.VITE_ENABLE_MOCKS !== "false";

async function bootstrap() {
  if (mocksEnabled) {
    const { startMockWorker } = await import("@/mocks/browser");
    await startMockWorker();
  }

  registerSessionExpiredHandler();

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </StrictMode>
  );
}

void bootstrap();
