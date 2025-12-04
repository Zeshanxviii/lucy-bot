import { Bot, Context, InlineKeyboard, session } from "grammy";
import type { SessionFlavor } from "grammy";
import { Menu } from "@grammyjs/menu";
import { conversations, createConversation } from "@grammyjs/conversations";
import type { ConversationFlavor, Conversation } from "@grammyjs/conversations";
import 'dotenv/config';

// Session data structure
interface SessionData {
    messageCount: number;
    lastCommand: string;
    userData: {
        name?: string;
        interests?: string[];
        language?: string;
    };
    reminders: Array<{ text: string; time: Date }>;
    favoriteMessages: string[];
    quizScore: number;
}
//@ts-ignore
type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor<MyContext>;

const bot = new Bot<MyContext>(process.env.BOT_TOKEN!);

// Middleware: Session management
bot.use(session({
    initial: (): SessionData => ({
        messageCount: 0,
        lastCommand: '',
        userData: {},
        reminders: [],
        favoriteMessages: [],
        quizScore: 0
    })
}));

bot.use(conversations());

// Conversation: User onboarding
async function onboarding(conversation: Conversation<MyContext>, ctx: MyContext) {
    await ctx.reply("Let's get you set up! What's your name?");
    const { message } = await conversation.wait();
    const name = message?.text;

    if (!name) {
        await ctx.reply("Please provide a valid name.");
        return;
    }

    ctx.session.userData.name = name;
    await ctx.reply(`Nice to meet you, ${name}! What are your interests? (comma-separated)`);

    const { message: interestsMsg } = await conversation.wait();
    const interests = interestsMsg?.text?.split(',').map((i: string) => i.trim()) || [];
    ctx.session.userData.interests = interests;

    const langKeyboard = new InlineKeyboard()
        .text("🇬🇧 English", "lang_en")
        .text("🇪🇸 Spanish", "lang_es")
        .row()
        .text("🇫🇷 French", "lang_fr")
        .text("🇩🇪 German", "lang_de");

    await ctx.reply("Choose your preferred language:", { reply_markup: langKeyboard });

    const langResponse = await conversation.waitForCallbackQuery(["lang_en", "lang_es", "lang_fr", "lang_de"]);
    const lang = langResponse.callbackQuery.data.replace("lang_", "");
    ctx.session.userData.language = lang;

    await langResponse.answerCallbackQuery("Language set!");
    await ctx.reply(
        `Profile complete!\n` +
        `Name: ${name}\n` +
        `Interests: ${interests.join(', ')}\n` +
        `Language: ${lang}\n\n` +
        `Use /menu to explore features!`
    );
}

bot.use(createConversation(onboarding));

// Conversation: Quiz
async function quiz(conversation: Conversation<MyContext>, ctx: MyContext) {
    let score = 0;

    await ctx.reply("🎯 Let's start a quick quiz! Answer 3 questions.\n\nQuestion 1: What is 2 + 2?");
    const q1 = await conversation.wait();
    if (q1.message?.text === "4") {
        score++;
        await ctx.reply("Correct!");
    } else {
        await ctx.reply("Wrong! The answer is 4.");
    }

    await ctx.reply("Question 2: What is the capital of France?");
    const q2 = await conversation.wait();
    if (q2.message?.text?.toLowerCase() === "paris") {
        score++;
        await ctx.reply("Correct!");
    } else {
        await ctx.reply("Wrong! The answer is Paris.");
    }

    await ctx.reply("Question 3: How many continents are there?");
    const q3 = await conversation.wait();
    if (q3.message?.text === "7") {
        score++;
        await ctx.reply("Correct!");
    } else {
        await ctx.reply("Wrong! The answer is 7.");
    }

    ctx.session.quizScore += score;
    await ctx.reply(
        `🎉 Quiz complete!\n` +
        `Score: ${score}/3\n` +
        `Total lifetime score: ${ctx.session.quizScore}`
    );
}

bot.use(createConversation(quiz));

// Conversation: Reminder
async function setReminder(conversation: Conversation<MyContext>, ctx: MyContext) {
    await ctx.reply("What should I remind you about?");
    const { message } = await conversation.wait();
    const reminderText = message?.text;

    if (!reminderText) {
        await ctx.reply("Please provide a valid reminder text.");
        return;
    }

    await ctx.reply("In how many minutes? (enter a number)");
    const { message: timeMsg } = await conversation.wait();
    const minutes = parseInt(timeMsg?.text || "0");

    if (isNaN(minutes) || minutes <= 0) {
        await ctx.reply("Please provide a valid number of minutes.");
        return;
    }

    const reminderTime = new Date(Date.now() + minutes * 60 * 1000);
    ctx.session.reminders.push({ text: reminderText, time: reminderTime });

    await ctx.reply(`Reminder set! I'll remind you about "${reminderText}" in ${minutes} minute(s).`);

    // Set actual reminder
    setTimeout(() => {
        ctx.reply(`🔔 Reminder: ${reminderText}`);
    }, minutes * 60 * 1000);
}

