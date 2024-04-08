import bot from "./bot.js";
import { message } from "telegraf/filters";
import scrape from "./scrape.js";
import scheduleScrape from "./utils/scheduleScrap.js";
import errorHandler from "./utils/errorHandler.js";

scheduleScrape();

bot.telegram.setMyCommands([
  { command: "start", description: "Start bot" },
  { command: "scrape", description: "Check for results sire" },
]);

bot.command("start", (ctx) => {
  ctx.reply("Hello world");
});

bot.command("scrape", async (ctx) => {
  try {
    const message = await ctx.reply("Scraping sire...");

    const res = await scrape();
    // clearInterval(loadingInterval);
    if (res) {
      ctx.telegram.editMessageText(
        ctx.chat.id,
        message.message_id,
        null,
        res.message + res.panels
      );
    } else {
      ctx.reply("No resonse from scraper " + res.panels);
    }
  } catch (err) {
    errorHandler(err, "Command - scrap");
  }
});

bot.on(message("text"), (ctx) => {
  if (ctx.message.text.startsWith("/")) {
    ctx.reply(
      "Invalid command. Please use / to view the list of available commands. Thank you."
    );
  }
});

if (process.env.NODE_ENV === "production") {
  bot
    .launch({
      webhook: {
        domain: process.env.WEBHOOK_DOMAIN,
        port: process.env.WEBHOOK_PORT,
      },
    })
    .then(() =>
      console.log(
        `Webhook bot is listening on port ${process.env.WEBHOOK_PORT}`
      )
    )
    .catch((err) =>
      console.error("An error occured while launching the bot:", err)
    );
} else {
  bot
    .launch({ dropPendingUpdates: true })
    .catch((err) =>
      console.error("An error occured while launching the bot:", err)
    );
  bot.telegram.getMe().then((res) => {
    console.log(
      `Bot started in development mode on https://t.me/${res.username}`
    );
    bot.telegram.sendMessage(process.env.DEV_CHAT_ID, `Listening...`);
  });
}
