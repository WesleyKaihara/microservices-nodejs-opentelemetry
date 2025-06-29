import "@opentelemetry/auto-instrumentations-node/register";

import { fastify } from "fastify";
import { z } from "zod";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import fastifyCors from "@fastify/cors";
import { dispatchOrderCreated } from "../broker/messages/order-created.ts";

import { setTimeout } from "node:timers/promises"
import { trace } from "@opentelemetry/api";
import { tracer } from '../tracer/tracer.ts';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.register(fastifyCors, { origin: "*" });

app.get("/health", async () => {
  return "OK";
});

app.post(
  "/orders",
  {
    schema: {
      body: z.object({
        amount: z.number().min(1),
      }),
    },
  },
  async (request, reply) => {
    const { amount } = request.body;

    console.log("[Order] Order created with amount:", amount);

    const orderId = crypto.randomUUID();
    const customerId = crypto.randomUUID();

    // db.insert(schema.orders).values({
    //   id: orderId,
    //   customerId: customerId,
    //   amount,
    // });

    const span = tracer.startSpan("DEU RUIM");
    await setTimeout(2000);

    span.setAttribute("teste", "Hello World");
    span.end();

    trace.getActiveSpan()?.setAttribute("order_id", orderId);

    dispatchOrderCreated({
      orderId,
      amount,
      customer: {
        id: customerId,
      },
    });

    return reply.status(201).send();
  }
);

app.listen({ port: 3000, host: "0.0.0.0" }).then(() => {
  console.log("[Order] HTTP Server running");
});
