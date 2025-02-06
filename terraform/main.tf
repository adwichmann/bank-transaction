terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

data "aws_caller_identity" "current" {}

resource "aws_dynamodb_table" "transactions" {
  name         = "TransactionsTable"
  billing_mode = "PROVISIONED"
  hash_key     = "userId"
  range_key    = "createdAt"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }
}

resource "aws_iam_role" "lambda_role" {

  assume_role_policy = jsonencode(
    {
      Statement = [
        {
          Action = "sts:AssumeRole"
          Effect = "Allow"
          Principal = {
            Service = "lambda.amazonaws.com"
          }
          Sid = ""
        },
      ]
      Version = "2012-10-17"
    }
  )
  inline_policy {
    name = "lambda_policy"
    policy = jsonencode(
      {
        Statement = [
          {
            Action = [
              "dynamodb:PutItem",
              "dynamodb:Query",
              "dynamodb:Scan",
              "dynamodb:UpdateItem",
              "lambda:InvokeFunction",
            ]
            Effect   = "Allow"
            Resource = "*"
          },
        ]
        Version = "2012-10-17"
      }
    )
  }
}


resource "aws_lambda_function" "register_transaction" {
  function_name = "registerTransaction"
  role          = aws_iam_role.lambda_role.arn
  handler       = "dist/handlers/registerTransaction.registerTransaction"
  runtime       = "nodejs16.x"
  timeout       = 10
  memory_size   = 128

  filename         = "function.zip"
  source_code_hash = filebase64sha256("function.zip")

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.transactions.name
    }
  }
}

resource "aws_lambda_function" "list_transactions" {
  function_name = "listTransactions"
  role          = aws_iam_role.lambda_role.arn
  handler       = "dist/handlers/listTransactions.listTransactions"
  runtime       = "nodejs16.x"
  timeout       = 10
  memory_size   = 128

  filename         = "function.zip"
  source_code_hash = filebase64sha256("function.zip")

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.transactions.name
    }
  }
}

resource "aws_lambda_function" "getMonthlyBalance" {
  function_name = "GetMonthlyBalance"
  role          = aws_iam_role.lambda_role.arn
  handler       = "dist/handlers/getMonthlyBalance.getMonthlyBalance"
  runtime       = "nodejs16.x"
  timeout       = 10
  memory_size   = 128

  filename         = "function.zip"
  source_code_hash = filebase64sha256("function.zip")

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.transactions.name
    }
  }
}




resource "aws_api_gateway_rest_api" "financial_transactions_api" {
  name        = "FinancialTransactionsAPI"
  description = "API for managing financial transactions"
}

resource "aws_api_gateway_resource" "transactions" {
  rest_api_id = aws_api_gateway_rest_api.financial_transactions_api.id
  parent_id   = aws_api_gateway_rest_api.financial_transactions_api.root_resource_id
  path_part   = "transactions"
}

resource "aws_api_gateway_resource" "balance" {
  rest_api_id = aws_api_gateway_rest_api.financial_transactions_api.id
  parent_id   = aws_api_gateway_rest_api.financial_transactions_api.root_resource_id
  path_part   = "balance"
}

resource "aws_api_gateway_method" "transactions_get" {
  rest_api_id      = aws_api_gateway_rest_api.financial_transactions_api.id
  resource_id      = aws_api_gateway_resource.transactions.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = false
  request_parameters = {
    "method.request.querystring.lastEvaluatedKey" = false
    "method.request.querystring.limit"            = false
    "method.request.querystring.userId"           = true
  }
}

resource "aws_api_gateway_method" "transactions_post" {
  rest_api_id   = aws_api_gateway_rest_api.financial_transactions_api.id
  resource_id   = aws_api_gateway_resource.transactions.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "get_monthly_balance" {
  rest_api_id   = aws_api_gateway_rest_api.financial_transactions_api.id
  resource_id   = aws_api_gateway_resource.balance.id
  http_method   = "GET"
  authorization = "NONE"
  request_parameters = {
    "method.request.querystring.month"  = true
    "method.request.querystring.userId" = true
  }
}



resource "aws_api_gateway_integration" "transactions_post" {
  rest_api_id = aws_api_gateway_rest_api.financial_transactions_api.id
  resource_id = aws_api_gateway_resource.transactions.id
  http_method             = aws_api_gateway_method.transactions_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.register_transaction.invoke_arn
}

resource "aws_api_gateway_integration" "transactions_get" {
  rest_api_id = aws_api_gateway_rest_api.financial_transactions_api.id
  resource_id = aws_api_gateway_resource.transactions.id
  http_method             = aws_api_gateway_method.transactions_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.list_transactions.invoke_arn
}

resource "aws_api_gateway_integration" "get_monthly_balance" {
  rest_api_id = aws_api_gateway_rest_api.financial_transactions_api.id
  resource_id = aws_api_gateway_resource.balance.id
  http_method             = aws_api_gateway_method.get_monthly_balance.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.getMonthlyBalance.invoke_arn
}

resource "aws_lambda_permission" "apigateway" {
  statement_id  = "apigateway-invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.register_transaction.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.financial_transactions_api.execution_arn}/*/POST/transactions"
}

resource "aws_lambda_permission" "api_gateway_permission_list" {
  statement_id  = "api_gateway_permission_list-invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.list_transactions.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.financial_transactions_api.execution_arn}/*/GET/transactions"
}

resource "aws_lambda_permission" "api_gateway_get_by_month" {
  statement_id  = "api_gateway_get_by_month-invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.getMonthlyBalance.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.financial_transactions_api.execution_arn}/*/GET/balance"
}

resource "aws_api_gateway_deployment" "api_deployment" {
  rest_api_id = aws_api_gateway_rest_api.financial_transactions_api.id
  stage_name  = "prod"

  triggers = {
    # Deploy every time the Lambda code changes (which includes changing environment variables)
    redeployment = sha1(jsonencode([
      aws_lambda_function.register_transaction.source_code_hash,
      aws_lambda_function.list_transactions.source_code_hash,
      aws_lambda_function.getMonthlyBalance.source_code_hash
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
  depends_on = [
    aws_api_gateway_rest_api.financial_transactions_api,
    aws_lambda_function.register_transaction,
    aws_lambda_function.list_transactions,
    aws_lambda_function.getMonthlyBalance
  ]
}

