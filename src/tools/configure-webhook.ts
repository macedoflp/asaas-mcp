import { z } from "zod";
import { defaultAsaasClient } from "../client.js";

export const configure_webhookSchema = z.object({
  name: z.string().describe("Nome descritivo da fila de Webhook"),
  url: z.string().url().describe("URL HTTPS do seu endpoint que receberá as notificações do Asaas"),
  email: z.string().email().describe("E-mail para receber alertas caso a fila seja interrompida"),
  enabled: z.boolean().default(true).describe("Se o webhook está ativo"),
  interrupted: z.boolean().default(false).describe("Se a fila está pausada"),
  apiVersion: z.number().int().default(3).describe("Versão da API do webhook (padrão: 3)"),
  authToken: z
    .string()
    .optional()
    .describe("Token de autenticação enviado no header asaas-access-token para validação de segurança"),
  sendType: z
    .enum(["SEQUENTIALLY", "NON_SEQUENTIALLY"])
    .default("SEQUENTIALLY")
    .describe("Modo de disparo dos eventos (SEQUENTIALLY ou NON_SEQUENTIALLY)"),
  events: z
    .array(z.string())
    .optional()
    .describe(
      "Lista de eventos a escutar (ex: ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED', 'PAYMENT_OVERDUE', 'PAYMENT_SPLIT_DONE', 'PAYMENT_REFUNDED'])"
    ),
});

export async function handleConfigureWebhook(
  params: z.input<typeof configure_webhookSchema>
): Promise<string> {
  const parsed = configure_webhookSchema.parse(params);
  const result = await defaultAsaasClient.request("POST", "/webhook", parsed);
  return JSON.stringify(result, null, 2);
}
