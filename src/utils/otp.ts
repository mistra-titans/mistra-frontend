import { generateRandoms } from "./util";


const createOTPpaylaod = async (transaction_id: string) => ({
  transaction_id,
  code: generateRandoms(5)
})