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
      loadingIndex++;
      ctx.telegram.editMessageText(
        chatId,
        messageId,
        null,
        loading[loadingIndex % loading.length]
      );
    }, interval);

    return { messageId, chatId, loadingInterval };
  } catch (err) {
    errorHandler(err, "sendLoadingMessage");
  }
};

export default sendLoadingMessage;
