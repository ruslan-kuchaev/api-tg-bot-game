import { MyContext } from "../types";
import { checkGameUpdates, formatUpdateMessage } from "../utils";

export async function checkUpdates(ctx: MyContext) {
    try {
        await ctx.reply("🔄 Выполняю проверку обновлений...");

        const updates = await checkGameUpdates();
        const message = formatUpdateMessage(updates);

        await ctx.reply(message, { parse_mode: "Markdown" });

    } catch (error) {
        console.error("Error in update check:", error);
        await ctx.reply("❌ ошибка при проверке обновлений.");
    }
}