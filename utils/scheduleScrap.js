import cron from "node-cron";
import bot from "../bot.js";

const scheduleScrape = () => {
  try {
    cron.schedule("0 * * * *", async () => {
      console.log("Job running");
      const res = await scrape();
      if (res.panels.length > 1) {
        bot.telegram.sendMessage(
          process.env.DEV_CHAT_ID,
          `Results are out boss\n\nPanels: ${res.panels.join(", ")}`
        );
      } else {
        bot.telegram.sendMessage(
          process.env.DEV_CHAT_ID,
          "No results this hour sire. Panels: " + res.panels.join(", ")
        );
      }
    });
  } catch (err) {
    errorHandler(err, "scheduleScrape");
  }
};

export default scheduleScrape;
