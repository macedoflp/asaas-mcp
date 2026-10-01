import { z } from "zod";
import { defaultAsaasClient } from "../client.js";

export const get_paymentSchema = z.object({
  payment_id: z.string().describe("Identificador único da cobrança no Asaas (ex: pay_081234567890)"),
});

export async function handleGetPayment(params: z.infer<typeof get_paymentSchema>): Promise<string> {
  const result = await defaultAsaasClient.request("GET", `/payments/${params.payment_id}`);
  return JSON.stringify(result, null, 2);
}
