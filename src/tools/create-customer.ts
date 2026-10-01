import { z } from "zod";
import { defaultAsaasClient } from "../client.js";

export const create_customerSchema = z.object({
  name: z.string().describe("Nome completo ou Razão Social do cliente"),
  cpfCnpj: z.string().describe("CPF ou CNPJ do cliente (somente números ou formatado)"),
  email: z.string().email().optional().describe("E-mail do cliente"),
  phone: z.string().optional().describe("Telefone fixo do cliente com DDD"),
  mobilePhone: z.string().optional().describe("Telefone celular do cliente com DDD (usado para notificações via WhatsApp/SMS)"),
  postalCode: z.string().optional().describe("CEP do endereço do cliente"),
  address: z.string().optional().describe("Logradouro do cliente"),
  addressNumber: z.string().optional().describe("Número do endereço"),
  complement: z.string().optional().describe("Complemento do endereço"),
  province: z.string().optional().describe("Bairro"),
  externalReference: z.string().optional().describe("Identificador do cliente no seu sistema"),
  notificationDisabled: z.boolean().optional().describe("Desabilitar envio de notificações automáticas por e-mail/SMS pelo Asaas"),
});

export async function handleCreateCustomer(
  params: z.infer<typeof create_customerSchema>
): Promise<string> {
  const result = await defaultAsaasClient.request("POST", "/customers", params);
  return JSON.stringify(result, null, 2);
}
