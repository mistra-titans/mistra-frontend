import Elysia from "elysia";
import { JWT } from "./jwt";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users } from "../db/user";


export const AuthMiddleware = new Elysia()
    .use(JWT)
    .macro({
        userAuth: {
            resolve: async ({ jwt, cookie: { auth }, set }) => {
                try {
                    const data = await jwt.verify(auth.value) as { id: string }
                    if (!data) {
                        throw new Error("Undefined")
                    }
                    const _user = (await db.select().from(users).where(eq(users.id, data.id)))[0]
                    if (!_user) {
                        throw new Error("Undefined")
                    }
                    console.log("USER   ",_user)
                    return {
                        user: _user
                    }
                } catch (error) {
                    set.status = 401
                    return {
                        message: "Unauthorized"
                    }
                }
            }
        }
    })