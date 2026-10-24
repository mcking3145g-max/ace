# Ace Gaming — New Order Notifications

The rental checkout, desktop bookings, and mobile bookings now submit an alert to a private server endpoint (\`/api/order-notify\`) **independently of WhatsApp**. Only an **enquiry**, not an approved/paid order, is sent.

## One-time setup needed to make notifications work

1. On the owner's phone, install **Telegram** and enable notifications. In Telegram, open **@BotFather**, send \`/newbot\`, and create a private Ace Gaming alerts bot. Keep the token **private**.
2. Open that bot's chat and send \`/start\`. Retrieve the chat ID using the Telegram Bot API \`getUpdates\` endpoint, or an ID lookup bot (check the result and recipient before using). Do not publish the chat ID with the token.
3. In Vercel dashboard → project **ace** → Settings → Environment Variables, add:
   - \`ACE_TELEGRAM_BOT_TOKEN\` — token from BotFather, **Encrypted/Sensitive**, Production.
   - \`ACE_TELEGRAM_CHAT_ID\` — the owner's private chat ID, Production.
4. Redeploy the production project after saving both variables.
5. Submit one test booking and one rental enquiry. Verify the owner gets both messages before relying on this for customer orders.
6. On the owner's phone unmute the bot's chat and set a short **notification sound** under Telegram notification settings. Telegram and the phone OS control the sound; the website cannot force sound, override Do Not Disturb, or guarantee delivery to a disconnected phone.

**Important:** The site also opens WhatsApp with a prepared message. The customer must still press **Send** there; opening WhatsApp does not send it. When Telegram isn't configured or Telegram delivery fails, the rental checkout explicitly tells the customer to send the WhatsApp message as a fallback. Desktop/mobile booking pages attempt a background alert before WhatsApp navigation, but don't guarantee delivery (they use \`sendBeacon\`).

The API does not expose bot tokens or chat IDs to visitors. It validates request fields, confines calls to the same site in browsers, includes a basic per-instance throttle and honeypot check, and only sends to the single configured recipient. For high-volume public use, add distributed rate-limiting/bot protection.

To send a notification **directly to WhatsApp without a customer pressing Send**, a separately configured WhatsApp Business Platform provider/API is required; this integration does not implement that.
