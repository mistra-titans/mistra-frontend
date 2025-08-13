import Elysia, { t } from "elysia";
import { AuthMiddleware } from "../utils/auth";
import { INTERNAL_SERVER_ERROR, NOT_FOUND, SUCCESS } from "../utils/response";
import { db } from "../utils/db";
import { accounts } from "../db/account";
import { generateRandoms } from "../utils/util";
import { transactions } from "../db/transaction";
import { CURRENCY_EMUM } from "@/utils/constant";
import { ledger } from "@/db/ledger";
import { and, eq } from "drizzle-orm";
import { replay } from "@/utils/replay";


export const ACCOUNT_ROUTER = new Elysia({
  prefix: "/account",
  tags: ["Accounts"]
})
  .use(AuthMiddleware)
  .post("/", async ({ user, body, set }) => {
    try {
      const new_account = await db.insert(accounts).values({
        currency: body.currency,
        name: body.name,
        balance: 0,
        user_id: user.id,
        account_number: generateRandoms(),
        updated_at: new Date()
      }).returning()

      return SUCCESS(new_account[0], "Account created successfuly")
    } catch (error) {
      set.status = 500
      console.error("Error creating account:", error);
      return INTERNAL_SERVER_ERROR("Account creation failed");
    }
  }, {
    userAuth: true,
    body: t.Object({
      name: t.String(),
      currency: t.String(),
    }),
    detail: { summary: "Create Account" }
  })
  .use(AuthMiddleware)
  .get("/", async ({ user }) => {
    return SUCCESS(await db.select().from(accounts).where(eq(accounts.user_id, user.id)))
  }, { userAuth: true, detail: { summary: "Get All Accounts" } })
  .get("/:account_number", async ({ user, params, set }) => {
    try {
      const acc = await db.select().from(accounts).where(and(
        eq(accounts.user_id, user.id),
        eq(accounts.account_number, params.account_number)
      ))
      if (acc.length === 0) {
        set.status = 404
        return NOT_FOUND("Account does not exist")
      }
      return SUCCESS(acc[0])
    } catch (error) {
      set.status = 500
      return INTERNAL_SERVER_ERROR("Failed to fetch account details")
    }
  }, { userAuth: true, params: t.Object({ account_number: t.String() }), detail: { summary: "Get an account detail" } })

  .post("/credit/:account_number", async ({ body, user, params, set }) => {
    // SIMUTATE ADDING MONEY
    try {
      const accnt_number = await db.transaction(async (tx) => {
        const user_account = await tx.select().from(accounts).where(and(
          eq(accounts.account_number, params.account_number),
          eq(accounts.user_id, user.id)
        )).limit(1)

        if (user_account.length === 0) {
          set.status = 401
          throw new Error("Unauthorized")
        }


        const transaction = await tx.insert(transactions).values({
          amount_base: body.amount,
          currency: body.currency,
          status: "PENDING",
          type: "DEPOSIT",
          user_id: user.id,
          updated_at: new Date(),
          recipient_account: params.account_number
        }).returning()

        if (transaction.length === 0) {
          set.status = 500
          throw INTERNAL_SERVER_ERROR("Failed creating transaction")
        }

        await tx.insert(ledger).values({
          currency: body.currency,
          delta: body.amount,
          updated_at: new Date(),
          transaction_id: transaction[0].id,
          user_id: user.id,
          account: params.account_number
        })

        return user_account[0].account_number
      })

      return SUCCESS(await replay(accnt_number), "Here's your account balance")
    } catch (error) {
      set.status = 500
      console.error("Error creating transaction:", error);
      return INTERNAL_SERVER_ERROR("Transaction creation failed");
    }
  }, {
    userAuth: true,
    params: t.Object({
      account_number: t.String()
    }),
    body: t.Object({
      amount: t.Number(),
      phone: t.Optional(t.String()),
      currency: CURRENCY_EMUM
    }),
    detail: { summary: "Credit Account" }
  })
  .get("/balance/:account_number", async ({ user, params, set }) => {
    const user_account = await db.select().from(accounts).where(and(
      eq(accounts.account_number, params.account_number),
      eq(accounts.user_id, user.id)
    )).limit(1)

    if (user_account.length === 0) {
      set.status = 401
      throw new Error("Unauthorized")
    }

    return SUCCESS(await replay(user_account[0].account_number), "Here's your account balance")
  }, {
    userAuth: true,
    params: t.Object({
      account_number: t.String()
    }),
    detail: { summary: "Get Account Balance" }
  })