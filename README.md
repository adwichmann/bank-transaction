# Bank Transactions Microservice

## Descrição

Este repositório contém o código para um microsserviço que gerencia transações financeiras. O serviço é implementado usando Node.js e TypeScript, rodando em AWS Lambda, com dados armazenados em uma tabela DynamoDB. A infraestrutura é provisionada usando Terraform.

- Node.js
- TypeScript
- AWS Lambda
- AWS API Gateway
- DynamoDB
- Terraform

## Instalação

### Pré-requisitos

Para rodar o projeto é necessário ter o Node.js e o Terraform instalado e também 
uma conta na AWS junto com AWS CLI configurado com suas credenciais AWS para subir a infraestrutura via Terraform.


[Node v22.13.1 LTS](https://nodejs.org/en/blog/release/v22.13.1)

[Terraform v1.10.5](https://github.com/hashicorp/terraform/releases/tag/v1.10.5)

[AWS Account](https://aws.amazon.com/pt/console/)

[AWS CLI](https://aws.amazon.com/pt/cli/)


### Deploy

1. Clone o repositório: `git clone https://github.com/adwichmann/bank-transaction.git`
2. Instale as dependências: `npm install`.
3. Faça o build da aplicação, gerando o arquivo necessário para o deploy: `npm run build-deploy`
4. Autentique com suas credenciais da AWS usando o AWS CLI: `aws configure`
5. Acessar a pasta `terraform` inicializar o projeto: `terraform init`
6. Verifique o que será provisionado: `terraform plan`
7. Logo após aplique as configurações para provisionar a infraestrutura: `terraform apply` 


## Infraestrutura

- **DynamoDB**: Armazenamento das transações.
- **Lambda**: Funções para gerenciar transações e consultas.
- **API Gateway**: Interface REST para as funções Lambda.
- **Terraform**: Provisionamento da infraestrutura.

## Endpoints

- **POST /transactions**: Registrar uma transação.
- **GET /transactions**: Listar transações por usuário.
- **GET /balance**: Consultar saldo no mês de referência.

## Planejamento Arquitetural

### Diagrama
![Diagrama de Streaming](https://github.com/user-attachments/assets/0a10fcc8-17ab-4736-813e-588de94cd1b3)

### Descrição

1. **API Gateway**: O API Gateway recebe solicitações HTTP dos clientes e encaminha essas solicitações para as funções Lambda apropriadas.
2. **AWS Lambda**: Esta função Lambda processa as solicitações de registro de transações, valida os dados de entrada, cria uma nova transação e a insere na tabela DynamoDB.
3. **DynamoDB**: O DynamoDB é usado como banco de dados para armazenar as transações financeiras. Cada transação é registrada na tabela DynamoDB com os detalhes fornecidos.
4. **DynamoDB Stream**: O DynamoDB Streams captura todas as alterações feitas na tabela DynamoDB (inserções, atualizações, exclusões) e fornece um fluxo de eventos que pode ser consumido por outras funções Lambda.
5. **AWS Lambda(Stream)**: Esta função Lambda é configurada para ser acionada pelo DynamoDB Streams. Sempre que uma nova transação é registrada no DynamoDB, o evento é enviado para esta função Lambda.
A função Lambda processa o evento e insere os dados da transação em um banco de dados RDS para fins de análise e relatórios.
6. **RDS**: O RDS é usado para armazenar dados de transações em um formato relacional, que pode ser facilmente consultado para análise e geração de relatórios.


