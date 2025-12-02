"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var grammy_1 = require("grammy");
require("dotenv/config");
var bot = new grammy_1.Bot(process.env.BOT_TOKEN);
// Reply to any message with "Hi there!".
bot.command("start", function (ctx) { return ctx.reply("Welcome! Up and running."); });
// Handle other messages.
bot.on("message", function (ctx) { return ctx.reply("Got another message!"); });
bot.start()
    .then(function () { return console.log("Bot is running 🚀"); })
    .catch(function (err) { return console.error("Bot failed:", err); });
