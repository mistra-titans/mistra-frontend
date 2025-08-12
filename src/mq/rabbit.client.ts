import { Connection } from 'rabbitmq-client'
import type { Consumer, Publisher, Envelope, AsyncMessage } from 'rabbitmq-client';

interface RabbitConfig {
  url: string
  retryLow?: number
  retryHigh?: number
}

interface QueueOptions {
  durable?: boolean;
  exclusive?: boolean;
  autoDelete?: boolean;
  arguments?: Record<string, any>;
}

interface ExchangeOptions {
  durable?: boolean;
  autoDelete?: boolean;
  internal?: boolean;
  arguments?: Record<string, any>;
}


export class RabbitMQService {
  private rabbit: Connection;
  private publishers: Map<string, Publisher> = new Map();
  private consumers: Map<string, Consumer> = new Map();


  constructor(private config: RabbitConfig) {
    this.rabbit = new Connection({
      url: config.url,
      retryLow: config.retryLow || 1000,
      retryHigh: config.retryHigh || 3000
    })

    //Handle connections
    this.rabbit.on("connection", () => {
      console.log("Connected to RabbitMQ")
    })

    this.rabbit.on("error", (error) => {
      console.log("Error connection to RabbitMQ: ", error)
    })

    // this.rabbit.close()
  }

  async close(): Promise<void> {
    try {
      //close all consumers
      for (const [name, consumer] of this.consumers) {
        console.log(`closing consumer ${name}`)
        await consumer.close()
      }
      this.consumers.clear()

      //close all publishers
      for (const [name, publisher] of this.publishers) {
        console.log(`closing publisher ${name}`)
        await publisher.close()
      }
      this.publishers.clear()


      //close connection
      await this.rabbit.close();
      console.log("Rabbit connection terminated")

    } catch (error) {
      console.log("Error closing connection: ", error)
      throw error
    }
  }

  async getPublisher(publisherName: string = 'defualt'): Promise<Publisher> {
    if (this.publishers.has(publisherName)) {
      return this.publishers.get(publisherName)!
    }

    const publisher = this.rabbit.createPublisher({
      confirm: true,
      maxAttempts: 3, //set max attempts for publishing
      //ensure exchange exists before using the publisher
      exchanges: []
    })

    this.publishers.set(publisherName, publisher)
    return publisher
  }

  //publish to queue
  async publishToQueue(queueName: string, message: any): Promise<void> {
    const publisher = await this.getPublisher()

    await publisher.send(queueName, message)
  }


  //publish to exchange
  async publishToExchange(
    exchangeName: string,
    routingKey: string,
    message: any,
    options: Partial<Envelope> = {}): Promise<void> {
    const publisher = await this.getPublisher()

    await publisher.send({
      exchange: exchangeName,
      routingKey: routingKey,
      ...options
    }, message)
  }




  //create consumer for queue
  async createQueueConsumer(
    consumerName: string,
    queueName: string,
    handler: (message: any, envelope: any) => Promise<void>,
    options: {
      queueOptions?: QueueOptions;
      qos?: number;
      noAck?: boolean;
    } = {}
  ): Promise<Consumer> {
    if (this.consumers.has(consumerName)) {
      throw new Error(`Consumer ${consumerName} already exists`)
    }

    const consumer = this.rabbit.createConsumer({
      queue: queueName,
      queueOptions: {
        durable: true,
        ...options.queueOptions
      },
      qos: options.qos ? { prefetchCount: options.qos } : undefined,
      noAck: options.noAck ?? false
    },
      async (message) => {
        try {
          let parsedBody = message.body
          if (typeof parsedBody === 'string') {
            try {
              parsedBody = JSON.parse(parsedBody)
            } catch {
              parsedBody = message.body
            }
          }

          await handler(parsedBody, message)
        } catch (error) {
          console.log(`Error in consumer ${consumerName}: ${error}`)
          throw error
        }
      })

    this.consumers.set(consumerName, consumer)
    console.log(`Consumer ${consumerName} for queue ${queueName} created successfully`)
    return consumer
  }

  //create consumer for exchange

  async createExchangeConsumer(
    exchangeName: string,
    consumerName: string,
    exchangeType: string,
    routingKey: string,
    handler: (body: any, delivery: AsyncMessage) => Promise<void>,
    options: {
      queueOptions?: QueueOptions,
      exchangeOptions?: ExchangeOptions,
      qos?: number;
      noAck?: boolean;
    } = {}
  ): Promise<Consumer> {
    if (this.consumers.has(consumerName)) {
      throw new Error(`Consumer '${consumerName}' already exists`);
    }

    const consumer = this.rabbit.createConsumer(
      {
        queue: `${exchangeName}.${routingKey}`,
        queueOptions: {
          ...options.queueOptions,
        },
        exchanges: [{
          exchange: exchangeName,
          type: exchangeType,
          ...options.exchangeOptions
        }],
        queueBindings: [{
          exchange: exchangeName,
          routingKey
        }],
        qos: options.qos ? { prefetchCount: options.qos } : undefined,
        noAck: options.noAck ?? false
      },
      async (delivery: AsyncMessage) => {
        try {
          let parsedBody = delivery.body
          if (typeof parsedBody === 'string') {
            try {
              parsedBody = JSON.parse(parsedBody)
            } catch {
              parsedBody = delivery.body
            }
          }

          await handler(parsedBody, delivery);
        } catch (error) {
          console.log(`Error in exchange consumer ${consumerName}: ${error}`)
          throw error
        }
      }
    )
    this.consumers.set(consumerName, consumer)
    console.log(`Consumer ${consumerName} for exchange ${exchangeName} added successfully`)
    return consumer
  }


  // Get consumer by name
  getConsumer(name: string): Consumer | undefined {
    return this.consumers.get(name);
  }

  // Get publisher by name
  getPublisherByName(name: string): Publisher | undefined {
    return this.publishers.get(name);
  }

  // List all consumers
  getConsumerNames(): string[] {
    return Array.from(this.consumers.keys());
  }

  // List all publishers
  getPublisherNames(): string[] {
    return Array.from(this.publishers.keys());
  }

  // Check if connection is ready
  get isConnected(): boolean {
    return this.rabbit.ready;
  }

}

