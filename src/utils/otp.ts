import { generateRandoms } from "./util";


export const createOTPpaylaod = async (transaction_id: string) => ({
  transaction_id,
  code: generateRandoms(6)
})