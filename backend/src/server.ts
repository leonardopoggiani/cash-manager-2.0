import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import registerRouter from './routes/register.ts';
import loginRouter from './routes/login.ts';
import orderRoutes from './controllers/OrderController.ts';

const app = new Application();
const port = Deno.env.get("PORT") || 3000;

app.use(async (ctx) => {
  ctx.response.body = 'Hello World!';
});

app.use(registerRouter.routes());
app.use(registerRouter.allowedMethods());
app.use(loginRouter.routes());
app.use(loginRouter.allowedMethods());
app.use(orderRoutes.routes());
app.use(orderRoutes.allowedMethods());

app.addEventListener("listen", ({ hostname, port, secure }) => {
  console.log(
    `Server is running on ${secure ? "https://" : "http://"}${hostname ?? "localhost"}:${port}`,
  );
});

await app.listen({ port: +port });
