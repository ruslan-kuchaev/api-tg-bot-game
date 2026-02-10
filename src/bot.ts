import { Bot, GrammyError, HttpError, session } from "grammy";
import { config } from "dotenv";
import { MyContext, SessionData } from "./types";
import { menuCommands } from "./menu/botmenu";
import { botStart, checkUpdates, listGames } from "./commands";

config();

const bot = new Bot<MyContext>(process.env.API_KEY!);

bot.use(
    session({
      initial(): SessionData {
        return {
          lastCheckTime: new Date(),
          gameUpdates: {}
        };
      },
    })
);

bot.api.setMyCommands(menuCommands);

bot.command("start", botStart);
bot.command("check", checkUpdates);
bot.command("listgames", listGames);

bot.catch((error) => {
  const ctx = error.ctx;
  console.error(`Error ${ctx.update.update_id}`);
  const e = error.error;

  if (e instanceof GrammyError) {
    console.error("Grammy error:", e.description);
  } else if (e instanceof HttpError) {
    console.error("HTTP error:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

bot.start().then(() => {
  console.log("🤖 Бот запущен!");
});