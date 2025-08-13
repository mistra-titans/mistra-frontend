import { AuthMiddleware } from "@/utils/auth";
import { CURRENCY_EMUM } from "@/utils/constant";
import Elysia, { t } from "elysia";
import crypto from "crypto";
import { db } from "@/utils/db";
import { payments } from "@/db/payment";
import { eq } from "drizzle-orm";


const HMAC_SECRET = process.env.LINK_HMAC_SECRET!;
const LINK_TTL_MS = 15 * 60 * 1000; // 15 minutes

function signPaymentLink(paymentId: string, amount: number, expiry: string) {
  const payload = `${paymentId}|${amount}|${expiry}`;
  const sig = crypto.createHmac("sha256", HMAC_SECRET).update(payload).digest("base64url");
  return `${payload}|${sig}`;
}

function verifyPaymentLink(token: string) {
  const parts = token.split("|");
  if (parts.length !== 4) throw new Error("Malformed token");

  const [id, amountStr, expiry, sig] = parts;
  const payload = `${id}|${amountStr}|${expiry}`;
  const expectedSig = crypto.createHmac("sha256", HMAC_SECRET).update(payload).digest("base64url");

  if (!crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(sig))) {
    throw new Error("Invalid signature");
  }

  if (new Date(expiry) < new Date()) {
    throw new Error("Link expired");
  }

  return { id, amount: Number(amountStr), expiry };
}

export const PAYMENT_ROUTER = new Elysia({
  prefix: '/payment',
  tags: ["Payment"]
})
  .use(AuthMiddleware)
  .post("/", async ({ body, user }) => {
    const { payer_account, recipient_account, amount, currency, method } = body;

    if (method !== "LINK") {
      throw new Error("Only LINK method supported here");
    }

    const expiresAt = new Date(Date.now() + LINK_TTL_MS);

    const [payment] = await db
      .insert(payments)
      .values({
        user_id: user.id,
        payer_account,
        recipient_account,
        amount,
        currency,
        method,
        expires_at: expiresAt,
        updated_at: new Date(),
      })
      .returning({ id: payments.id, amount: payments.amount, expires_at: payments.expires_at });

    const token = signPaymentLink(payment.id, payment.amount, expiresAt.toISOString());

    const linkUrl = `https://localhost:3000/pay/${token}`;

    return {
      payment_id: payment.id,
      payment_url: linkUrl,
      expires_at: expiresAt.toISOString(),
    };
  }, {
    userAuth: true,
    body: t.Object({
      payer_account: t.String(),
      recipient_account: t.String(),
      amount: t.Number(),
      currency: CURRENCY_EMUM,
      method: t.Enum({
        LINK: "LINK",
        VCARD: "VCARD"
      })
    })
  })
  .get("/redeem/:token", async ({ params }) => {
    const { token } = params;
    const { id } = verifyPaymentLink(token);

    const [payment] = await db.select().from(payments).where(eq(payments.id, id));

    if (!payment) throw new Error("Payment not found");
    if (payment.status !== "PENDING") throw new Error("Payment not available");
    if (payment.used) throw new Error("Link already used");
    if (payment.expires_at && new Date(payment.expires_at) < new Date()) {
      await db
      .update(payments)
      .set({ used: false, status: "EXPIRED", updated_at: new Date() })
      .where(eq(payments.id, id));
      throw new Error("Link expired");
    }

    await db
      .update(payments)
      .set({ used: true, updated_at: new Date() })
      .where(eq(payments.id, id));
  })