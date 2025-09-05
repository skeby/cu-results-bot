import puppeteer from "puppeteer";
import bot from "./bot.js";

const scrape = async (loadingMessageId) => {
  try {
    const browser = await puppeteer.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
      headless: true,
      defaultViewport: {
        width: 1024,
        height: 600,
      },
    });
    const page = await browser.newPage();

    page.on("console", (consoleObj) =>
      console.log("(CHROME BROWSER)", consoleObj.text())
    );
    // Login
    await page
      .goto("https://cuportal.covenantuniversity.edu.ng/login.php", {
        timeout: 120000,
      })
      .then(async () => {
        console.log(NODE_ENV);
        console.log("(BOT) Navigated to login page");
        // if (process.env.NODE_ENV === "development")
        //   await page.screenshot({ path: "screenshots/login.png" });
      });

    await page.type("#userid", process.env.PORTAL_USERNAME);
    await page.type("#inputpassword1", process.env.PORTAL_PASSWORD);
    // if (process.env.NODE_ENV === "development")
    //   await page.screenshot({ path: "screenshots/login-before-submit.png" });
    const [response] = await Promise.all([
      page.waitForNavigation({ timeout: 120000 }).then(async () => {
        console.log(`(BOT) Logged in. Current url: ${page.url()}`);
        // if (process.env.NODE_ENV === "development")
        //   await page.screenshot({ path: "screenshots/after-login.png" });
      }),
      page.click('input[type="submit"]'),
    ]);

    await page
      .waitForSelector("#app13", { timeout: 120000, visible: true })
      .then(async () => {
        console.log("(BOT) Result processing link is visible");
        // if (process.env.NODE_ENV === "development")
        //   await page.screenshot({
        //     path: "screenshots/after-login-waitforselector.png",
        //   });
      });

    const [response2] = await Promise.all([
      page.waitForNavigation({ timeout: 120000 }).then(async () => {
        console.log(
          `(BOT) Navigated to page result processing. Current url: ${page.url()}`
        );
        // if (process.env.NODE_ENV === "development")
        //   await page.screenshot({ path: "screenshots/result-processing.png" });
      }),
      page.click("#app13"),
    ]);

    await page.click(".sidebar-toggle");

    await page.waitForSelector(".panel-heading", {
      timeout: 120000,
      visible: true,
    });

    // if (process.env.NODE_ENV === "development")
    //   await page.screenshot({
    //     path: "screenshots/result-processing-sidebar-menu.png",
    //   });

    // Scrape tabs
    const panels = await page.evaluate(() => {
      const panelHeadingElements = document.querySelectorAll(".panel-heading"); // Example selector, replace it with actual selector
      const panels = Array.from(panelHeadingElements).map((panelHeading) =>
        panelHeading.textContent.trim()
      );
      const res = {};
      if (panels.length > 1) {
        res.message = `Results are out sire. ${
          panels.length
        } panels on result processing page: ${panels.join(
          ", "
        )}\n\n Click the link below to view results\nhttps://cuportal.covenantuniversity.edu.ng/`;
      } else {
        res.message = `No results yet sire. ${
          panels.length
        } panels on result processing page: ${panels.join(", ")}`;
      }
      res.panels = panels;
      return res;
    });

    await browser.close();
    return panels;
  } catch (error) {
    console.error("(BOT)", "Scraping failed:", error);
    if (loadingMessageId) {
      await bot.telegram.editMessageText(
        process.env.DEV_CHAT_ID,
        loadingMessageId,
        undefined,
        `Scraping failed: ${error}`
      );
    } else {
      await bot.telegram.sendMessage(
        process.env.DEV_CHAT_ID,
        `Scraping failed: ${error}`
      );
    }
  }
};

export default scrape;
