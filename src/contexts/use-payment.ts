import { useMutation } from "@tanstack/react-query";
import { API } from "./api";

export const usePayment = () => {
  const payment = useMutation({
    mutationKey: ["payment"],
    mutationFn: async ({
     
      recipient_account,
      amount,
      currency,
      method,
    }: {
      
      recipient_account: string;
      amount: number;
      currency: string;
      method: string;
    }) => {
      const res = await API.post("/payment/", {
       
        recipient_account,
        amount,
        currency,
        method,
      });
      return res.data;
    },
  });

  return { payment };
};

export const useClaimPayment = () => {
  const claimPayment = useMutation({
    mutationKey: ["claimPayment"],
    mutationFn: async ({ token, account_number }: { token: string, account_number: string }) => {
      const res = await API.post(`/payment/redeem/${token}?account_number=${account_number}`);
      return res.data;
    },
  });

  return { claimPayment };
};