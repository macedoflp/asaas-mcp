import { z } from "zod";
import { defaultAsaasClient } from "../client.js";

export const list_customersSchema = z.object({
  offset: z
    .number()
    .int()
    .min(0)
    .default(0)
    .describe("Elemento inicial da consulta (deslocamento para paginação oficial Asaas, padrão: 0)"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(25)
    .describe("Número máximo de clientes retornados por página (máximo 100, padrão: 25)"),
  name: z.string().optional().describe("Filtrar por nome do cliente"),
  email: z.string().optional().describe("Filtrar por e-mail do cliente"),
  cpfCnpj: z.string().optional().describe("Filtrar por CPF ou CNPJ"),
  externalReference: z.string().optional().describe("Filtrar pelo identificador externo"),
});

export async function handleListCustomers(
  params: z.input<typeof list_customersSchema>
): Promise<string> {
  const parsed = list_customersSchema.parse(params);
  const qs = new URLSearchParams();
  qs.set("offset", String(parsed.offset));
  qs.set("limit", String(parsed.limit));

  if (parsed.name) qs.set("name", parsed.name);
  if (parsed.email) qs.set("email", parsed.email);
  if (parsed.cpfCnpj) qs.set("cpfCnpj", parsed.cpfCnpj);
  if (parsed.externalReference) qs.set("externalReference", parsed.externalReference);

  const result = await defaultAsaasClient.request("GET", `/customers?${qs.toString()}`);
  return JSON.stringify(result, null, 2);
}
