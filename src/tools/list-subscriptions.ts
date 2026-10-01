import { z } from "zod";
import { defaultAsaasClient } from "../client.js";

export const list_subscriptionsSchema = z.object({
  offset: z
    .number()
    .int()
    .min(0)
    .default(0)
    .describe("Elemento inicial da consulta (deslocamento para paginação)"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(25)
    .describe("Número máximo de assinaturas retornadas por página"),
  customer: z.string().optional().describe("Filtrar por ID do cliente"),
  status: z
    .enum(["ACTIVE", "INACTIVE", "EXPIRED"])
    .optional()
    .describe("Filtrar por status da assinatura"),
  billingType: z
    .enum(["BOLETO", "CREDIT_CARD", "PIX", "UNDEFINED"])
    .optional()
    .describe("Filtrar por forma de pagamento"),
});

export async function handleListSubscriptions(
  params: z.input<typeof list_subscriptionsSchema>
): Promise<string> {
  const parsed = list_subscriptionsSchema.parse(params);
  const qs = new URLSearchParams();
  qs.set("offset", String(parsed.offset));
  qs.set("limit", String(parsed.limit));

  if (parsed.customer) qs.set("customer", parsed.customer);
  if (parsed.status) qs.set("status", parsed.status);
  if (parsed.billingType) qs.set("billingType", parsed.billingType);

  const result = await defaultAsaasClient.request("GET", `/subscriptions?${qs.toString()}`);
  return JSON.stringify(result, null, 2);
}
