import { Request, Response } from "https://deno.land/x/oak/mod.ts";
import { getRepository } from "https://deno.land/x/typeorm/mod.ts";
import { User } from "../models/User.ts";
import { compareSync } from "https://deno.land/x/bcrypt/mod.ts";
import { create } from "https://deno.land/x/djwt/mod.ts";

export class AuthController {
  static login = async (ctx: any) => {
    const { username, password } = await ctx.request.body().value;

    const userRepository = getRepository(User);
    let user: User;

    try {
      user = await userRepository.findOneOrFail({ where: { username } });
    } catch (error) {
      ctx.response.status = 401;
      ctx.response.body = { message: "Username or password incorrect!" };
      return;
    }

    // Check password
    if (!compareSync(password, user.password)) {
      ctx.response.status = 401;
      ctx.response.body = { message: "Username or password incorrect!" };
      return;
    }

    const token = create(
      { alg: "HS256", typ: "JWT" },
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    ctx.response.body = { message: "Login successful", token };
  };

  static changePassword = async (ctx: any) => {
    // To be implemented
  };
}
