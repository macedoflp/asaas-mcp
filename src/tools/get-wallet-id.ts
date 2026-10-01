import { z } from "zod";
import { defaultAsaasClient } from "../client.js";

export const get_wallet_idSchema = z.object({});

export async function handleGetWalletId(): Promise<string> {
  const result = await defaultAsaasClient.request("GET", "/wallets");
  return JSON.stringify(result, null, 2);
}
