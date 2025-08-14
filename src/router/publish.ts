import { publishTransactionMessage } from "@/service/rabbit";
import Elysia, { t } from "elysia";

export const publishRouter = new Elysia({
  prefix: "/publish",
})
  .post("/", async ({ body, set }) => {
    try {
      await publishTransactionMessage("transfer", body)
      console.log('Message published to queue')
      set.status = 200
      return {
        "message": "Success"
      }

    } catch (error) {
      set.status = 500
      console.log('Failed to publish')
    }
  }, {
    body: t.Object({
      message: t.String()
    })
  })