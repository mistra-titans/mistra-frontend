import { Elysia } from "elysia";
import { API_ROUTER } from "./router/api";
import swagger from "@elysiajs/swagger";
import { cors } from '@elysiajs/cors'

const app = new Elysia()
app.use(cors({
  origin: ["*"]
}))
app.use(swagger({
  documentation: {
    info: {
      title: "Mistra Transaction Service",
      description: "API documentation for Mistra Transaction Service",
      version: "1.0.0",
    }
  }
}))
app.use(API_ROUTER)


.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.url}`
);
