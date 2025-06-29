import { fastify } from 'fastify';
import { custom, z } from "zod";
import { serializerCompiler, validatorCompiler, type ZodTypeProvider
} from "fastify-type-provider-zod";
import { channels } from '../broker/channels/index.ts';
import fastifyCors from '@fastify/cors';
import { db } from '../db/client.ts';
import { schema } from '../db/schema/index.ts';
import { dispatchOrderCreated } from '../broker/messages/order-created.ts';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.register(fastifyCors, { origin: "*"})

app.get("/health", async () => {
  return "OK";
});

app.post("/orders", {
  schema: {
    body: z.object({
      amount: z.number().min(1),
    })
  }
},
  async (request, reply) => {
  const { amount } = request.body;  
  
  console.log("[Order] Order created with amount:", amount);

  const orderId = crypto.randomUUID();
  const customerId = crypto.randomUUID();

  dispatchOrderCreated({
    orderId,
    amount,
    customer: {
      id: customerId
    }
  })

  db.insert(schema.orders).values({
    id: orderId,
    customerId: customerId,
    amount
  })

  return reply.status(201).send();
})

app.listen({ port: 3000, host: "0.0.0.0"}).then(() => {
  console.log("[Order] HTTP Server running");
})
