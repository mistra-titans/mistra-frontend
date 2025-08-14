import { RabbitMQService } from "@/mq/rabbit.client";
import 'dotenv/config'

export const rabbitMQ = new RabbitMQService({
  url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  retryLow: 1000,
  retryHigh: 3000
})

export async function initializeRabbitMQ() {
  // Wait for connection
  console.log('Connecting to Rabbitmq...')
  while (!rabbitMQ.isConnected) {
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  //declare exchange
  await rabbitMQ.declareExchange("transactions", "topic", {
    durable: true
  })
  console.log("Exchange ready")
  await publishTransactionMessage("transfer", "Test Message")
}

export async function publishTransactionMessage(
  transactionType: 'transfer' | 'deposit' | 'withdrawal' | 'subscription',
  message: any,
  priority: 'low' | 'medium' | 'high' = 'medium'
) {
  try {
    const routingKey = `transaction.${transactionType}.${priority}`

    // Fixed parameter order: publisherName, exchangeName, routingKey, message
    await rabbitMQ.publishToExchange(
      'transaction-publisher', // publisherName
      'transactions',          // exchangeName  
      routingKey,             // routingKey
      message,                // message
      {
        timestamp: Date.now(),
        priority: priority === 'high' ? 10 : priority === 'medium' ? 5 : 1
      }
    )
    console.log(`Published ${transactionType} message with routing key: ${routingKey}`)
  } catch (error) {
    console.error(`Failed to publish ${transactionType} message:`, error);
    throw error
  }
}



