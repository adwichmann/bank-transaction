import { APIGatewayProxyHandler } from "aws-lambda";
import { TransactionService } from "../services/transaction-service";
export const listTransactions: APIGatewayProxyHandler = async (event) => {
  // Extract userId and limit from query parameters, defaulting to null or 10 if not provided.
  const userId = event.queryStringParameters?.userId;
  const limit = parseInt(event.queryStringParameters?.limit || "10", 10);

  // Extract the lastEvaluatedKey from query parameters, defaulting to an empty string if not provided.
  const lastEvaluatedKey = event.queryStringParameters?.lastEvaluatedKey || "";

  // Validate that userId is present in the query parameters.
  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Missing userId in query parameters",
      }),
    };
  }

  try {
    // Instantiate a new TransactionService instance.
    const service = new TransactionService();

    // Call the listByUserId method of the TransactionService to retrieve transactions for the given user ID, with specified limit and lastEvaluatedKey.
    const transactions = await service.listByUserId(
      userId,
      limit,
      lastEvaluatedKey
    );

    // Return a successful response with the list of transactions and the lastEvaluatedKey.
    return {
      statusCode: 200,
      body: JSON.stringify({
        items: transactions,
        lastEvaluatedKey: lastEvaluatedKey,
      }),
    };
  } catch (error) {
    // If an error occurs during the process, return a failure response with an appropriate error message.
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to retrieve transactions",
        error: "Failed to retrieve transactions",
      }),
    };
  }
};
