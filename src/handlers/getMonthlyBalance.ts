import { APIGatewayProxyHandler } from "aws-lambda";
import { TransactionService } from "../services/transaction-service";

export const getMonthlyBalance: APIGatewayProxyHandler = async (event) => {
  // Check if the required query parameters are provided in the event
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

  // Extract the userId and month from the query string parameters
  const userId = event.queryStringParameters.userId;
  const month = event.queryStringParameters.month;

  try {
    // Create an instance of TransactionService to get monthly balance
    const service = new TransactionService();
    const balance = await service.getMonthlyBalance(userId, month);
    return {
      statusCode: 200,
      body: JSON.stringify({ userId, month, balance }),
    };
  } catch (error) {
    // If an error occurs during the transaction retrieval process, return a 500 status with an error message
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to retrieve transactions",
        error: "Failed to retrieve transactions",
      }),
    };
  }
};
