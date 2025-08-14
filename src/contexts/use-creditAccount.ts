import {  useMutation } from "@tanstack/react-query";
import { API } from "./api";

export const useCreditAccount = () => {
  const creditAccount = useMutation({
    mutationKey: ["creditAccount"],
    mutationFn: async ({
      account_number,
      amount,
      phone,
      currency,
      provider, // Add this if your API expects it
    }: {
      account_number: string;
      amount: number;
      phone: string;
      currency: string;
      provider?: string; // Make it optional if needed
    }) => {
      const res = await API.post(`/account/credit/${account_number}`, {
        amount,
        currency,
        phone,
        provider, // Include this if your API expects it
      });
      return res.data;
    },
  });

  return { creditAccount };
};