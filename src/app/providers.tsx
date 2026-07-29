"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "@/features/auth";

export function Providers({ children }: { children: ReactNode }) {
  // One QueryClient per browser session (not per render) -- useState's
  // lazy initializer runs once. Doc 06 Sec 2/7.2: no optimistic updates for
  // business-rule-governed writes, so defaults are left conservative here;
  // individual mutations opt into anything fancier per-call.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>{children}</SessionProvider>
    </QueryClientProvider>
  );
}
