import { z } from "zod";
import { defaultAsaasClient } from "../client.js";

export const simulate_paymentSchema = z.object({
  payment_id: z.string().describe("Identificador único da cobrança no Asaas"),
  value: z.number().positive().optional().describe("Valor pago (opcional)"),
  paymentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD")
    .optional()
    .describe("Data do recebimento (formato YYYY-MM-DD)"),
});

export async function handleSimulatePayment(
  params: z.infer<typeof simulate_paymentSchema>
): Promise<string> {
  const body: Record<string, unknown> = {};
  if (params.value !== undefined) body.value = params.value;
  if (params.paymentDate !== undefined) body.paymentDate = params.paymentDate;

  const result = await defaultAsaasClient.request(
    "POST",
    `/payments/${params.payment_id}/receiveInCash`,
    Object.keys(body).length > 0 ? body : undefined
  );
  return JSON.stringify(result, null, 2);
}
