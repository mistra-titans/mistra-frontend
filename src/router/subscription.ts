import { accounts } from "@/db/account";
import { subscriptions } from "@/db/subscription";
import { AuthMiddleware } from "@/utils/auth";
import { CURRENCY_EMUM } from "@/utils/constant";
import { db } from "@/utils/db";
import { FORBIDDEN, SUCCESS } from "@/utils/response";
import { and, eq } from "drizzle-orm";
import Elysia, { t } from "elysia";


export const SUBSCRIPTION_ROUTER = new Elysia({
  prefix: "/subscription",
  tags: ["Subscriptions"]
})
  .use(AuthMiddleware)
  .post("/", async ({ body, user, set }) => {
    const user_account = (await db.select().from(accounts)
      .where(eq(accounts.user_id, user.id)).limit(1))

    if (user_account.length === 0) {
      set.status = 403
      return FORBIDDEN("User does not own this account")
    }

    const sub = (await db.insert(subscriptions).values({
      amount: body.amount,
      bearer_account: user_account[0].account_number,
      currency: body.currency,
      interval: body.interval,
      user_id: user.id,
      updated_at: new Date(),
      status: "PENDING",
    }).returning())[0]

    return SUCCESS(sub, "Created subscription successfully")
  }, {
    userAuth: true,
    body: t.Object({
      account_number: t.String(),
      bearer_account: t.String(),
      amount: t.Number(),
      currency: CURRENCY_EMUM,
      interval: t.Enum({
        daily: "daily",
        weekly: "weekly",
        monthly: "monthly",
        yearly: "yearly"
      })
    }),
    detail: { summary: "Create Subscription" }
  })
  .get("/:account_number", async ({ params, user }) => {
    const subs = await db.select().from(subscriptions)
      .where(and(
        eq(subscriptions.user_id, user.id),
        eq(subscriptions.bearer_account, params.account_number)
      ))
      return SUCCESS(subs, "Retrieved all subscriptions")
  }, {
    userAuth: true,
    params: t.Object({
      account_number: t.String(),
    })
  })