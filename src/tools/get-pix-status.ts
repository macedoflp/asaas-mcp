import { z } from "zod";
import { defaultAsaasClient } from "../client.js";

export const get_pix_statusSchema = z.object({
  payment_id: z.string().describe("Identificador da cobrança Pix no Asaas"),
});

export async function handleGetPixStatus(
  params: z.infer<typeof get_pix_statusSchema>
): Promise<string> {
  const result = await defaultAsaasClient.request<{
    id: string;
    status: string;
    value: number;
    netValue?: number;
    billingType: string;
    paymentDate?: string;
    clientPaymentDate?: string;
  }>("GET", `/payments/${params.payment_id}`);

  return JSON.stringify(
    {
      id: result.id,
      status: result.status,
      value: result.value,
      netValue: result.netValue,
      billingType: result.billingType,
      paymentDate: result.paymentDate,
      clientPaymentDate: result.clientPaymentDate,
      raw: result,
    },
    null,
    2
  );
}
