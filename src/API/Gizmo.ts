import { HttpClient } from "./HttpClient.ts";
import { config } from "../config/env.ts";

export interface GizmoApp {
  id: number;
  title: string;
}


export class Gizmo {
  private readonly http: HttpClient;  // redonly нужно подумать

  constructor() {
    const { url, login, password } = config.externalApi;

    if (!url) {
      throw new Error("EXTERNAL_API_URL is not configured in .env");
    }

    this.http = new HttpClient({
      baseURL: url,
      timeout: 60_000, // Есть дефот нужно учесть они разные
      headers: {
        "Content-Type": "application/json",
      },
      auth: login && password
        ? {
          username: login,
          password: password,
        }
        : undefined,
      rejectUnauthorized: false, // Нужно будет проверить с ним были проблемы
    });

    console.log("✅ Gizmo API client initialized");
  }

  // ТУТ GET запросы будут
  // на будущее await добавим если дальшнм будет как то обрабатывать данные 

  async getAppsTitle(): Promise<GizmoApp[]> {
    return this.http.get<GizmoApp[]>("/apps/titles");
  }



  // ДАльше под miniApp или под автоматическую систему обновлений от version
  async getApp(appId: number): Promise<GizmoApp> {
    return await this.http.get<GizmoApp>(`/apps/${appId}`);
  }




  // HEALTH хз мне кажетьс излишним такого endpoint нету но можно будет передалтт если потребуется
  // async healthCheck(): Promise<boolean> {
  //   try {
  //     await this.http.get("/health");
  //     return true;
  //   } catch (error) {
  //     console.error("❌ Gizmo API health check failed:", error);
  //     return false;
  //   }
  // }
}

export const gizmo = new Gizmo();
