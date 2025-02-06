import { nanoid } from "nanoid";

export class Transaction {
  id: string;
  userId: string;
  amount: number;
  createdAt: string;
  description: string;

  constructor(userId: string, amount: number, description: string) {
    this.id = nanoid();
    this.userId = userId;
    this.amount = amount;
    this.createdAt = new Date().toISOString();
    this.description = description;
  }
}
