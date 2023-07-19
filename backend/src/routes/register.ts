import { Router, Request, Response } from "https://deno.land/x/oak/mod.ts";
import { hash } from "https://deno.land/x/bcrypt/mod.ts";
import connection from '../database/database.ts';

const router = new Router();

router.post('/register', async (ctx) => {
  try {
    const { username, password } = await ctx.request.body().value;

    const hashedPassword = await hash(password, "10");

    const result = await connection.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
      [username, hashedPassword]
    );

    ctx.response.status = 201;
    ctx.response.body = result.rows[0];
  } catch (err) {
    console.error(err.message);
    ctx.response.status = 500;
    ctx.response.body = 'Server Error';
  }
});

export default router;
