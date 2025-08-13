import { Elysia } from "elysia";
import { API_ROUTER } from "./router/api";
import swagger from "@elysiajs/swagger";
import { cors } from '@elysiajs/cors'
import { logger } from "@tqman/nice-logger";

const app = new Elysia()
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "https://2284919719e4.ngrok-free.app", "https://757884c53833.ngrok-free.app", "https://e39ff82fbc69.ngrok-free.app"],
  credentials: true,
}))
app.use(logger({
  mode: "live", // "live" or "combined" (default: "combined")
  withTimestamp: true, // optional (default: false)
  withBanner: true
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

// console.log(
//   `🦊 Elysia is running at ${app.server?.url}`
// );
