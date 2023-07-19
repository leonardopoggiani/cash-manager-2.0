import { Router } from "https://deno.land/x/oak/mod.ts";
import { create, Payload } from "https://deno.land/x/djwt/mod.ts";

const router = new Router();

router.post("/login", async (ctx) => {
  try {
    const jwtPayload: Payload = {
      id: 1,
      username: "john_doe",
      role: "admin",
    };

    const secretKeyString = Deno.env.get("SECRET_KEY");

    if (!secretKeyString) {
      throw new Error("Secret key not found in environment variables.");
    }

    const secretKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secretKeyString),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const token = await create(
      { alg: "HS256", typ: "JWT" },
      jwtPayload,
      secretKey
    );

    ctx.response.body = { token };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = "Server Error";
  }
});

export default router;
