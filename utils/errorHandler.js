import bot from "../bot.js";

const errorHandler = (err, context) => {
  console.error(`An error occured\nContext: ${context}\n\nError:\n${err}`);
  bot.telegram.sendMessage(
    process.env.DEV_CHAT_ID,
    `An error occured in Covenant Results Bot\n\nContext: ${context}\n\nError:\n${err}`
  );
};

export default errorHandler;
