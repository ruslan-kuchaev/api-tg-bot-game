import { load } from "dotenv";

// Загружаем переменные окружения из .env файла
const env = await load();

export const config = {
  // Telegram Bot
  bot: {
    token: env.API_KEY || Deno.env.get("API_KEY") || "",
    adminChatId: env.ADMIN_CHAT_ID || Deno.env.get("ADMIN_CHAT_ID") || "",
  },

  // External API (Gizmo)
  externalApi: {
    url: env.EXTERNAL_API_URL || Deno.env.get("EXTERNAL_API_URL") || "",
    login: env.LOGIN || Deno.env.get("LOGIN") || "",
    password: env.PASSWORD || Deno.env.get("PASSWORD") || "",
  },
} as const;


if (!config.bot.token) {
  throw new Error("API_KEY (Telegram Bot Token) is required in .env file");
}

console.log("✅ Configuration loaded successfully");
