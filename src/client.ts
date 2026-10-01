const PROD_URL = "https://api.asaas.com/v3";
const SANDBOX_URL = "https://sandbox.asaas.com/api/v3";
const DEFAULT_TIMEOUT = 15_000;

export class AsaasClient {
  private getApiKey(): string {
    const key = process.env.ASAAS_API_KEY?.trim();
    if (!key) {
      throw new Error(
        "Chave de API do Asaas não configurada. Defina a variável de ambiente 'ASAAS_API_KEY' (ex: no seu .env ou nas configurações do MCP) para executar esta operação."
      );
    }
    return key;
  }

  public getBaseUrl(): string {
    if (process.env.ASAAS_BASE_URL?.trim()) {
      return process.env.ASAAS_BASE_URL.trim().replace(/\/+$/, "");
    }
    const env = process.env.ASAAS_ENVIRONMENT?.trim().toLowerCase();
    if (env === "sandbox" || env === "development" || env === "test") {
      return SANDBOX_URL;
    }
    return PROD_URL;
  }

  private getHeaders(apiKey: string) {
    return {
      access_token: apiKey,
      "Content-Type": "application/json",
      "User-Agent": "asaas-mcp/1.1.0",
    };
  }

  async request<T = unknown>(
    method: string,
    path: string,
    body?: unknown,
    timeoutMs: number = DEFAULT_TIMEOUT
  ): Promise<T> {
    const apiKey = this.getApiKey();
    const baseUrl = this.getBaseUrl();
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = `${baseUrl}${normalizedPath}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        headers: this.getHeaders(apiKey),
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timer);

      const contentType = response.headers.get("content-type") ?? "";
      const isJson = contentType.includes("application/json");
      const data = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        let errorMsg = `Asaas HTTP ${response.status}: `;
        if (typeof data === "object" && data !== null) {
          const apiErrors = (data as { errors?: Array<{ description?: string; code?: string }> }).errors;
          if (Array.isArray(apiErrors) && apiErrors.length > 0) {
            errorMsg += apiErrors.map((e) => e.description || e.code).join(", ");
          } else {
            errorMsg += JSON.stringify(data);
          }
        } else {
          errorMsg += String(data);
        }
        throw new Error(errorMsg);
      }

      return data as T;
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error(`Asaas: requisição expirou (timeout de ${timeoutMs / 1000}s).`);
      }
      throw error;
    }
  }
}

// Instância padrão compartilhada (lazy - não valida no import)
export const defaultAsaasClient = new AsaasClient();
