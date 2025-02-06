import { APIGatewayProxyHandler } from "aws-lambda";
import { TransactionService } from "../services/transaction-service";
export const registerTransaction: APIGatewayProxyHandler = async (event) => {
  // Extract userId, amount, and description from the event body.
  const { userId, amount, description } = JSON.parse(event.body || "{}");

  // Check if required fields are missing.
  if (!userId || !amount || !description) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Missing required fields: userId or amount or description",
      }),
    };
  }

  try {
    // Create a new instance of TransactionService and call the create method to register a transaction.
    const service = new TransactionService();
    const transaction = await service.create(userId, amount, description);

    // Check if the transaction creation was successful.
    if (!transaction) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to create transaction" }),
      };
    }

    // Return the created transaction with a 201 status code.
    return {
      statusCode: 201,
      body: JSON.stringify(transaction),
    };
  } catch (error) {
    // If an error occurs during the process, return a 500 status code with an error message.
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to create transaction" }),
    };
  }
};
