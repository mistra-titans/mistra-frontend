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
import { chargeMobileMoney, pollTransaction, submitMoMoOtp } from "@/utils/paystack";


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

      return SUCCESS(new_account[0], "Account created successfully")
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
    const accs = await db.select({ account_number: accounts.account_number }).from(accounts).where(eq(accounts.user_id, user.id))
    const result = await Promise.all(
      accs.map(async (acc) => {
        const res = await replay(acc.account_number)
        return res
      })
    )
    // console.log(result)
    return SUCCESS(result)
  }, { userAuth: true, detail: { summary: "Get All Accounts" } })
  .get("/:account_number", async ({ user, params, set }) => {
    try {
      const [acc] = await db.select().from(accounts).where(and(
        eq(accounts.user_id, user.id),
        eq(accounts.account_number, params.account_number)
      ))
      if (!acc) {
        set.status = 404
        return NOT_FOUND("Account does not exist")
      }
      const result = await replay(acc.account_number)
      return SUCCESS(result)
    } catch (error) {
      set.status = 500
      return INTERNAL_SERVER_ERROR("Failed to fetch account details")
    }
  }, { userAuth: true, params: t.Object({ account_number: t.String() }), detail: { summary: "Get an account detail" } })

  .post("/credit/:account_number", async ({ body, user, params, set }) => {
    // SIMUTATE ADDING MONEY
    const pesewas = body.amount * 100;
    try {
      const result = await db.transaction(async (tx) => {
        const user_account = await tx.select().from(accounts).where(and(
          eq(accounts.account_number, params.account_number),
          eq(accounts.user_id, user.id)
        )).limit(1)

        if (user_account.length === 0) {
          set.status = 401
          throw new Error("Unauthorized")
        }

        const charge = await chargeMobileMoney({
          email: user.email,
          amount: pesewas,
          currency: "GHS",
          mobile_money: {
            phone: body.phone,
            provider: body.provider,
          },
        });

        const reference = charge.data.reference;

        const transaction = await tx.insert(transactions).values({
          paystack_reference: reference,
          amount_base: pesewas,
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



        // TODO: Do thorough verification B4 proceeding 

        await tx.insert(ledger).values({
          currency: body.currency,
          delta: pesewas,
          updated_at: new Date(),
          transaction_id: transaction[0].id,
          user_id: user.id,
          account: params.account_number
        })

        return charge
      })
      const { status, display_text, reference } = result.data;
      if (status === "send_otp") {
        return SUCCESS({ reference, action: "otp", message: display_text });
      }

      if (status === "pay_offline") {
        return SUCCESS({ reference, action: "ussd", message: display_text });
      }
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
      phone: (t.String()),
      currency: CURRENCY_EMUM,
      provider: t.Enum({
        mtn: "mtn",
        vodafone: "vodafone",
        airteltigo: "airteltigo"
      })
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
  .post("/credit/verify", async ({ body, set }) => {
    try {
      const res = await db.transaction(async (tx) => {
        try {
          if (body.otp) {
            await submitMoMoOtp(body.reference, body.otp)
          }
        } catch (error) {
          console.log(error)
        }

        const result = await pollTransaction(body.reference);

        if (!result) {
          throw new Error("Verification Failed")
        }

        await tx.update(transactions).set({
          status: "COMPLETED"
        }).where(eq(transactions.paystack_reference, body.reference))

        return result
      })
      return SUCCESS({}, "Credit Successfull")
    } catch (error) {
      set.status = 500
      await db.update(transactions).set({
        status: "FAILED"
      }).where(eq(transactions.paystack_reference, body.reference))
      console.log(error)
      return INTERNAL_SERVER_ERROR("Error verifying your payment")
    }
  }, {
    body: t.Object({
      otp: t.Optional(t.String()),
      reference: t.String()
    }),
    detail: {summary: "Verify Credit"}
  })