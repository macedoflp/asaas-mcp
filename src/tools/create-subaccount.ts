import { z } from "zod";
import { defaultAsaasClient } from "../client.js";

export const create_subaccountSchema = z.object({
  name: z.string().describe("Nome completo do responsável ou Razão Social"),
  email: z.string().email().describe("E-mail único de acesso da subconta"),
  cpfCnpj: z.string().describe("CPF ou CNPJ da subconta"),
  companyType: z
    .enum(["MEI", "LIMITED", "INDIVIDUAL", "ASSOCIATION"])
    .optional()
    .describe("Tipo de empresa (se for pessoa jurídica)"),
  phone: z.string().optional().describe("Telefone fixo"),
  mobilePhone: z.string().describe("Telefone celular com DDD"),
  postalCode: z.string().describe("CEP"),
  address: z.string().describe("Logradouro"),
  addressNumber: z.string().describe("Número"),
  complement: z.string().optional().describe("Complemento"),
  province: z.string().describe("Bairro"),
  incomeValue: z.number().optional().describe("Faturamento ou renda mensal estimada"),
});

export async function handleCreateSubaccount(
  params: z.infer<typeof create_subaccountSchema>
): Promise<string> {
  const result = await defaultAsaasClient.request("POST", "/accounts", params);
  return JSON.stringify(result, null, 2);
}