bot.use(createConversation(setReminder));

// Interactive Menu
const menu = new Menu<MyContext>("main-menu")
    .text("My Stats", async (ctx) => {
        const stats = `
Your Statistics:
━━━━━━━━━━━━━━━━
👤 Name: ${ctx.session.userData.name || 'Not set'}
Messages sent: ${ctx.session.messageCount}
Last command: ${ctx.session.lastCommand || 'None'}
Interests: ${ctx.session.userData.interests?.join(', ') || 'None'}
Language: ${ctx.session.userData.language || 'Not set'}
Quiz score: ${ctx.session.quizScore}
Favorites: ${ctx.session.favoriteMessages.length}
    `.trim();
        await ctx.reply(stats);
    }).row()
    .text("Random Fact", async (ctx) => {
        const facts = [
            "Honey never spoils. Archaeologists have found 3000-year-old honey that's still edible!",
            "A group of flamingos is called a 'flamboyance'.",
            "Octopuses have three hearts and blue blood.",
            "Bananas are berries, but strawberries aren't!",
            "The shortest war in history lasted 38-45 minutes.",
            "A day on Venus is longer than a year on Venus!",
            "Wombat poop is cube-shaped.",
            "There are more stars in the universe than grains of sand on Earth."
        ];
        await ctx.reply(`💡 ${facts[Math.floor(Math.random() * facts.length)]}`);
    }).row()
    .text("🎯 Start Quiz", async (ctx) => {
        await ctx.conversation.enter("quiz");
    })
    .text("⏰ Set Reminder", async (ctx) => {
        await ctx.conversation.enter("setReminder");
    }).row()
    .text("⭐ View Favorites", async (ctx) => {
        if (ctx.session.favoriteMessages.length === 0) {
            await ctx.reply("You haven't saved any favorite messages yet!\n\nReply to any message with /save to add it to favorites.");
        } else {
            const favs = ctx.session.favoriteMessages
                .map((msg: string, i: number) => `${i + 1}. ${msg}`)
                .join('\n\n');
            await ctx.reply(`⭐ Your Favorite Messages:\n\n${favs}`);
        }
    }).row()
    .text("🔙 Close Menu", (ctx) => ctx.deleteMessage());

bot.use(menu);

// Command: Start with inline keyboard
bot.command("start", async (ctx) => {
    ctx.session.lastCommand = '/start';

    const keyboard = new InlineKeyboard()
        .text("✨ Setup Profile", "setup")
        .row()
        .text("📖 Help", "help")
        .text("ℹ️ About", "about");

    await ctx.reply(
        "🤖 *Welcome to the Smart Bot!*\n\n" +
        "I'm feature-rich with:\n" +
        "• 👤 Session management\n" +
        "• 💬 Interactive conversations\n" +
        "• 📊 Dynamic menus\n" +
        "• ⌨️ Inline keyboards\n" +
        "• 📈 Message analytics\n" +
        "• 🎯 Quiz games\n" +
        "• ⏰ Reminders\n" +
        "• ⭐ Favorite messages\n" +
        "• 🌍 Multi-language support\n" +
        "• 🎲 Random facts\n\n" +
        "Choose an option below to get started:",
        {
            parse_mode: "Markdown",
            reply_markup: keyboard
        }
    );
});

// Command: Menu
bot.command("menu", (ctx) => {
    ctx.session.lastCommand = '/menu';
    return ctx.reply("🎯 Interactive Menu - Choose an option:", { reply_markup: menu });
});

// Command: Stats
bot.command("stats", async (ctx) => {
    ctx.session.lastCommand = '/stats';

    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    await ctx.reply(
        `🤖 *Bot Statistics*\n\n` +
        `⏱️ Uptime: ${hours}h ${minutes}m ${seconds}s\n` +
        `💾 Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\n` +
        `📊 Your messages: ${ctx.session.messageCount}\n` +
        `🏆 Quiz score: ${ctx.session.quizScore}\n` +
        `⏰ Active reminders: ${ctx.session.reminders.length}`,
        { parse_mode: "Markdown" }
    );
});

