#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Tools
import { create_paymentSchema, handleCreatePayment } from "./tools/create-payment.js";
import { get_paymentSchema, handleGetPayment } from "./tools/get-payment.js";
import { list_paymentsSchema, handleListPayments } from "./tools/list-payments.js";
import { create_pix_qrSchema, handleCreatePixQr } from "./tools/create-pix-qr.js";
import { get_pix_statusSchema, handleGetPixStatus } from "./tools/get-pix-status.js";
import { create_customerSchema, handleCreateCustomer } from "./tools/create-customer.js";
import { list_customersSchema, handleListCustomers } from "./tools/list-customers.js";
import { create_subscriptionSchema, handleCreateSubscription } from "./tools/create-subscription.js";
import { list_subscriptionsSchema, handleListSubscriptions } from "./tools/list-subscriptions.js";
import { cancel_subscriptionSchema, handleCancelSubscription } from "./tools/cancel-subscription.js";
import { refund_paymentSchema, handleRefundPayment } from "./tools/refund-payment.js";
import { get_wallet_idSchema, handleGetWalletId } from "./tools/get-wallet-id.js";
import { get_account_statusSchema, handleGetAccountStatus } from "./tools/get-account-status.js";
import { create_subaccountSchema, handleCreateSubaccount } from "./tools/create-subaccount.js";
import { configure_webhookSchema, handleConfigureWebhook } from "./tools/configure-webhook.js";
import { simulate_paymentSchema, handleSimulatePayment } from "./tools/simulate-payment.js";

const server = new McpServer({
  name: "asaas-mcp",
  version: "1.1.0",
});

// Helper para encapsular execução e captura de erros de forma segura no MCP
function safeToolHandler<T>(fn: (args: T) => Promise<string>) {
  return async (args: T) => {
    try {
      const text = await fn(args);
      return {
        content: [{ type: "text" as const, text }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        isError: true,
        content: [{ type: "text" as const, text: `Erro Asaas: ${message}` }],
      };
    }
  };
}

// 1. Pagamentos & Pix
server.tool(
  "create_payment",
  "Cria uma cobrança (Pix, Boleto, Cartão de Crédito) com suporte a Split de Pagamentos e parcelamento",
  create_paymentSchema.shape,
  safeToolHandler(handleCreatePayment)
);

server.tool(
  "get_payment",
  "Consulta os detalhes e o status atualizado de uma cobrança pelo ID",
  get_paymentSchema.shape,
  safeToolHandler(handleGetPayment)
);

server.tool(
  "list_payments",
  "Lista cobranças com paginação oficial (offset/limit) e filtros por status, cliente e vencimento",
  list_paymentsSchema.shape,
  safeToolHandler(handleListPayments)
);

server.tool(
  "create_pix_qr",
  "Gera o QR Code dinâmico e o código Copia e Cola Pix para uma cobrança",
  create_pix_qrSchema.shape,
  safeToolHandler(handleCreatePixQr)
);

server.tool(
  "get_pix_status",
  "Verifica o status de pagamento de uma cobrança Pix",
  get_pix_statusSchema.shape,
  safeToolHandler(handleGetPixStatus)
);

server.tool(
  "refund_payment",
  "Realiza o estorno total ou parcial de uma cobrança recebida",
  refund_paymentSchema.shape,
  safeToolHandler(handleRefundPayment)
);

server.tool(
  "simulate_payment",
  "Simula a confirmação de recebimento de uma cobrança (útil para testes em Sandbox)",
  simulate_paymentSchema.shape,
  safeToolHandler(handleSimulatePayment)
);

// 2. Clientes
server.tool(
  "create_customer",
  "Cadastra um novo cliente no Asaas com dados completos (CPF/CNPJ, e-mail, telefone e endereço)",
  create_customerSchema.shape,
  safeToolHandler(handleCreateCustomer)
);

server.tool(
  "list_customers",
  "Lista e pesquisa clientes cadastrados com paginação (offset/limit)",
  list_customersSchema.shape,
  safeToolHandler(handleListCustomers)
);

// 3. Assinaturas e Recorrência
server.tool(
  "create_subscription",
  "Cria uma assinatura/mensalidade recorrente (com suporte a Split recorrente)",
  create_subscriptionSchema.shape,
  safeToolHandler(handleCreateSubscription)
);

server.tool(
  "list_subscriptions",
  "Lista as assinaturas ativas e inativas com filtros e paginação",
  list_subscriptionsSchema.shape,
  safeToolHandler(handleListSubscriptions)
);

server.tool(
  "cancel_subscription",
  "Cancela uma assinatura recorrente no Asaas",
  cancel_subscriptionSchema.shape,
  safeToolHandler(handleCancelSubscription)
);

// 4. Split, Subcontas & Conta
server.tool(
  "get_wallet_id",
  "Obtém o walletId da conta Asaas autenticada (necessário para configurar repasses de Split)",
  get_wallet_idSchema.shape,
  safeToolHandler(handleGetWalletId)
);

server.tool(
  "get_account_status",
  "Consulta o status cadastral e situação de aprovação da conta no Asaas",
  get_account_statusSchema.shape,
  safeToolHandler(handleGetAccountStatus)
);

server.tool(
  "create_subaccount",
  "Cria uma subconta filha no Asaas (ideal para marketplaces e divisão de splits com parceiros)",
  create_subaccountSchema.shape,
  safeToolHandler(handleCreateSubaccount)
);

server.tool(
  "configure_webhook",
  "Configura ou atualiza um endpoint de Webhook para receber notificações de pagamentos e splits",
  configure_webhookSchema.shape,
  safeToolHandler(handleConfigureWebhook)
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[asaas-mcp] Servidor Asaas MCP iniciado com sucesso. 15 ferramentas registradas.");
}

main().catch((error) => {
  console.error("[asaas-mcp] Falha fatal ao iniciar o servidor:", error);
  process.exit(1);
});
