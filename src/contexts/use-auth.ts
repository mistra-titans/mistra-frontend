import { useMutation, useQuery } from "@tanstack/react-query";
import { API } from "./api";

export const useAuth = () => {
  const user = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await API.get("/auth/profile");
      return res.data;
    },
  });

  const login = useMutation({
    mutationKey: ["user"],
    mutationFn: async ({
      phone_or_email,   
      password,
    }: {
      phone_or_email: string;
      password: string;
    }) => {
      const res = await API.post("/auth/login", { phone_or_email, password });
      return res.data;
    },
  });
  const signup = useMutation({
    mutationKey: ["user"],
    mutationFn: async ({
      phone,
      first_name,
      last_name,
      email,
      password,
    }: {
      phone: string;
      first_name: string;
      last_name: String;
      email: String;
      password: String;


    }) => {
      const res = await API.post("/auth/register", { phone, password,first_name,last_name,email });
      return res.data;
    },
  });
  const logout = useMutation({
    mutationKey: ["user"],
    mutationFn: async () => {
      const res = await API.post("/auth/logout");
      return res.data;
    },
  });

  return { user, login,logout,signup };
};
