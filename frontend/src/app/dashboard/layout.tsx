import React, { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { FullPageLoader } from "@/components/ui/FullPageLoader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <Suspense fallback={<FullPageLoader />}>
        {children}
      </Suspense>
    </AppShell>
  );
}