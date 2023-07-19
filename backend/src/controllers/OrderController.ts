import { Router, Request, Response } from "https://deno.land/x/oak/mod.ts";
import { Order } from "../models/Order.ts";
import { getRepository } from "https://deno.land/x/typeorm/mod.ts";

const router = new Router();

router.get('/orders', async (ctx) => {
  try {
    const orderRepository = getRepository(Order);
    const orders = await orderRepository.find();

    ctx.response.body = orders;
  } catch (err) {
    console.error(err.message);
    ctx.response.status = 500;
    ctx.response.body = "Server Error";
  }
});

router.post('/orders', async (ctx) => {
  try {
    const { customerName } = await ctx.request.body().value;

    const orderRepository = getRepository(Order);
    const newOrder = orderRepository.create({ customerName });
    const savedOrder = await orderRepository.save(newOrder);

    ctx.response.status = 201;
    ctx.response.body = savedOrder;
  } catch (err) {
    console.error(err.message);
    ctx.response.status = 500;
    ctx.response.body = "Server Error";
  }
});

export default router;
