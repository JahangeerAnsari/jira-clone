import { z } from "zod";

export const  loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1,"Required"),
  });
  export const  registerSchema = z.object({
    email: z.string().email(),
    name:z.string().min(4, "Required"),
    password: z.string().min(1,"Required"),
  });