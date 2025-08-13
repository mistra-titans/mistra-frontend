import axios from "axios";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";


const paystack_client = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET}`,
    "Content-Type": "application/json",
  },
})

export interface MoMoChargePayload {
  email: string;
  amount: number;
  currency: "GHS";
  mobile_money: {
    phone: string;
    provider: "mtn" | "vodafone" | "airteltigo";
  };
}


export async function chargeMobileMoney(payload: MoMoChargePayload) {
  const res = await paystack_client.post("/charge", payload);
  return res.data;
}

export async function verifyTransaction(reference: string) {
  const res = await paystack_client.get(`/transaction/verify/${reference}`);
  return res.data;
}

export async function pollTransaction(reference: string, timeoutMs = 60000 * 5, intervalMs = 3000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const verification = await verifyTransaction(reference);

    if (verification.data.status === "success") {
      return verification.data;
    }

    if (verification.data.status === "failed") {
      throw new Error("Payment failed");
    }

    // Wait before polling again
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Payment timeout");
}


export async function submitMoMoOtp(reference: string, otp: string) {
  const res = await paystack_client.post("/charge/submit_otp", {
    otp,
    reference
  });
  return res.data;
}