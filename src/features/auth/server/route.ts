import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { loginSchema, registerSchema } from "../schemas";
import { createAdminClient } from "@/lib/appwrite";
import { ID } from "node-appwrite";
import {setCookie} from "hono/cookie"
import { AUTH_COOKIES } from "../constants";
const app = new Hono().post(
  "/login",
  zValidator( "json", loginSchema),(c) => {
    const {email,password} = c.req.valid("json");
    return c.json({
      email,password
    })
  }
).post("/register",zValidator("json",registerSchema),async (c)=>{
  const {email,name,password} = c.req.valid("json");
  const {account} = await createAdminClient();
  const user = await account.create(
    ID.unique(),
    email,
    password,
    name
  );
  const session = await account.createEmailPasswordSession(email,password)
setCookie(c,AUTH_COOKIES,session.secret,{
  path:"/",
  httpOnly:true,
  secure:true,
  sameSite:"strict",
  maxAge:60 * 60 * 24 * 30
})
  return c.json({
    data:user
  })
})
export default app;
