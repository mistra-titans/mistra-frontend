import Elysia from "elysia";
import { AUTH_ROUTER } from "./auth";


export const API_ROUTER = new Elysia({
  prefix: "/api",
})
.use(AUTH_ROUTER)