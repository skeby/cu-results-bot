import puppeteer from "puppeteer";
import bot from "./bot.js";

const scrape = async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on("console", (consoleObj) =>
      console.log("(CHROME BROWSER)", consoleObj.text())
    );
    // Login
    await page
      .goto("https://cuportal.covenantuniversity.edu.ng/login.php")
      .then(() => console.log("(BOT) Navigated to login page"));
    await page.type("#userid", "21CG029820");
    await page.type("#inputpassword1", "Qwerty107");
    await page.click('input[type="submit"]');
    await page
      .waitForNavigation({ timeout: 60000 })
      .then(() => console.log("(BOT) Logged in"));

    // Wait for login to complete

    await page.waitForSelector("#app13");
    await page.click("#app13");
    await page
      .waitForNavigation()
      .then(() => console.log("(BOT) Navigated to page result processing"));

    // Scrape tabs
    const panels = await page.evaluate(() => {
      const panelHeadingElements = document.querySelectorAll(".panel-heading"); // Example selector, replace it with actual selector
      const panels = Array.from(panelHeadingElements).map((panelHeading) =>
        panelHeading.textContent.trim()
      );
      const res = {};
      if (panels.length > 1) {
        res.message = `Results are out sire. Panels on result processing page: ${panels.join(
          ", "
        )}\n\n Click the link below to view results\nhttps://cuportal.covenantuniversity.edu.ng/`;
      } else {
        res.message = `No results yet sire. Panels on result processing page: ${panels.join(
          ", "
        )}`;
      }
      res.panels = panels;
      return res;
    });

    await browser.close();
    return panels;
  } catch (error) {
    console.error("(BOT)", "Scraping failed:", error);
    bot.telegram.sendMessage(
      process.env.DEV_CHAT_ID,
      `Scraping failed: ${error}`
    );
  }
};

export default scrape;
