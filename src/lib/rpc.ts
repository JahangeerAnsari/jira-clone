// lib/rpc.ts
import { hc } from "hono/client";
import type { AppType } from "@/app/api/[[...route]]/route";

// ✅ BEST PRACTICE: Explicitly type the client
export const client = hc<AppType>(
  process.env.NEXT_PUBLIC_API_URL!
) as ReturnType<typeof hc<AppType>>;
