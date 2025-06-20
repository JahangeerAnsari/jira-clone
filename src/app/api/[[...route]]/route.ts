import {Hono} from "hono";
import {handle} from "hono/vercel"
const app = new Hono().basePath("/api");
app.get("/hello",(c) =>{
    return c.json({
        hello:"world"
    })
})

// redirect this hono to GET Method
export const GET = handle(app);