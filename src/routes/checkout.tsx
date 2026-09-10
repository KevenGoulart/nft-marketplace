import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireAuth } from "@/features/auth";

export const Route = createFileRoute("/checkout")({
  beforeLoad: requireAuth,
  component: () => <Outlet />,
});
