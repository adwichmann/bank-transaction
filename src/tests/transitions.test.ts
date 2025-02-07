import AWSMock from "aws-sdk-mock";
import AWS from "aws-sdk";
import { DocumentClient, GetItemInput } from "aws-sdk/clients/dynamodb";

import { Transaction } from "../models/transaction";
import { nanoid } from "nanoid";
import {
  create,
  listByUserId,
} from "../__mocks__/aws-sdk/clients/transaction-repository-mock";

const TRANSACTIONS_TABLE =
  process.env.TRANSACTIONS_TABLE || "TransactionsTable";

describe("Register transaction", () => {
  describe("unit", () => {
    beforeAll(() => {
      process.env.TRANSACTIONS_TABLE = TRANSACTIONS_TABLE;
      process.env.AWS_REGION = "us-east-1";
    });

    test("should create a new transaction", async () => {
      const transitionInput: Transaction = {
        id: nanoid(),
        userId: "1",
        amount: 150,
        createdAt: new Date().toISOString(),
        description: "deposit",
      };
      const response: DocumentClient.ItemResponse = {
        Item: transitionInput,
      };
      AWSMock.setSDKInstance(AWS);
      AWSMock.mock(
        "DynamoDB.DocumentClient",
        "get",
        (params: GetItemInput, callback) => {
          callback(null, response);
        }
      );
      const returnItem = await create(transitionInput);
      expect(returnItem).toEqual(transitionInput);
      AWSMock.restore("DynamoDB.DocumentClient");
    });

    test("should list transactions by userId", async () => {
      const transitionInput: Transaction[] = [];
      const response: DocumentClient.ItemResponse = {
        Item: transitionInput,
      };
      AWSMock.setSDKInstance(AWS);
      AWSMock.mock(
        "DynamoDB.DocumentClient",
        "get",
        (params: GetItemInput, callback) => {
          callback(null, response);
        }
      );
      const listTransactions = await listByUserId("1", 10);
      expect(listTransactions.Items?.length).toBeGreaterThan(0);
      AWSMock.restore("DynamoDB.DocumentClient");
    });
  });
});
