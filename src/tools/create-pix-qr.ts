import { z } from "zod";
import { defaultAsaasClient } from "../client.js";

export const create_pix_qrSchema = z.object({
  payment_id: z.string().describe("Identificador único da cobrança no Asaas"),
});

export async function handleCreatePixQr(
  params: z.infer<typeof create_pix_qrSchema>
): Promise<string> {
  const result = await defaultAsaasClient.request(
    "GET",
    `/payments/${params.payment_id}/pixQrCode`
  );
  return JSON.stringify(result, null, 2);
}
