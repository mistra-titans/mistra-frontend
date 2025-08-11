import Elysia, { t } from "elysia";
import { INTERNAL_SERVER_ERROR, SUCCESS } from "../utils/response";
import { db } from "../utils/db";
import { users } from "../db/user";
import { eq, or } from "drizzle-orm";
import { JWT } from "../utils/jwt";
import { AuthMiddleware } from "../utils/auth";

export const AUTH_ROUTER = new Elysia({
  prefix: "/auth",
  tags: ["Auth"],
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

      return SUCCESS({...registered[0], password: undefined}, "User registered successfully");

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
    }),
    detail: {
      summary: "Register a new user",
    }
  })
  .use(JWT)
  .post("/login", async ({ body, cookie: { auth }, jwt }) => {
    try {
      const { phone_or_email, password } = body;

      const user = await db.select().from(users).where(
        or(
          eq(users.phone, phone_or_email),
          eq(users.email, phone_or_email)
        )
      ).limit(1);

      if (user.length === 0) {
        return INTERNAL_SERVER_ERROR("User not found");
      }

      const isPasswordValid = await Bun.password.verify(password, user[0].password);
      if (!isPasswordValid) {
        return INTERNAL_SERVER_ERROR("Invalid password");
      }

      const token = await jwt.sign({
        id: user[0].id,
        phone: user[0].phone,
        email: user[0].email,
      });

      auth.set({
        value: token,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
      });

      return SUCCESS({ token }, "Login successful");
    } catch (error) {
      console.error("Error during login:", error);
      return INTERNAL_SERVER_ERROR("Login failed");
    }
  }, {
    body: t.Object({
      phone_or_email: t.String(),
      password: t.String(),
    }),
    detail: {
      summary: "Login a user",
    }
  })

  .post("/logout", async ({ cookie: { auth } }) => {
    try {
      auth.remove();
      return SUCCESS(null, "Logout successful");
    } catch (error) {
      console.error("Error during logout:", error);
      return INTERNAL_SERVER_ERROR("Logout failed");
    }
  }, {
    detail: {
      summary: "Logout a user",
    }
  })
  .use(AuthMiddleware)
  .post("/refresh", async ({ user, jwt, cookie: { auth } }) => {
    try {
      const token = await jwt.sign({
        id: user.id,
        phone: user.phone,
        email: user.email,
      });

      auth.set({
        value: token,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
      });

      return SUCCESS({ token }, "Token refreshed successfully");
    } catch (error) {
      console.error("Error during token refresh:", error);
      return INTERNAL_SERVER_ERROR("Token refresh failed");
    }
  }, {
    userAuth: true,
    detail: {
      summary: "Refresh user token",
    }
  })

  .get("/profile", async ({ user }) => {
    return SUCCESS({ ...user, password: undefined }, "User profile retrieved successfully");
  }, {
    userAuth: true,
    detail: {
      summary: "Get user profile",
    }
  })

  .get("/verify", async ({ query, jwt }) => {
    try {
      const { token } = query;
      if (!token) {
        return INTERNAL_SERVER_ERROR("Token is required");
      }

      const decoded = await jwt.verify(token);
      if (!decoded) {
        return INTERNAL_SERVER_ERROR("Invalid token");
      }

      return SUCCESS(decoded, "Token is valid");
    } catch (error) {
      console.error("Error during token verification:", error);
      return INTERNAL_SERVER_ERROR("Token verification failed");
    }
  }, {
    query: t.Object({
      token: t.String(),
    }),
    detail: {
      summary: "Verify user token",
    }
  });