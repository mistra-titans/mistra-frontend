import Elysia from "elysia";
import { AUTH_ROUTER } from "./auth";
import { TRANSACTION_ROUTER } from "./transaction";
import { ACCOUNT_ROUTER } from "./account";


export const API_ROUTER = new Elysia({
  prefix: "/api",
})
.use(AUTH_ROUTER)
.use(TRANSACTION_ROUTER)
.use(ACCOUNT_ROUTER)