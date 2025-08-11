import { Elysia } from "elysia";
import { API_ROUTER } from "./router/api";
import swagger from "@elysiajs/swagger";

const app = new Elysia()
app.use(swagger())
app.use(API_ROUTER)


.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.url}`
);
