import bot from "./bot.js";
import { message } from "telegraf/filters";
import scrape from "./scrape.js";
import scheduleScrape from "./utils/scheduleScrap.js";
import errorHandler from "./utils/errorHandler.js";
import express from "express";
import fs from "fs";
import path from "path";

scheduleScrape();

const botCommands = [
  { command: "start", description: "Start bot" },
  { command: "scrape", description: "Check for results sire" },
];

bot.command("start", (ctx) => {
  ctx.reply("Hello world");
});

bot.command("scrape", async (ctx) => {
  try {
    const message = await ctx.reply("Loading...");

    const res = await scrape(message.message_id);
    if (res) {
      await ctx.deleteMessage(message.message_id);
      await ctx.reply(res.message);
    } else {
      await ctx.reply("No response from scraper");
    }
  } catch (err) {
    await errorHandler(err, "Command - scrap");
  }
});

bot.on(message("text"), (ctx) => {
  if (ctx.message.text.startsWith("/")) {
    ctx.reply(
      "Invalid command. Please use / to view the list of available commands. Thank you."
    );
  }
});

const app = express();

if (process.env.NODE_ENV === "production") {
  bot
    .createWebhook({
      domain: process.env.WEBHOOK_DOMAIN,
      drop_pending_updates: true,
    })
    .then((middleware) => {
      app.use(middleware);

      app.get("/", (_, res) => {
        res.status(200).json({ status: "success", message: "Hello world" });
      });

      app.listen(process.env.WEBHOOK_PORT, async () => {
        console.log(`Server is listening on port ${process.env.WEBHOOK_PORT}`);
        await bot.telegram.setMyCommands(
          botCommands.map((c) => ({
            command: c.command,
            description: c.description,
          }))
        );
      });
    })
    .catch((err) =>
      console.error("An error occured while launching the bot:", err)
    );
} else {
  bot
    .launch({ dropPendingUpdates: true })
    .catch((err) =>
      console.error("An error occured while launching the bot:", err)
    );
  bot.telegram.getMe().then(async (res) => {
    console.log(
      `Bot started in development mode on https://t.me/${res.username}`
    );
    await bot.telegram.setMyCommands(
      botCommands.map((c) => ({
        command: c.command,
        description: c.description,
      }))
    );
    await bot.telegram.sendMessage(process.env.DEV_CHAT_ID, `Listening...`);
    // Delete the files in the screenshots folder

    const screenshotsDir = path.resolve("screenshots");
    fs.readdir(screenshotsDir, (err, files) => {
      if (err) {
        console.error("Error reading screenshots directory:", err);
        return;
      }
      files.forEach((file) => {
        const filePath = path.join(screenshotsDir, file);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file ${file}:`, err);
          }
        });
      });
    });
  });
}
