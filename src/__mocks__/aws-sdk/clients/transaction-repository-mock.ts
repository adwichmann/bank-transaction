import { DynamoDB } from "aws-sdk";
import { Transaction } from "../../../models/transaction";

const dynamoDb = new DynamoDB.DocumentClient({ region: "us-east-1" });
const TRANSACTIONS_TABLE =
  process.env.TRANSACTIONS_TABLE || "TransactionsTable";

export const create = async (
  transaction: Transaction
): Promise<Transaction> => {
  await dynamoDb
    .put({
      TableName: TRANSACTIONS_TABLE,
      Item: transaction,
    })
    .promise();
  return transaction;
};

export const listByUserId = async (
  userId: string,
  limit: number,
  lastEvaluatedKey?: DynamoDB.DocumentClient.Key
): Promise<DynamoDB.DocumentClient.QueryOutput> => {
  const params: DynamoDB.DocumentClient.QueryInput = {
    TableName: TRANSACTIONS_TABLE,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
    Limit: limit || 10,
    ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey }),
  };
  return await dynamoDb.query(params).promise();
};

export const getMonthlyBalance = async (
  userId: string,
  month: string
): Promise<number> => {
  const startDate = new Date(`${month}-01T00:00:00Z`);
  const endDate = new Date(
    new Date(startDate).setMonth(startDate.getMonth() + 1)
  );
  const params: DynamoDB.DocumentClient.QueryInput = {
    TableName: TRANSACTIONS_TABLE,
    KeyConditionExpression:
      "userId = :userId AND #createdAt BETWEEN :startDate AND :endDate",
    ExpressionAttributeNames: {
      "#createdAt": "createdAt",
    },
    ExpressionAttributeValues: {
      ":userId": userId,
      ":startDate": startDate.toISOString(),
      ":endDate": endDate.toISOString(),
    },
  };

  try {
    const data = await dynamoDb.query(params).promise();
    if (!data.Items) {
      return 0;
    }

    // Calcula o saldo somando os valores das transações
    const balance = data.Items.reduce(
      (sum, transaction) => sum + (transaction.amount || 0),
      0
    );
    return balance;
  } catch (error) {
    console.error("Failed to retrieve transactions:", error);
    throw new Error("Failed to retrieve transactions");
  }
};
