
// Steam Store Search API
// https://store.steampowered.com/api/storesearch/

import { HttpClient } from "../HttpClient.ts";

interface SteamSearchResponse {
  total: number;
  items: Array<{
    id: number;
    name: string;
    type: string;
  }>;
}

interface SteamGame {
  appId: number;
  name: string;
  type: string;
}

export class SteamApi {
  private readonly http: HttpClient;
  private readonly countryCodes: string[] = ["RU", "ES"];
  private readonly language = "english";

  constructor() {
    this.http = new HttpClient({
      baseURL: "https://store.steampowered.com/api/",
      timeout: 10_000,
    });

    console.log("✅ Steam API client initialized");
  }


  async searchGames(name: string): Promise<SteamGame[]> {
    const query = name.trim();

    if (!query) {
      throw new Error("Название игры не может быть пустым");
    }

    const params = new URLSearchParams({
      term: query,
      l: this.language,
      cc: this.countryCodes[0],
    });

    const data = await this.http.get<SteamSearchResponse>(
      `storesearch/?${params.toString()}`,
    );

    return (data.items ?? []).map((game) => ({
      appId: game.id,
      name: game.name,
      type: game.type,
    }));
  }


  //steamBD
}