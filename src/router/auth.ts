import Elysia, { t } from "elysia";
import { INTERNAL_SERVER_ERROR, SUCCESS } from "../utils/response";
import { db } from "../utils/db";
import { users } from "../db/user";

export const AUTH_ROUTER = new Elysia({
  prefix: "/auth",
})

.post("/register", async ({ body }) => {
  try {
    const { phone, first_name, last_name, email, password } = body;
    const hashed_password = await Bun.password.hash(password);

    const user = {
      phone,
      first_name,
      last_name,
      email,
      password: hashed_password,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const registered = await db.insert(users).values(user).returning();
    if (registered.length === 0) {
      return INTERNAL_SERVER_ERROR("User registration failed");
    }

    return SUCCESS(registered[0], "User registered successfully");

  } catch (error) {
    console.error("Error during registration:", error);
    return INTERNAL_SERVER_ERROR("Registration failed");
  }
}, {
  body: t.Object({
    phone: t.String(),
    first_name: t.String(),
    last_name: t.String(),
    email: t.String(),
    password: t.String(),
  })
})

.post("/login", async ({ body }) => {

})

.post("/logout", async ({ body }) => {

})

.post("/refresh", async ({ body }) => {

})

.get("/profile", async ({ query }) => {

})

.get("/verify", async ({ query }) => {

})