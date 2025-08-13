import { EnhancedMessage, RETRY_CONFIGS, type RetryConfig } from "@/config/retry.config";
import type { Database } from "../utils/db"
import { FailedTransaction, transactions, NewFailedTransaction } from "../db/transaction";
import { and, asc, desc, eq, lte } from "drizzle-orm";

type _NewFailedTransaction = Omit<NewFailedTransaction,
  'user_id' | 'updated_at' | 'amount_base' | 'currency' |
  'recipient_account' | 'sender_account' | 'type' | 'created_at'>

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
    return config.retryableErrors.some(retryableError =>
      error.message.includes(retryableError) || error.name === retryableError
    )
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

    const result = await this.db.update(transactions).set({
      worker_type: message.metadata.workerType,
      original_payload: message.payload,
      max_retries: message.metadata.maxRetries,
      attempt_count: 1,
      next_retry_at: new Date(Date.now() + delay),
      status: 'PENDING',
      updated_at: new Date(),
      last_error: error.message,
    }).where(eq(transactions.id, message.metadata.transactionId))

    if (!result.rowCount || result.rowCount === 0) {
      throw new Error(`Transaction ${message.metadata.transactionId} not found for retry update`);
    }
    console.log(`Updated transaction ${message.metadata.transactionId} as failed, retry in ${delay}ms`)
  }


  //get due retries
  async getDueRetries(limit: number = 100): Promise<FailedTransaction[]> {
    return await this.db.select().from(transactions).where(
      and(
        eq(transactions.status, 'PENDING'),
        lte(transactions.next_retry_at, new Date())
      )
    )
      .orderBy(asc(transactions.next_retry_at))
      .limit(limit);
  }

  //update retry attempt
  async updateRetryAttempt(
    retryId: string,
    success: boolean,
    error?: Error
  ): Promise<void> {
    if (success) {
      await this.db.update(transactions).set({
        status: 'COMPLETED',
        updated_at: new Date()
      }).where(eq(transactions.id, retryId))

      console.log(`Transaction retry ${retryId} completed successfully`)
      return
    }

    const [retry] = await this.db
      .select()
      .from(transactions)
      .where(eq(transactions.id, retryId))
      .limit(1);

    if (!retry) {
      console.warn(`Retry record ${retryId} not found`)
      return
    }

    if (retry.attempt_count! >= retry.max_retries!) {
      //send to deadletter
      await this.db
        .update(transactions)
        .set({
          status: 'FAILED',
          last_error: error?.message,
          dead_lettered_at: new Date(),
          updated_at: new Date()
        })
        .where(eq(transactions.id, retryId));

      console.log(`Transaction ${retry.id} sent to dead letter after ${retry.attempt_count} attempts`)

      //notify
    } else {
      const config = this.getRetryConfig(retry.worker_type!)
      const delay = this.calculateBackoffDelay(retry.attempt_count! + 1, config)

      await this.db
        .update(transactions)
        .set({
          attempt_count: retry.attempt_count! + 1,
          next_retry_at: new Date(Date.now() + delay),
          last_error: error?.message || '',
          updated_at: new Date()
        })
        .where(eq(transactions.id, retryId));

      console.log(`Scheduled retry ${retry.attempt_count! + 1}/${retry.max_retries} for transaction ${retry.id} in ${delay}ms`);
    }
  }

  //get dead letter transactions
  async getDeadLetters(limit: number = 50): Promise<FailedTransaction[]> {
    return await this.db.select().from(transactions).where(
      eq(transactions.status, 'FAILED')
    ).orderBy(desc(transactions.dead_lettered_at)).limit(limit)
  }

  //notify
  private async notifyDeadLetter() {
    console.log("notify ops team")
  }

}