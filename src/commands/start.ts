import { MyContext } from "../types.ts";
import { checkGameUpdates, formatUpdateMessage } from "../utils/index.ts";

export async function botStart(ctx: MyContext) {
    try {
        await ctx.reply("✅ бот для проверки наличия обновления в играх в течение 24 часов");
        await ctx.reply("🎮 используйте команду /check для проверки");
    } catch{
        await ctx.reply("что то пошло не так в самом начале")
    }
}