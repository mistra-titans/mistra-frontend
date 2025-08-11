import Elysia from "elysia";

export const AUTH_ROUTER = new Elysia({
  prefix: "/auth",
})

.post("/register", async ({ body }) => {

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