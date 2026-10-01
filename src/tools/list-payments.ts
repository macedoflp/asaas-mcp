import { z } from "zod";
import { defaultAsaasClient } from "../client.js";

export const list_paymentsSchema = z.object({
  offset: z
    .number()
    .int()
    .min(0)
    .default(0)
    .describe("Elemento inicial da consulta (deslocamento para paginação oficial Asaas, padrão: 0)"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(25)
    .describe("Número máximo de elementos retornados por página (máximo 100, padrão: 25)"),
  customer: z
    .string()
    .optional()
    .describe("Filtrar cobranças por ID do cliente"),
  status: z
    .enum([
      "PENDING",
      "RECEIVED",
      "CONFIRMED",
      "OVERDUE",
      "REFUNDED",
      "RECEIVED_IN_CASH",
      "REFUND_REQUESTED",
      "CHARGEBACK_REQUESTED",
      "CHARGEBACK_DISPUTE",
      "AWAITING_CHARGEBACK_REVERSAL",
      "DUNNING_REQUESTED",
      "DUNNING_RECEIVED",
      "AWAITING_RISK_ANALYSIS",
    ])
    .optional()
    .describe("Filtrar por status da cobrança"),
  billingType: z
    .enum(["BOLETO", "CREDIT_CARD", "PIX", "UNDEFINED"])
    .optional()
    .describe("Filtrar por forma de pagamento"),
  externalReference: z
    .string()
    .optional()
    .describe("Filtrar pelo seu identificador externo de cobrança"),
  dueDate_ge: z
    .string()
    .optional()
    .describe("Filtrar cobranças com vencimento maior ou igual a YYYY-MM-DD"),
  dueDate_le: z
    .string()
    .optional()
    .describe("Filtrar cobranças com vencimento menor ou igual a YYYY-MM-DD"),
});

export async function handleListPayments(
  params: z.input<typeof list_paymentsSchema>
): Promise<string> {
  const parsed = list_paymentsSchema.parse(params);
  const qs = new URLSearchParams();
  qs.set("offset", String(parsed.offset));
  qs.set("limit", String(parsed.limit));

  if (parsed.customer) qs.set("customer", parsed.customer);
  if (parsed.status) qs.set("status", parsed.status);
  if (parsed.billingType) qs.set("billingType", parsed.billingType);
  if (parsed.externalReference) qs.set("externalReference", parsed.externalReference);
  if (parsed.dueDate_ge) qs.set("dueDate[ge]", parsed.dueDate_ge);
  if (parsed.dueDate_le) qs.set("dueDate[le]", parsed.dueDate_le);

  const result = await defaultAsaasClient.request("GET", `/payments?${qs.toString()}`);
  return JSON.stringify(result, null, 2);
}
