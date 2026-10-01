import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("asaas-mcp tools suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ASAAS_API_KEY = "test-api-key";
    delete process.env.ASAAS_ENVIRONMENT;
    delete process.env.ASAAS_BASE_URL;
  });

  it("lazy auth: throws informative error if ASAAS_API_KEY is missing", async () => {
    delete process.env.ASAAS_API_KEY;
    const { handleGetWalletId } = await import("../get-wallet-id.js");
    await expect(handleGetWalletId()).rejects.toThrow("Chave de API do Asaas não configurada");
  });

  it("environment: uses sandbox url when ASAAS_ENVIRONMENT=sandbox", async () => {
    process.env.ASAAS_ENVIRONMENT = "sandbox";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Map([["content-type", "application/json"]]),
      json: async () => ({ walletId: "wallet_sandbox_123" }),
    });

    const { handleGetWalletId } = await import("../get-wallet-id.js");
    await handleGetWalletId();

    expect(mockFetch).toHaveBeenCalledWith(
      "https://sandbox.asaas.com/api/v3/wallets",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          access_token: "test-api-key",
        }),
      })
    );
  });

  it("create_payment works with split configuration", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Map([["content-type", "application/json"]]),
      json: async () => ({
        id: "pay_1",
        status: "PENDING",
        value: 100,
        split: [{ walletId: "wal_partner", percentualValue: 20 }],
      }),
    });

    const { handleCreatePayment } = await import("../create-payment.js");
    const result = await handleCreatePayment({
      customer: "cus_1",
      billingType: "PIX",
      value: 100,
      dueDate: "2026-12-31",
      split: [{ walletId: "wal_partner", percentualValue: 20 }],
    });

    const parsed = JSON.parse(result);
    expect(parsed.id).toBe("pay_1");
    expect(parsed.split).toHaveLength(1);
  });

  it("get_payment works", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Map([["content-type", "application/json"]]),
      json: async () => ({ id: "pay_1", status: "RECEIVED" }),
    });

    const { handleGetPayment } = await import("../get-payment.js");
    const result = await handleGetPayment({ payment_id: "pay_1" });
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe("RECEIVED");
  });

  it("list_payments works with offset and limit pagination", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Map([["content-type", "application/json"]]),
      json: async () => ({
        object: "list",
        hasMore: false,
        totalCount: 1,
        limit: 25,
        offset: 0,
        data: [{ id: "pay_1", value: 100 }],
      }),
    });

    const { handleListPayments } = await import("../list-payments.js");
    const result = await handleListPayments({ offset: 0, limit: 25, status: "RECEIVED" });
    const parsed = JSON.parse(result);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/payments?offset=0&limit=25&status=RECEIVED"),
      expect.any(Object)
    );
    expect(parsed.data).toHaveLength(1);
  });

  it("create_pix_qr works", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Map([["content-type", "application/json"]]),
      json: async () => ({ encodedImage: "base64...", payload: "00020126..." }),
    });

    const { handleCreatePixQr } = await import("../create-pix-qr.js");
    const result = await handleCreatePixQr({ payment_id: "pay_1" });
    const parsed = JSON.parse(result);
    expect(parsed.payload).toBe("00020126...");
  });

  it("get_pix_status calls official /payments/{id} endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Map([["content-type", "application/json"]]),
      json: async () => ({ id: "pay_1", status: "RECEIVED", value: 50 }),
    });

    const { handleGetPixStatus } = await import("../get-pix-status.js");
    const result = await handleGetPixStatus({ payment_id: "pay_1" });
    const parsed = JSON.parse(result);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.asaas.com/v3/payments/pay_1",
      expect.any(Object)
    );
    expect(parsed.status).toBe("RECEIVED");
  });

  it("refund_payment works", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Map([["content-type", "application/json"]]),
      json: async () => ({ id: "pay_1", status: "REFUNDED" }),
    });

    const { handleRefundPayment } = await import("../refund-payment.js");
    const result = await handleRefundPayment({ payment_id: "pay_1", value: 50 });
    const parsed = JSON.parse(result);
    expect(parsed.status).toBe("REFUNDED");
  });

  it("create_customer and list_customers work", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        headers: new Map([["content-type", "application/json"]]),
        json: async () => ({ id: "cus_1", name: "Cliente Teste", cpfCnpj: "12345678900" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: new Map([["content-type", "application/json"]]),
        json: async () => ({ data: [{ id: "cus_1" }] }),
      });

    const { handleCreateCustomer } = await import("../create-customer.js");
    const { handleListCustomers } = await import("../list-customers.js");

    const created = JSON.parse(
      await handleCreateCustomer({ name: "Cliente Teste", cpfCnpj: "12345678900" })
    );
    expect(created.name).toBe("Cliente Teste");

    const list = JSON.parse(await handleListCustomers({ offset: 0, limit: 10 }));
    expect(list.data).toHaveLength(1);
  });

  it("create_subscription, list and cancel work", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        headers: new Map([["content-type", "application/json"]]),
        json: async () => ({ id: "sub_1", status: "ACTIVE" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: new Map([["content-type", "application/json"]]),
        json: async () => ({ data: [{ id: "sub_1" }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: new Map([["content-type", "application/json"]]),
        json: async () => ({ deleted: true, id: "sub_1" }),
      });

    const { handleCreateSubscription } = await import("../create-subscription.js");
    const { handleListSubscriptions } = await import("../list-subscriptions.js");
    const { handleCancelSubscription } = await import("../cancel-subscription.js");

    const sub = JSON.parse(
      await handleCreateSubscription({
        customer: "cus_1",
        billingType: "PIX",
        value: 99.9,
        nextDueDate: "2026-11-01",
        cycle: "MONTHLY",
      })
    );
    expect(sub.id).toBe("sub_1");

    const list = JSON.parse(await handleListSubscriptions({ offset: 0, limit: 10 }));
    expect(list.data).toHaveLength(1);

    const cancel = JSON.parse(await handleCancelSubscription({ subscription_id: "sub_1" }));
    expect(cancel.deleted).toBe(true);
  });

  it("get_wallet_id and get_account_status work", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        headers: new Map([["content-type", "application/json"]]),
        json: async () => ({ walletId: "wal_123456" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: new Map([["content-type", "application/json"]]),
        json: async () => ({ status: "APPROVED", commercialInfo: "APPROVED" }),
      });

    const { handleGetWalletId } = await import("../get-wallet-id.js");
    const { handleGetAccountStatus } = await import("../get-account-status.js");

    const wallet = JSON.parse(await handleGetWalletId());
    expect(wallet.walletId).toBe("wal_123456");

    const status = JSON.parse(await handleGetAccountStatus());
    expect(status.status).toBe("APPROVED");
  });

  it("create_subaccount and configure_webhook work", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        headers: new Map([["content-type", "application/json"]]),
        json: async () => ({ id: "acc_1", walletId: "wal_sub_1" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: new Map([["content-type", "application/json"]]),
        json: async () => ({ id: "wh_1", url: "https://mysite.com/webhook" }),
      });

    const { handleCreateSubaccount } = await import("../create-subaccount.js");
    const { handleConfigureWebhook } = await import("../configure-webhook.js");

    const subaccount = JSON.parse(
      await handleCreateSubaccount({
        name: "Parceiro A",
        email: "parceiro@exemplo.com",
        cpfCnpj: "00000000000191",
        mobilePhone: "11999999999",
        postalCode: "01310100",
        address: "Av Paulista",
        addressNumber: "1000",
        province: "Bela Vista",
      })
    );
    expect(subaccount.walletId).toBe("wal_sub_1");

    const webhook = JSON.parse(
      await handleConfigureWebhook({
        name: "Principal",
        url: "https://mysite.com/webhook",
        email: "admin@mysite.com",
        events: ["PAYMENT_RECEIVED", "PAYMENT_SPLIT_DONE"],
      })
    );
    expect(webhook.id).toBe("wh_1");
  });

  it("handles Asaas API error responses formatted cleanly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: new Map([["content-type", "application/json"]]),
      json: async () => ({
        errors: [{ code: "invalid_customer", description: "Cliente não encontrado" }],
      }),
    });

    const { handleCreatePayment } = await import("../create-payment.js");
    await expect(
      handleCreatePayment({
        customer: "invalid_id",
        billingType: "PIX",
        value: 100,
        dueDate: "2026-12-31",
      })
    ).rejects.toThrow("Asaas HTTP 400: Cliente não encontrado");
  });
});
