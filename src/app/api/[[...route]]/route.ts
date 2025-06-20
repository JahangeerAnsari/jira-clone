import {Hono} from "hono";
import {handle} from "hono/vercel";
import auth from "@/features/auth/server/route"
const app = new Hono().basePath("/api");
// base url for auth
const routes = app.route("/auth",auth)

// redirect this hono to GET Method
export const GET = handle(app);
export type AppType = typeof routes;