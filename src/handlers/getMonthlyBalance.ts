import { APIGatewayProxyHandler } from "aws-lambda";
import { TransactionRepository } from "../repositories/transaction-repository";

export const getMonthlyBalance: APIGatewayProxyHandler = async (event) => {
  if (
    !event.queryStringParameters ||
    !event.queryStringParameters.userId ||
    !event.queryStringParameters.month
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Missing userId or month in query parameters",
      }),
    };
  }

  const userId = event.queryStringParameters.userId;
  const month = event.queryStringParameters.month;

  try {
    const repository = new TransactionRepository();
    const balance = await repository.getMonthlyBalance(userId, month);
    return {
      statusCode: 200,
      body: JSON.stringify({ userId, month, balance }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to retrieve transactions",
        error: "Failed to retrieve transactions",
      }),
    };
  }
};
