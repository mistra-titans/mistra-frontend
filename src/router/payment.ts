import { AuthMiddleware } from "@/utils/auth";
import { CURRENCY_EMUM } from "@/utils/constant";
import Elysia, { t } from "elysia";
import crypto from "crypto";
import { db } from "@/utils/db";
import { payments } from "@/db/payment";
import { eq } from "drizzle-orm";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, SUCCESS } from "@/utils/response";
import { transactions } from "@/db/transaction";
import { ledger } from "@/db/ledger";
import { sendOTPEmail } from "@/utils/mailer";
import { transaction_otp } from "@/db/otp";
import { createOTPpaylaod } from "@/utils/otp";


const HMAC_SECRET = process.env.LINK_HMAC_SECRET!;
const LINK_TTL_MS = 15 * 60 * 1000; // 15 minutes

function signPaymentLink(paymentId: string, amount: number, currency: string) {
  const payload = `${paymentId}|${amount}|${currency}`;
  const sig = crypto.createHmac("sha256", HMAC_SECRET).update(payload).digest("base64url");
  return `${payload}|${sig}`;
}

function verifyPaymentLink(token: string) {
  const parts = token.split("|");
  if (parts.length !== 4) throw new Error("Malformed token");

  const [id, amountStr, currency, sig] = parts;
  const payload = `${id}|${amountStr}|${currency}`;
  const expectedSig = crypto.createHmac("sha256", HMAC_SECRET).update(payload).digest("base64url");

  if (!crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(sig))) {
    throw new Error("Invalid signature");
  }

  return { id, amount: Number(amountStr), currency };
}

export const PAYMENT_ROUTER = new Elysia({
  prefix: '/payment',
  tags: ["Payment"]
})
  .use(AuthMiddleware)
  .post("/", async ({ body, user, set }) => {
    try {
      const { recipient_account, amount, currency, method } = body;

      if (method !== "LINK") {
        throw new Error("Only LINK method supported here");
      }

      const expiresAt = new Date(Date.now() + LINK_TTL_MS);

      const [payment] = await db
        .insert(payments)
        .values({
          user_id: user.id,
          amount,
          currency,
          recipient_account,
          method,
          updated_at: new Date(),
        })
        .returning({ id: payments.id, amount: payments.amount });

      const token = signPaymentLink(payment.id, payment.amount, expiresAt.toISOString());

      const linkUrl = `https://localhost:3000/pay/${token}`;



      return SUCCESS({
        payment_id: payment.id,
        payment_url: linkUrl,
        payment_token: token,
        expires_at: expiresAt.toISOString(),
      });
    } catch (error) {
      set.status = 500
      console.log(error)
      return INTERNAL_SERVER_ERROR("Failed to create Payment link")
    }
  }, {
    userAuth: true,
    body: t.Object({
      recipient_account: t.String(),
      amount: t.Number(),
      currency: CURRENCY_EMUM,
      method: t.Enum({
        LINK: "LINK",
        VCARD: "VCARD"
      })
    })
  })
  .get("/redeem/:token", async ({ params, set, user, query }) => {
    const { token } = params;
    const { id, amount, currency } = verifyPaymentLink(token) as {
      id: string,
      amount: number,
      currency: "GHC" | "NGN" | "USD"
    };

    const [payment] = await db.select().from(payments).where(eq(payments.id, id));

    if (payment.amount !== amount) {
      set.status = 400;
      return BAD_REQUEST("Payment amount mismatch");
    }

    const [updatedPayment] = await db
      .update(payments)
      .set({
        num_used: payment.num_used + 1
      })
      .where(eq(payments.id, id))
      .returning();

    await db.transaction(async (tx) => {
      const [trans] = await tx.insert(transactions).values({
        amount_base: amount,
        currency: currency,
        status: "PENDING",
        type: "PAYMENT",
        user_id: user.id,
        updated_at: new Date(),
        sender_account: query.account_number,
        recipient_account: payment.recipient_account
      }).returning()

      // double log into ledger
      // Sender
      // await tx.insert(ledger).values({
      //   currency: currency,
      //   delta: -amount,
      //   user_id: user.id,
      //   transaction_id: trans.id,
      //   account: query.account_number,
      //   updated_at: new Date(),
      // })
      // // Recipient
      // await tx.insert(ledger).values({
      //   currency: currency,
      //   delta: amount,
      //   user_id: user.id,
      //   transaction_id: trans.id,
      //   account: payment.recipient_account,
      //   updated_at: new Date(),
      // })
      const [otp] = await tx.insert(transaction_otp).values(await createOTPpaylaod(trans.id)).returning()

      try {
        const result = await sendOTPEmail({
          otpCode: otp.code,
          userEmail: user.email,
          senderName: 'Mistra',
          subject: 'Your Transaction Verification Code'
        });


        // double log into ledger
        if (result.success) {
          console.log('OTP email sent successfully!', result.messageId);
        } else {
          console.error('Failed to send OTP email:', result.error);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    })

    return SUCCESS({
      payment_id: updatedPayment.id,
      amount: updatedPayment.amount,
      currency: updatedPayment.currency,
      recipient_account: updatedPayment.recipient_account,
      message: "Payment successfully processed"
    });
  }, {
    userAuth: true,
    params: t.Object({ token: t.String() }),
    query: t.Object({ account_number: t.String() })
  })