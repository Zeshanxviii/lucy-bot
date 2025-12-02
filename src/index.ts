import { Bot } from "grammy";
import 'dotenv/config';

const bot = new Bot(process.env.BOT_TOKEN!);

// Reply to any message with "Hi there!".
bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
// Handle other messages.
bot.on("message", (ctx) => ctx.reply("Got another message!"));

bot.start()
    .then(() => console.log("Bot is running 🚀"))
    .catch((err) => console.error("Bot failed:", err));