interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  auth?: {
    username: string;
    password: string;
  };
  rejectUnauthorized?: boolean;
}

const DEFAULT_TIMEOUT = 30_000;
const MAX_ERROR_BODY_LENGTH = 2_000;

export class HttpClient {
  private readonly baseURL: string;
  private readonly baseOrigin: string;
  private readonly timeout: number;
  private readonly defaultHeaders: Headers;
  private readonly authHeader?: string;

  constructor(config: HttpClientConfig) {
    const parsedBaseURL = new URL(config.baseURL);

    if (!["http:", "https:"].includes(parsedBaseURL.protocol)) {
      throw new Error("baseURL должен использовать протокол HTTP или HTTPS");
    }

    if (parsedBaseURL.username || parsedBaseURL.password) {
      throw new Error("Данные авторизации (логин/пароль) не должны указываться в baseURL");
    }

    if (parsedBaseURL.search || parsedBaseURL.hash) {
      throw new Error("baseURL не должен содержать query-параметры (?) или фрагменты (#)");
    }

    if (config.rejectUnauthorized === false) {
      throw new Error(
          "Отключение проверки TLS-сертификатов запрещено в данном HttpClient",
      );
    }

    this.baseOrigin = parsedBaseURL.origin;
    this.baseURL = this.trimTrailingSlashes(parsedBaseURL.href);
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT;

    if (!Number.isFinite(this.timeout) || this.timeout <= 0) {
      throw new Error("Параметр timeout должен быть положительным конечным числом");
    }

    this.defaultHeaders = new Headers({
      "Content-Type": "application/json",
      ...config.headers,
    });

    this.authHeader = config.auth
        ? this.createBasicAuthHeader(
            config.auth.username,
            config.auth.password,
        )
        : undefined;
  }

  async get<T>(path: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "GET",
    });
  }

  private trimTrailingSlashes(value: string): string {
    let end = value.length;

    while (end > 0 && value[end - 1] === "/") {
      end--;
    }

    return value.slice(0, end);
  }

  private createBasicAuthHeader(
      username: string,
      password: string,
  ): string {
    const bytes = new TextEncoder().encode(`${username}:${password}`);
    let binary = "";

    for (const byte of bytes) {
      binary += String.fromCodePoint(byte);
    }

    return `Basic ${btoa(binary)}`;
  }

  private buildURL(path: string): URL {
    let start = 0;
    // /https:
    while (start < path.length && path[start] === "/") {
      start++;
    }

    const url = new URL(path.slice(start), `${this.baseURL}/`);

    if (url.origin !== this.baseOrigin) {
      throw new Error(
          "Запрашиваемый URL должен принадлежать тому же origin, что и baseURL",
      );
    }

    return url;
  }

  private buildHeaders(options: RequestInit): Headers {
    const headers = new Headers(this.defaultHeaders);


    if (this.authHeader) {
      headers.set("Authorization", this.authHeader);
    } //тут ноборот наверно

    if (options.headers) {
      new Headers(options.headers).forEach((value, key) => {
        headers.set(key, value);
      });
    }

    headers.set("Authorization", this.authHeader);

    return headers;
  }

  private createRequestSignal(
      externalSignal?: AbortSignal | null,
  ): { signal: AbortSignal; timeoutSignal: AbortSignal } {
    const timeoutSignal = AbortSignal.timeout(Math.ceil(this.timeout));

    return {
      timeoutSignal,
      signal: externalSignal
          ? AbortSignal.any([externalSignal, timeoutSignal])
          : timeoutSignal,
    };
  }

  private async readErrorResponse(response: Response): Promise<string> {
    try {
      const body = await response.text();

      return body.length > MAX_ERROR_BODY_LENGTH
          ? `${body.slice(0, MAX_ERROR_BODY_LENGTH)}... [обрезано]`
          : body;
    } catch {
      return "Не удалось прочитать тело ответа с ошибкой";
    }
  }

  private createAbortError(
      url: string,
      signal: AbortSignal,
      timeoutSignal: AbortSignal,
      cause: unknown,
  ): Error {
    if (signal.reason === timeoutSignal.reason) {
      return new Error(
          `Превышено время ожидания ответа (${this.timeout} мс): ${url}`,
          { cause },
      );
    }

    return new Error(`Запрос был прерван: ${url}`, { cause });
  }

  private async request<T>(
      path: string,
      options: RequestInit = {},
  ): Promise<T> {
    const url = this.buildURL(path);
    const safeURL = `${url.origin}${url.pathname}`;
    const headers = this.buildHeaders(options);
    const { signal, timeoutSignal } = this.createRequestSignal(
        options.signal,
    );

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal,
      });

      if (!response.ok) {
        const errorText = await this.readErrorResponse(response);

        throw new Error(
            [
              `HTTP ${response.status}: ${response.statusText}`,
              `URL: ${safeURL}`,
              `Ответ сервера: ${errorText}`,
            ].join("\n"),
        );
      }

      if (response.status === 204 || response.status === 205) {
        return undefined as T;
      }

      return await response.json() as T;
    } catch (error) {
      if (signal.aborted) {
        throw this.createAbortError(
            safeURL,
            signal,
            timeoutSignal,
            error,
        );
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error(
          `Неизвестная ошибка при выполнении запроса: ${safeURL}`,
          { cause: error },
      );
    }
  }
}