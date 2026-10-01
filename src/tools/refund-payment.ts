import { z } from "zod";
import { defaultAsaasClient } from "../client.js";

export const refund_paymentSchema = z.object({
  payment_id: z.string().describe("Identificador único da cobrança no Asaas"),
  value: z.number().positive().optional().describe("Valor parcial a estornar (se omitido, estorna o valor total)"),
  description: z.string().optional().describe("Motivo ou justificativa do estorno"),
});

export async function handleRefundPayment(
  params: z.infer<typeof refund_paymentSchema>
): Promise<string> {
  const body: Record<string, unknown> = {};
  if (params.value !== undefined) body.value = params.value;
  if (params.description !== undefined) body.description = params.description;

  const result = await defaultAsaasClient.request(
    "POST",
    `/payments/${params.payment_id}/refund`,
    Object.keys(body).length > 0 ? body : undefined
  );
  return JSON.stringify(result, null, 2);
}
