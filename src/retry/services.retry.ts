import { EnhancedMessage, RETRY_CONFIGS, type RetryConfig } from "@/config/retry.config";
import type { Database } from "../utils/db"
import { FailedTransaction, failedTransactions, NewFailedTransaction } from "@/db/failedTransactions";
import { and, asc, desc, eq } from "drizzle-orm";

export class RetryService {
  constructor(private db: Database) { }

  //get retry config
  getRetryConfig(workerType: string): RetryConfig {
    const config = RETRY_CONFIGS[workerType];
    if (!config) {
      throw new Error(`No retry configuration found for worker type: ${workerType}`);
    }
    return config;
  }

  //check if retryable
  isRetryableError(workerType: string, error: Error): boolean {
    const config = this.getRetryConfig(workerType)
    return config.retryableErrors.some(retryableError => {
      error.message.includes(retryableError) || error.name === retryableError
    })
  }

  //calculate delay before retry
  calculateBackoffDelay(attemptCount: number, config: RetryConfig): number {
    const delay = Math.min(
      config.initialDelay * Math.pow(config.backoffMultiplier, attemptCount - 1),
      config.maxDelay
    );

    // Add jitter to prevent thundering herd (±10%)
    const jitter = Math.random() * 0.2 * delay - 0.1 * delay;
    return Math.floor(delay + jitter);
  }

  //store failed transaction
  async recordFailure(message: EnhancedMessage, error: Error): Promise<void> {
    const config = this.getRetryConfig(message.type)
    const delay = this.calculateBackoffDelay(1, config)


    const newFailedTransaction: NewFailedTransaction = {
      transactionId: message.metadata.transactionId,
      workerType: message.metadata.workerType,
      originalPayload: message.payload,
      maxRetries: message.metadata.maxRetries,
      attemptCount: 1,
      nextRetryAt: new Date(Date.now() + delay),
      status: 'PENDING',
      lastError: error.message
    }

    await this.db.insert(failedTransactions).values(newFailedTransaction)
    console.log(`Recorded failure for transaction ${message.metadata.transactionId}`)
  }


  //get due retries
  async getDueRetries(limit: number = 100): Promise<FailedTransaction[]> {
    return await this.db.select().from(failedTransactions).where(
      and(
        eq(failedTransactions.status, 'PENDING'),
        eq(failedTransactions.nextRetryAt, new Date())
      )
    )
      .orderBy(asc(failedTransactions.nextRetryAt))
      .limit(limit);
  }

  //update retry attempt
  async updateRetryAttempt(
    retryId: string,
    success: boolean,
    error?: Error
  ): Promise<void> {
    if (success) {
      await this.db.update(failedTransactions).set({
        status: 'COMPLETED',
        updatedAt: new Date()
      }).where(eq(failedTransactions.id, retryId))

      console.log(`Transaction retry ${retryId} completed successfully`)
      return
    }

    const [retry] = await this.db
      .select()
      .from(failedTransactions)
      .where(eq(failedTransactions.id, retryId))
      .limit(1);

    if (!retry) {
      console.warn(`Retry record ${retryId} not foung`)
      return
    }

    if (retry.attemptCount >= retry.maxRetries) {
      //send to deadletter
      await this.db
        .update(failedTransactions)
        .set({
          status: 'FAILED',
          finalError: error?.message,
          deadLetteredAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(failedTransactions.id, retryId));

      console.log(`Transaction ${retry.transactionId} sent to dead letter after ${retry.attemptCount} attempts`)

      //notify
    } else {
      const config = this.getRetryConfig(retry.workerType)
      const delay = this.calculateBackoffDelay(retry.attemptCount + 1, config)

      await this.db
        .update(failedTransactions)
        .set({
          attemptCount: retry.attemptCount + 1,
          nextRetryAt: new Date(Date.now() + delay),
          lastError: error?.message || '',
          updatedAt: new Date()
        })
        .where(eq(failedTransactions.id, retryId));

      console.log(`Scheduled retry ${retry.attemptCount + 1}/${retry.maxRetries} for transaction ${retry.transactionId} in ${delay}ms`);
    }
  }

  //get dead letter transactions
  async getDeadLetters(limit: number = 50): Promise<FailedTransaction[]> {
    return await this.db.select().from(failedTransactions).where(
      eq(failedTransactions.status, 'FAILED')
    ).orderBy(desc(failedTransactions.deadLetteredAt)).limit(limit)
  }

  //notify
  private async notifyDeadLetter() {
    console.log("notify ops team")
  }

}