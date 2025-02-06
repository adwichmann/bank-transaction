import { DynamoDB } from "aws-sdk";
import { Transaction } from "../models/transaction";
import { TransactionRepository } from "../repositories/transaction-repository";

import { validationUtils } from "../utils/validationUtils";
import { nanoid } from "nanoid";

export class TransactionService {
  private transactionRepo: TransactionRepository;

  constructor() {
    this.transactionRepo = new TransactionRepository();
  }

  /**
   * Creates a new transaction with the given user ID, amount, and description.
   * @param userId - The unique identifier for the user creating the transaction.
   * @param amount - The monetary value of the transaction.
   * @param description - A brief description of the transaction.
   * @returns {Promise<Transaction>} - Returns a promise that resolves to the created Transaction object.
   */
  async create(
    userId: string,
    amount: number,
    description: string
  ): Promise<Transaction> {
    const id = nanoid();
    validationUtils.validateAmount(amount);
    validationUtils.validateDescription(description);
    const transaction = new Transaction(userId, amount, description);
    const transactionCreated = await this.transactionRepo.create(transaction);
    return transactionCreated;
  }

  /**
   * Retrieves a list of transactions for a given user ID, with optional pagination support.
   * @param userId - The ID of the user whose transactions are to be retrieved.
   * @param limit - The maximum number of transactions to retrieve per request (default is 10).
   * @param lastEvaluatedKey - A token used for paginating through results, if applicable.
   * @returns A promise that resolves to an array of Transaction objects.
   */
  async listByUserId(
    userId: string,
    limit: number,
    lastEvaluatedKey?: string
  ): Promise<Transaction[]> {
    const result = await this.transactionRepo.listByUserId(
      userId,
      limit,
      lastEvaluatedKey as unknown as DynamoDB.DocumentClient.Key
    );
    return result.Items as Transaction[];
  }

  /**
   * Retrieves the monthly balance for a given user ID and month.
   * @param userId - The unique identifier for the user whose transactions are to be retrieved.
   * @param month - The month in 'YYYY-MM' format for which the balance is requested.
   * @returns {Promise<number>} - Returns a promise that resolves to the monthly balance of the user.
   */
  async getMonthlyBalance(userId: string, month: string): Promise<number> {
    const result = await this.transactionRepo.getMonthlyBalance(userId, month);
    return result;
  }
}