// Command: Help
bot.command("help", (ctx) => {
    ctx.session.lastCommand = '/help';

    return ctx.reply(
        "📚 *Available Commands:*\n\n" +
        "/start - Welcome message\n" +
        "/menu - Interactive menu\n" +
        "/setup - Configure your profile\n" +
        "/stats - View bot statistics\n" +
        "/poll - Create a quick poll\n" +
        "/quiz - Start a quiz game\n" +
        "/reminder - Set a reminder\n" +
        "/save - Save a message to favorites (reply to a message)\n" +
        "/weather - Get weather info\n" +
        "/joke - Get a random joke\n" +
        "/calculate - Simple calculator\n" +
        "/help - Show this message",
        { parse_mode: "Markdown" }
    );
});

// Command: Setup (starts conversation)
bot.command("setup", async (ctx) => {
    ctx.session.lastCommand = '/setup';
    await ctx.conversation.enter("onboarding");
});

// Command: Quiz
bot.command("quiz", async (ctx) => {
    ctx.session.lastCommand = '/quiz';
    await ctx.conversation.enter("quiz");
});

// Command: Reminder
bot.command("reminder", async (ctx) => {
    ctx.session.lastCommand = '/reminder';
    await ctx.conversation.enter("setReminder");
});

// Command: Create Poll
bot.command("poll", async (ctx) => {
    ctx.session.lastCommand = '/poll';

    await ctx.replyWithPoll(
        "What's your favorite programming language?",
        ["TypeScript", "Python", "Rust", "Go", "JavaScript"],
        { is_anonymous: false }
    );
});

// Command: Weather (simulated)
bot.command("weather", async (ctx) => {
    ctx.session.lastCommand = '/weather';

    const cities = ["New York", "London", "Tokyo", "Paris", "Sydney"];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const temp = Math.floor(Math.random() * 30) + 10;
    const conditions = ["Sunny", "Cloudy", "Rainy", "Partly Cloudy", "Windy"];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];

    await ctx.reply(
        ` *Weather in ${city}*\n\n` +
        `Temperature: ${temp}°C\n` +
        `Conditions: ${condition}\n` +
        `Humidity: ${Math.floor(Math.random() * 40) + 40}%\n\n` +
        `_Note: This is simulated data_`,
        { parse_mode: "Markdown" }
    );
});

// Command: Joke
bot.command("joke", async (ctx) => {
    ctx.session.lastCommand = '/joke';

    const jokes = [
        "Why do programmers prefer dark mode? Because light attracts bugs!",
        "Why did the developer go broke? Because he used up all his cache!",
        "What's a programmer's favorite hangout place? Foo Bar!",
        "Why do Java developers wear glasses? Because they don't C#!",
        "How many programmers does it take to change a light bulb? None, that's a hardware problem!",
        "Why did the programmer quit his job? He didn't get arrays!",
        "What do you call a programmer from Finland? Nerdic!"
    ];

    await ctx.reply(` ${jokes[Math.floor(Math.random() * jokes.length)]}`);
});

// Command: Calculate
bot.command("calculate", async (ctx) => {
    ctx.session.lastCommand = '/calculate';

    const args = ctx.message?.text.split(' ').slice(1);

    if (!args || args.length < 3) {
        return ctx.reply(
            " Calculator Usage:\n\n" +
            "/calculate <number> <operator> <number>\n\n" +
            "Example: /calculate 10 + 5\n" +
            "Operators: +, -, *, /"
        );
    }

    const num1 = parseFloat(args[0]);
    const operator = args[1];
    const num2 = parseFloat(args[2]);

    if (isNaN(num1) || isNaN(num2)) {
        return ctx.reply(" Invalid numbers provided!");
    }

    let result: number;
    switch (operator) {
        case '+':
            result = num1 + num2;
            break;
        case '-':
            result = num1 - num2;
            break;
        case '*':
            result = num1 * num2;
            break;
        case '/':
            if (num2 === 0) {
                return ctx.reply("Cannot divide by zero!");
            }
            result = num1 / num2;
            break;
        default:
            return ctx.reply("Invalid operator! Use +, -, *, or /");
    }

    await ctx.reply(` ${num1} ${operator} ${num2} = *${result}*`, { parse_mode: "Markdown" });
});

// Command: Save message to favorites
bot.command("save", async (ctx) => {
    ctx.session.lastCommand = '/save';

    if (!ctx.message?.reply_to_message?.text) {
        return ctx.reply("Please reply to a message with /save to add it to your favorites!");
    }

    const messageText = ctx.message.reply_to_message.text;
    ctx.session.favoriteMessages.push(messageText);

    await ctx.reply(`Message saved to favorites! You now have ${ctx.session.favoriteMessages.length} favorite message(s).`);
});

// Callback query handlers
bot.callbackQuery("setup", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.conversation.enter("onboarding");
});

bot.callbackQuery(/lang_.*/, async (ctx) => {
    const lang = ctx.callbackQuery.data.replace("lang_", "");
    ctx.session.userData.language = lang;
    await ctx.answerCallbackQuery(`Language set to ${lang}!`);
});

