import { useQuery, useMutation } from "@tanstack/react-query";
import { API } from "./api";

export const useTransaction = () => {
  const transaction = useQuery({
    queryKey: ["transaction"],
    queryFn: async () => {
      const res = await API.get("/transaction/history");
      return res.data;
    },
  });

  // Create new transaction
  const createTransaction = useMutation({
    mutationKey: ["transaction"],
    mutationFn: async ({
      recipient_account,
      sender_account,
      amount,
      currency,
      type,
    }: {
      recipient_account: string;
      sender_account: string;
      amount: number;
      currency: string;
      type: string;
    }) => {
      const res = await API.post("/transaction/create", {
        currency,
        recipient_account,
        type,
        sender_account,
        amount,
      });
      return res.data;
    },
  });

  // Verify transaction with OTP
  const verifyTransaction = useMutation({
    mutationKey: ["verifyTransaction"],
    mutationFn: async (otp: string) => {
      const res = await API.post(`/api/transaction/verify/${otp}`);
      return res.data;
    },
  });

  return { transaction, createTransaction, verifyTransaction };
};