import { z } from "zod";
import { defaultAsaasClient } from "../client.js";

export const splitItemSchema = z.object({
  walletId: z
    .string()
    .describe("ID da carteira (walletId) da conta Asaas que receberá o repasse"),
  fixedValue: z
    .number()
    .positive()
    .optional()
    .describe("Valor fixo em reais a ser repassado na cobrança/parcela"),
  percentualValue: z
    .number()
    .min(0)
    .max(100)
    .optional()
    .describe("Percentual sobre o valor líquido a ser repassado (ex: 15 para 15%)"),
  totalFixedValue: z
    .number()
    .positive()
    .optional()
    .describe("Valor fixo total a ser dividido entre todas as parcelas (para cobranças parceladas)"),
  description: z
    .string()
    .optional()
    .describe("Descrição do repasse de split"),
});

export const create_paymentSchema = z.object({
  customer: z
    .string()
    .describe("Identificador único do cliente no Asaas (ex: cus_000005931980)"),
  billingType: z
    .enum(["BOLETO", "CREDIT_CARD", "PIX", "UNDEFINED"])
    .describe("Forma de pagamento (BOLETO, CREDIT_CARD, PIX, UNDEFINED)"),
  value: z
    .number()
    .positive()
    .describe("Valor da cobrança em Reais"),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD")
    .describe("Data de vencimento da cobrança (formato YYYY-MM-DD)"),
  description: z
    .string()
    .optional()
    .describe("Descrição detalhada da cobrança"),
  externalReference: z
    .string()
    .optional()
    .describe("Identificador da cobrança no seu sistema (para conciliação)"),
  installmentCount: z
    .number()
    .int()
    .min(2)
    .max(24)
    .optional()
    .describe("Número de parcelas (para pagamentos parcelados)"),
  installmentValue: z
    .number()
    .positive()
    .optional()
    .describe("Valor de cada parcela (opcional, calculado automaticamente se omitido)"),
  split: z
    .array(splitItemSchema)
    .optional()
    .describe("Configuração de Split de Pagamento para divisão de valores entre carteiras"),
  postalService: z
    .boolean()
    .optional()
    .describe("Definir se a cobrança deve ser enviada via Correios"),
});

export async function handleCreatePayment(
  params: z.infer<typeof create_paymentSchema>
): Promise<string> {
  const result = await defaultAsaasClient.request("POST", "/payments", params);
  return JSON.stringify(result, null, 2);
}
