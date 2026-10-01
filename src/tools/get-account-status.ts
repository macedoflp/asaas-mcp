import { z } from "zod";
import { defaultAsaasClient } from "../client.js";

export const get_account_statusSchema = z.object({});

export async function handleGetAccountStatus(): Promise<string> {
  const result = await defaultAsaasClient.request("GET", "/myAccount/status");
  return JSON.stringify(result, null, 2);
}
