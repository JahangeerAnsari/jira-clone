import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { loginSchema, registerSchema } from "../schemas";
import { createAdminClient } from "@/lib/appwrite";
import { ID } from "node-appwrite";
import { setCookie ,deleteCookie} from "hono/cookie";
import { AUTH_COOKIES } from "../constants";
import { success } from "zod/v4";

const app = new Hono()
  .post("/login", zValidator("json", loginSchema), async (c) => {
    const { email, password } = c.req.valid("json");
    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);
    setCookie(c, AUTH_COOKIES, session.secret, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30,
    });
    return c.json({
      success: true,
    });
  })
  .post("/register", zValidator("json", registerSchema), async (c) => {
    const { email, name, password } = c.req.valid("json");
    const { account } = await createAdminClient();
    await account.create(ID.unique(), email, password, name);
    const session = await account.createEmailPasswordSession(email, password);
    setCookie(c, AUTH_COOKIES, session.secret, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30,
    });
    return c.json({
      success: true,
    });
  }).post("/logout",(c) =>{
    deleteCookie(c,AUTH_COOKIES);
    return c.json({success:true})
  })
export default app;
