import { redirect } from "@tanstack/react-router";
import { queryClient } from "@/app/query-client";
import { sessionQueryOptions } from "./queries";

export async function requireAuth({ location }: { location: { href: string } }) {
  try {
    await queryClient.ensureQueryData(sessionQueryOptions);
  } catch {
    throw redirect({ to: "/login", search: { redirect: location.href } });
  }
}
