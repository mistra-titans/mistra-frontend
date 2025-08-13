import { useMutation, useQuery } from "@tanstack/react-query";
import { API } from "./api";

export const useAccount = (account_number?: string) => {
  // Get single account
  const account = useQuery({
    queryKey: ["account", account_number],
    queryFn: async () => {
      const res = await API.get(`/account/${account_number}`);
      return res.data;
    },
    enabled: !!account_number, // Only run query if account_number is provided
  });

  // Get all accounts
  const accounts = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const res = await API.get("/account/");
      return res.data;
    },
  });

  // Get account balance
  const balance = useQuery({
    queryKey: ["balance", account_number],
    queryFn: async () => {
      const res = await API.get(`/account/balance/${account_number}`);
      return res.data;
    },
    enabled: !!account_number, // Only run query if account_number is provided
  });

  // Create new account
  const createAccount = useMutation({
    mutationKey: ["createAccount"],
    mutationFn: async ({
      name,
      currency,
    }: {
      name: string;
      currency: string;
    }) => {
      const res = await API.post("/account/", { name, currency });
      return res.data;
    },
  });

  return {
    account,
    accounts,
    balance,
    createAccount,
  };
};