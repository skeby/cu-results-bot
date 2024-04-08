const sendLoadingMessage = async (
  ctx,
  loadingMessage = "loading",
  interval = 500
) => {
  try {
    const loading = [
      `${loadingMessage}.`,
      `${loadingMessage}..`,
      `${loadingMessage}...`,
    ];
    let loadingIndex = 0;

    const message = await ctx.reply(loading[loadingIndex % loading.length]);
    const messageId = message.message_id;
    const chatId = message.chat.id;

    const loadingInterval = setInterval(() => {
      const newLoadingIndex = (loadingIndex + 1) % loading.length;
      const newLoadingMessage = loading[newLoadingIndex];
      if (newLoadingMessage !== message.text) {
        loadingIndex = newLoadingIndex;
        message.text = newLoadingMessage; // Update message.text
        ctx.telegram.editMessageText(chatId, messageId, null, message.text);
      }
    }, interval);

    return { messageId, chatId, loadingInterval };
  } catch (error) {
    console.error("Failed to send loading message:", error);
  }
};

export default sendLoadingMessage;
