import { z } from "zod";
import { defaultAsaasClient } from "../client.js";

export const cancel_subscriptionSchema = z.object({
  subscription_id: z.string().describe("Identificador único da assinatura no Asaas (ex: sub_0123456789)"),
});

export async function handleCancelSubscription(
  params: z.infer<typeof cancel_subscriptionSchema>
): Promise<string> {
  const result = await defaultAsaasClient.request(
    "DELETE",
    `/subscriptions/${params.subscription_id}`
  );
  return JSON.stringify(result, null, 2);
}
