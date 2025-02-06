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
    return result as Transaction[];
  }
}
