import { z } from "zod";
import { defaultAsaasClient } from "../client.js";
import { splitItemSchema } from "./create-payment.js";

export const create_subscriptionSchema = z.object({
  customer: z
    .string()
    .describe("Identificador do cliente no Asaas (ex: cus_000005931980)"),
  billingType: z
    .enum(["BOLETO", "CREDIT_CARD", "PIX", "UNDEFINED"])
    .describe("Forma de pagamento da assinatura"),
  value: z
    .number()
    .positive()
    .describe("Valor de cada recorrência da assinatura"),
  nextDueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD")
    .describe("Data da primeira cobrança (formato YYYY-MM-DD)"),
  cycle: z
    .enum([
      "WEEKLY",
      "BIWEEKLY",
      "MONTHLY",
      "BIMONTHLY",
      "QUARTERLY",
      "SEMIANNUALLY",
      "YEARLY",
    ])
    .default("MONTHLY")
    .describe("Frequência de cobrança da assinatura (padrão: MONTHLY)"),
  description: z
    .string()
    .optional()
    .describe("Descrição do plano ou serviço recorrente"),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD")
    .optional()
    .describe("Data limite para o encerramento automático da assinatura"),
  maxPayments: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Número máximo de cobranças a serem geradas antes de encerrar"),
  split: z
    .array(splitItemSchema)
    .optional()
    .describe("Configuração de Split de Pagamento aplicada a cada mensalidade da assinatura"),
});

export async function handleCreateSubscription(
  params: z.input<typeof create_subscriptionSchema>
): Promise<string> {
  const parsed = create_subscriptionSchema.parse(params);
  const result = await defaultAsaasClient.request("POST", "/subscriptions", parsed);
  return JSON.stringify(result, null, 2);
}
