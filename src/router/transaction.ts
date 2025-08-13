import Elysia, { t } from "elysia";
import { AuthMiddleware } from "../utils/auth";
import { CURRENCY_EMUM, QUERY_CONFIG, TRANSACTION_TYPE_ENUM } from "../utils/constant";
import { INTERNAL_SERVER_ERROR, SUCCESS } from "../utils/response";
import { and, asc, desc, eq, lte } from "drizzle-orm";
import { transactions } from "../db/transaction";
import { db } from "../utils/db";
import { accounts } from "../db/account";
import { ledger } from "../db/ledger";
import { replay } from "@/utils/replay";


export const TRANSACTION_ROUTER = new Elysia({
  prefix: "/transaction",
  tags: ["Transaction"],
})
  .use(AuthMiddleware)
  .get("/history", async ({ user, query, set }) => {
    try {
      const { date_from, date_to, limit, order, page, sort } = query;
      const offset = (page - 1) * limit;

      const filters: any[] = [];

      if (date_from) {
        filters.push(lte(transactions.created_at, new Date(date_from)));
      }
      if (date_to) {
        filters.push(lte(transactions.created_at, new Date(date_to)));
      }
      if (user) {
        filters.push(eq(transactions.user_id, user.id));
      }

      const transactionHistory = await db.select()
        .from(transactions)
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(
          sort === "asc" ? asc(transactions.created_at) : desc(transactions.created_at)
        )
        .limit(limit)
        .offset(offset);

      return SUCCESS(transactionHistory, "Transaction history retrieved successfully");
    } catch (error) {
      set.status = 500
      console.error("Error fetching transaction history:", error);
      return INTERNAL_SERVER_ERROR("Failed to fetch transaction history");
    }
  }, {
    userAuth: true,
    query: t.Composite([QUERY_CONFIG, t.Object({
      date_from: t.Optional(t.String()),
      date_to: t.Optional(t.String()),
    })]),
    detail: {
      summary: "Get transaction history",
    }
  })
  .post("/create", async ({ user, body, set }) => {
    try {
      const { recipient_account, amount, currency, type, sender_account } = body;

      switch (type) {
        case "DEPOSIT":
          // Handle deposit logic here
          break;
        case "WITHDRAWAL":
          // Handle withdrawal logic here
          break;
        case "TRANSFER":
          if (!recipient_account || !sender_account) {
            return INTERNAL_SERVER_ERROR("Recipient account is required for transfers");
          }
          const _sender_account = await db.transaction(async (tx) => {
            // Find recipient account
            const recipient = await tx.select()
              .from(accounts)
              .where(eq(accounts.account_number, recipient_account))
              .limit(1);

            if (recipient.length === 0) {
              throw INTERNAL_SERVER_ERROR("Recipient account not found");
            }

            const sender = await tx.select()
              .from(accounts)
              .where(eq(accounts.account_number, sender_account))
              .limit(1);

            if (sender.length === 0) {
              throw INTERNAL_SERVER_ERROR("Sender account not found");
            }

            // Create transaction for sender
            const transacction = await tx.insert(transactions).values({
              user_id: user.id,
              amount_base: amount,
              currency,
              sender_account,
              recipient_account,
              type: "TRANSFER",
              status: "PENDING",
              updated_at: new Date(),
              created_at: new Date(),
            }).returning();

            if (transacction.length === 0) {
              throw INTERNAL_SERVER_ERROR("Failed to record transaction");
            }

            // double log into ledger
            // Sender
            await tx.insert(ledger).values({
              currency: currency,
              delta: -amount,
              user_id: user.id,
              transaction_id: transacction[0].id,
              account: sender_account,
              updated_at: new Date(),
            })
            // Recipient
            await tx.insert(ledger).values({
              currency: currency,
              delta: amount,
              user_id: user.id,
              transaction_id: transacction[0].id,
              account: recipient_account,
              updated_at: new Date(),
            })

            return sender_account
          })
          return await replay(_sender_account)
        case "SUBSCRIPTION":
          // Handle subscription logic here
          break;
        default:
          set.status = 500
          return INTERNAL_SERVER_ERROR("Invalid transaction type");
      }

    } catch (error) {
      set.status = 500
      console.error("Error creating transaction:", error);
      return INTERNAL_SERVER_ERROR("Transaction creation failed");
    }
  }, {
    userAuth: true,
    body: t.Object({
      recipient_account: t.Optional(t.String()),
      sender_account: t.Optional(t.String()),
      amount: t.Number(),
      currency: CURRENCY_EMUM,
      type: TRANSACTION_TYPE_ENUM,
    }),
    detail: { summary: "Create Transaction" }
  })