bot.callbackQuery("help", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(
        "📚 This bot demonstrates:\n\n" +
        "✓ Session management\n" +
        "✓ Conversation flows\n" +
        "✓ Interactive menus\n" +
        "✓ Inline keyboards\n" +
        "✓ Callback queries\n" +
        "✓ Polls & analytics\n" +
        "✓ Quiz games\n" +
        "✓ Reminders\n" +
        "✓ Calculator\n" +
        "✓ Favorite messages\n\n" +
        "Use /help for command list!"
    );
});

bot.callbackQuery("about", async (ctx) => {
    await ctx.answerCallbackQuery("Made with Grammy");
    await ctx.reply(
        " *About This Bot*\n\n" +
        "Built with Grammy framework\n" +
        "Version: 2.0.0\n" +
        "Features: Advanced middleware, conversations, analytics, games, and more!\n\n" +
        "Perfect for interviews! 🚀",
        { parse_mode: "Markdown" }
    );
});

// Message handler with analytics and smart responses
bot.on("message:text", (ctx) => {
    ctx.session.messageCount++;

    const text = ctx.message.text.toLowerCase();

    // Smart responses based on keywords
    if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
        return ctx.reply(`Hey ${ctx.session.userData.name || 'there'}! 👋 How can I help?`);
    }

    if (text.includes("bye") || text.includes("goodbye")) {
        return ctx.reply(`Goodbye ${ctx.session.userData.name || 'friend'}! See you soon! 👋`);
    }

    if (text.includes("thank")) {
        return ctx.reply("You're welcome! Happy to help! 😊");
    }

    if (text.includes("help")) {
        return ctx.reply("Type /help to see all available commands!");
    }

    if (text.includes("joke") || text.includes("funny")) {
        return ctx.reply("Want a joke? Try /joke 😄");
    }

    // Echo back with encouragement
    const encouragements = [
        "Interesting message! ",
        "Got it! ",
        "Message received! ",
        "Thanks for sharing! ",
        "Noted! "
    ];

    const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];

    ctx.reply(
        `${encouragement}\n\n` +
        `Message #${ctx.session.messageCount}\n` +
        `Try /menu for interactive features!`
    );
});

// Message handler for stickers
bot.on("message:sticker", (ctx) => {
    ctx.session.messageCount++;
    const responses = [
        "Cool sticker! 🎨",
        "Nice one! 😄",
        "Love that sticker! ⭐",
        "Great choice! 👍"
    ];
    return ctx.reply(responses[Math.floor(Math.random() * responses.length)]);
});

// Message handler for photos
bot.on("message:photo", (ctx) => {
    ctx.session.messageCount++;
    return ctx.reply("Nice photo! 📸 I can see you shared an image. Looking good!");
});

// Message handler for voice messages
bot.on("message:voice", (ctx) => {
    ctx.session.messageCount++;
    const duration = ctx.message.voice.duration;
    return ctx.reply(`🎤 Thanks for the voice message! (${duration}s)\nI heard you loud and clear!`);
});

// Message handler for documents
bot.on("message:document", (ctx) => {
    ctx.session.messageCount++;
    const fileName = ctx.message.document.file_name || "unknown";
    return ctx.reply(`📎 Document received: ${fileName}\nThanks for sharing!`);
});

// Message handler for locations
bot.on("message:location", (ctx) => {
    ctx.session.messageCount++;
    const lat = ctx.message.location.latitude;
    const lon = ctx.message.location.longitude;
    return ctx.reply(`Location received!\nLatitude: ${lat}\nLongitude: ${lon}\n\nThanks for sharing your location!`);
});

// Error handling
bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    console.error(err.error);

    ctx.reply("An error occurred. Please try again or contact support.");
});

// Graceful shutdown
process.once("SIGINT", () => {
    console.log("Shutting down gracefully...");
    bot.stop();
});

process.once("SIGTERM", () => {
    console.log("Shutting down gracefully...");
    bot.stop();
});

// Start the bot
bot.start()
    .then(() => {
        console.log("Bot is running!");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("Features enabled:");
        console.log("  ✓ Session management");
        console.log("  ✓ Conversation flows");
        console.log("  ✓ Interactive menus");
        console.log("  ✓ Inline keyboards");
        console.log("  ✓ Message analytics");
        console.log("  ✓ Quiz games");
        console.log("  ✓ Reminders");
        console.log("  ✓ Calculator");
        console.log("  ✓ Favorite messages");
        console.log("  ✓ Weather info");
        console.log("  ✓ Jokes");
        console.log("  ✓ Smart responses");
        console.log("  ✓ Multi-media support");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    })
    .catch((err) => {
        console.error("Bot failed to start:", err);
        process.exit(1);
    });