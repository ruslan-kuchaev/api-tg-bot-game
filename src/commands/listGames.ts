import { MyContext } from "../types";
import { getGamesConfig } from "../utils";

export async function listGames(ctx: MyContext) {
    try {
        const games = getGamesConfig();
        let message = "🎮 **Список отслеживаемых игр:**\n\n";
        
        games.forEach((game, index) => {
            message += `${index + 1}. **${game.name}** (Steam ID: ${game.appId})\n`;
        });
        
        await ctx.reply(message, { parse_mode: "Markdown" });
    } catch (error) {
        console.error("Error listing games:", error);
        await ctx.reply("❌ Ошибка при получении списка игр");
    }
}