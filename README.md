# Asaas MCP Server 🚀

Servidor Model Context Protocol (MCP) para integração completa com a API v3 do **Asaas** (gateway brasileiro de pagamentos e Pix).

Permite que assistentes de IA (como **Google Antigravity**, Claude Desktop, Cursor, etc.) consultem, criem e gerenciem cobranças Pix, Boletos, Cartão de Crédito, Assinaturas, Subcontas, Webhooks e **Split de Pagamentos**.

---

## 🛠️ Ferramentas Disponíveis (15 Tools)

### 💳 1. Cobranças & Pix
- `create_payment`: Cria uma cobrança (Pix, Boleto, Cartão de Crédito) com suporte completo a **Split de Pagamentos** e parcelamento.
- `get_payment`: Consulta dados e status atualizado de qualquer cobrança (`PENDING`, `RECEIVED`, `CONFIRMED`, `OVERDUE`, etc.).
- `list_payments`: Lista cobranças com paginação oficial (`offset` e `limit`) e filtros por status, cliente, data e identificadores.
- `create_pix_qr`: Gera o QR Code dinâmico em base64 e a chave Copia e Cola Pix da cobrança.
- `get_pix_status`: Consulta direta do status e conciliação de uma cobrança Pix.
- `refund_payment`: Realiza estorno total ou parcial de pagamentos.
- `simulate_payment`: Simula o recebimento de uma cobrança (ideal para testes no ambiente Sandbox).

### 👥 2. Clientes
- `create_customer`: Cadastra clientes com dados completos (CPF/CNPJ, e-mail, telefone para WhatsApp/SMS, endereço).
- `list_customers`: Pesquisa e lista clientes cadastrados com paginação (`offset`/`limit`) e filtros.

### 🔁 3. Assinaturas & Recorrência
- `create_subscription`: Cria planos ou mensalidades recorrentes (`WEEKLY`, `MONTHLY`, `YEARLY`, etc.) com suporte a Split por mensalidade.
- `list_subscriptions`: Lista assinaturas ativas, inativas e expiradas.
- `cancel_subscription`: Cancela uma assinatura recorrente no Asaas.

### 🔀 4. Split de Pagamentos, Subcontas & Conta
- `get_wallet_id`: Retorna o `walletId` da conta autenticada (necessário para receber repasses em Splits).
- `get_account_status`: Consulta a situação cadastral, bancária e de aprovação da conta.
- `create_subaccount`: Cria subcontas filhas no Asaas para onboarding de parceiros em marketplaces.
- `configure_webhook`: Configura endpoints de webhook para receber notificações (`PAYMENT_RECEIVED`, `PAYMENT_SPLIT_DONE`, etc.).

---

## ⚙️ Variáveis de Ambiente

| Variável | Obrigatória | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `ASAAS_API_KEY` | Sim (para chamadas) | — | Chave de API gerada no painel do Asaas (Produção ou Sandbox). |
| `ASAAS_ENVIRONMENT` | Não | `production` | Defina como `sandbox` para usar o ambiente de testes (`https://sandbox.asaas.com/api/v3`). |
| `ASAAS_BASE_URL` | Não | — | Sobrescreve a URL base da API (ex: proxies ou mocks internos). |

> **Nota:** O servidor MCP inicializa com sucesso mesmo sem a `ASAAS_API_KEY` configurada no boot. A validação é feita sob demanda (*lazy*), retornando uma mensagem clara quando uma ferramenta for executada sem a chave.

---

## 🔀 Como Utilizar o Split de Pagamentos

O Split permite distribuir automaticamente o valor de uma venda entre carteiras do Asaas:

```json
{
  "customer": "cus_000005931980",
  "billingType": "PIX",
  "value": 200.00,
  "dueDate": "2026-10-31",
  "description": "Serviço com repasse de comissão",
  "split": [
    {
      "walletId": "3b7c89a1-1234-5678-90ab-cdef12345678",
      "percentualValue": 15.0,
      "description": "Comissão do afiliado (15%)"
    },
    {
      "walletId": "7f8e12c3-1234-5678-90ab-cdef12345678",
      "fixedValue": 25.00,
      "description": "Taxa fixa do parceiro"
    }
  ]
}
```

- **`walletId`**: ID da carteira de destino (obtido via ferramenta `get_wallet_id`). Não envie o `walletId` da própria conta emissora.
- **`percentualValue`**: Percentual calculado sobre o valor líquido (`netValue`) após descontadas as taxas do Asaas.
- **`totalFixedValue`**: Para cobranças parceladas, divide o valor fixo total igualmente entre todas as parcelas.

---

## 🚀 Como Configurar no Google Antigravity

Adicione o servidor nas configurações de MCP do Antigravity (ex: `antigravity.json` ou painel de configurações de MCP):

```json
{
  "mcpServers": {
    "asaas": {
      "command": "node",
      "args": ["d:/Downloads/asaas-mcp-main/asaas-mcp-main/dist/index.js"],
      "env": {
        "ASAAS_ENVIRONMENT": "sandbox",
        "ASAAS_API_KEY": "${env:ASAAS_API_KEY}"
      }
    }
  }
}
```

Ou usando `npx tsx` diretamente no código-fonte para desenvolvimento:

```json
{
  "mcpServers": {
    "asaas": {
      "command": "npx",
      "args": ["-y", "tsx", "d:/Downloads/asaas-mcp-main/asaas-mcp-main/src/index.ts"],
      "env": {
        "ASAAS_ENVIRONMENT": "sandbox"
      }
    }
  }
}
```

---

## 🧪 Testes & Build

```bash
# Executar suíte de testes unitários com Vitest
npm test

# Compilar código TypeScript para dist/
npm run build
```

---

## 📄 Licença

MIT
