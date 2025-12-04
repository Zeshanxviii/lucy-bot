"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var grammy_1 = require("grammy");
var menu_1 = require("@grammyjs/menu");
var conversations_1 = require("@grammyjs/conversations");
require("dotenv/config");
var bot = new grammy_1.Bot(process.env.BOT_TOKEN);
// Middleware: Session management
bot.use((0, grammy_1.session)({
    initial: function () { return ({
        messageCount: 0,
        lastCommand: '',
        userData: {},
        reminders: [],
        favoriteMessages: [],
        quizScore: 0
    }); }
}));
bot.use((0, conversations_1.conversations)());
// Conversation: User onboarding
function onboarding(conversation, ctx) {
    return __awaiter(this, void 0, void 0, function () {
        var message, name, interestsMsg, interests, langKeyboard, langResponse, lang;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, ctx.reply("Let's get you set up! What's your name?")];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, conversation.wait()];
                case 2:
                    message = (_b.sent()).message;
                    name = message === null || message === void 0 ? void 0 : message.text;
                    if (!!name) return [3 /*break*/, 4];
                    return [4 /*yield*/, ctx.reply("Please provide a valid name.")];
                case 3:
                    _b.sent();
                    return [2 /*return*/];
                case 4:
                    ctx.session.userData.name = name;
                    return [4 /*yield*/, ctx.reply("Nice to meet you, ".concat(name, "! What are your interests? (comma-separated)"))];
                case 5:
                    _b.sent();
                    return [4 /*yield*/, conversation.wait()];
                case 6:
                    interestsMsg = (_b.sent()).message;
                    interests = ((_a = interestsMsg === null || interestsMsg === void 0 ? void 0 : interestsMsg.text) === null || _a === void 0 ? void 0 : _a.split(',').map(function (i) { return i.trim(); })) || [];
                    ctx.session.userData.interests = interests;
                    langKeyboard = new grammy_1.InlineKeyboard()
                        .text("🇬🇧 English", "lang_en")
                        .text("🇪🇸 Spanish", "lang_es")
                        .row()
                        .text("🇫🇷 French", "lang_fr")
                        .text("🇩🇪 German", "lang_de");
                    return [4 /*yield*/, ctx.reply("Choose your preferred language:", { reply_markup: langKeyboard })];
                case 7:
                    _b.sent();
                    return [4 /*yield*/, conversation.waitForCallbackQuery(["lang_en", "lang_es", "lang_fr", "lang_de"])];
                case 8:
                    langResponse = _b.sent();
                    lang = langResponse.callbackQuery.data.replace("lang_", "");
                    ctx.session.userData.language = lang;
                    return [4 /*yield*/, langResponse.answerCallbackQuery("Language set!")];
                case 9:
                    _b.sent();
                    return [4 /*yield*/, ctx.reply("Profile complete!\n" +
                            "Name: ".concat(name, "\n") +
                            "Interests: ".concat(interests.join(', '), "\n") +
                            "Language: ".concat(lang, "\n\n") +
                            "Use /menu to explore features!")];
                case 10:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
bot.use((0, conversations_1.createConversation)(onboarding));
// Conversation: Quiz
function quiz(conversation, ctx) {
    return __awaiter(this, void 0, void 0, function () {
        var score, q1, q2, q3;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    score = 0;
                    return [4 /*yield*/, ctx.reply("🎯 Let's start a quick quiz! Answer 3 questions.\n\nQuestion 1: What is 2 + 2?")];
                case 1:
                    _e.sent();
                    return [4 /*yield*/, conversation.wait()];
                case 2:
                    q1 = _e.sent();
                    if (!(((_a = q1.message) === null || _a === void 0 ? void 0 : _a.text) === "4")) return [3 /*break*/, 4];
                    score++;
                    return [4 /*yield*/, ctx.reply("Correct!")];
                case 3:
                    _e.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, ctx.reply("Wrong! The answer is 4.")];
                case 5:
                    _e.sent();
                    _e.label = 6;
                case 6: return [4 /*yield*/, ctx.reply("Question 2: What is the capital of France?")];
                case 7:
                    _e.sent();
                    return [4 /*yield*/, conversation.wait()];
                case 8:
                    q2 = _e.sent();
                    if (!(((_c = (_b = q2.message) === null || _b === void 0 ? void 0 : _b.text) === null || _c === void 0 ? void 0 : _c.toLowerCase()) === "paris")) return [3 /*break*/, 10];
                    score++;
                    return [4 /*yield*/, ctx.reply("Correct!")];
                case 9:
                    _e.sent();
                    return [3 /*break*/, 12];
                case 10: return [4 /*yield*/, ctx.reply("Wrong! The answer is Paris.")];
                case 11:
                    _e.sent();
                    _e.label = 12;
                case 12: return [4 /*yield*/, ctx.reply("Question 3: How many continents are there?")];
                case 13:
                    _e.sent();
                    return [4 /*yield*/, conversation.wait()];
                case 14:
                    q3 = _e.sent();
                    if (!(((_d = q3.message) === null || _d === void 0 ? void 0 : _d.text) === "7")) return [3 /*break*/, 16];
                    score++;
                    return [4 /*yield*/, ctx.reply("Correct!")];
                case 15:
                    _e.sent();
                    return [3 /*break*/, 18];
                case 16: return [4 /*yield*/, ctx.reply("Wrong! The answer is 7.")];
                case 17:
                    _e.sent();
                    _e.label = 18;
                case 18:
                    ctx.session.quizScore += score;
                    return [4 /*yield*/, ctx.reply("\uD83C\uDF89 Quiz complete!\n" +
                            "Score: ".concat(score, "/3\n") +
                            "Total lifetime score: ".concat(ctx.session.quizScore))];
                case 19:
                    _e.sent();
                    return [2 /*return*/];
            }
        });
    });
}
bot.use((0, conversations_1.createConversation)(quiz));
// Conversation: Reminder
function setReminder(conversation, ctx) {
    return __awaiter(this, void 0, void 0, function () {
        var message, reminderText, timeMsg, minutes, reminderTime;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ctx.reply("What should I remind you about?")];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, conversation.wait()];
                case 2:
                    message = (_a.sent()).message;
                    reminderText = message === null || message === void 0 ? void 0 : message.text;
                    if (!!reminderText) return [3 /*break*/, 4];
                    return [4 /*yield*/, ctx.reply("Please provide a valid reminder text.")];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
                case 4: return [4 /*yield*/, ctx.reply("In how many minutes? (enter a number)")];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, conversation.wait()];
                case 6:
                    timeMsg = (_a.sent()).message;
                    minutes = parseInt((timeMsg === null || timeMsg === void 0 ? void 0 : timeMsg.text) || "0");
                    if (!(isNaN(minutes) || minutes <= 0)) return [3 /*break*/, 8];
                    return [4 /*yield*/, ctx.reply("Please provide a valid number of minutes.")];
                case 7:
                    _a.sent();
                    return [2 /*return*/];
                case 8:
                    reminderTime = new Date(Date.now() + minutes * 60 * 1000);
                    ctx.session.reminders.push({ text: reminderText, time: reminderTime });
                    return [4 /*yield*/, ctx.reply("Reminder set! I'll remind you about \"".concat(reminderText, "\" in ").concat(minutes, " minute(s)."))];
                case 9:
                    _a.sent();
                    // Set actual reminder
                    setTimeout(function () {
                        ctx.reply("\uD83D\uDD14 Reminder: ".concat(reminderText));
                    }, minutes * 60 * 1000);
                    return [2 /*return*/];
            }
        });
    });
}
bot.use((0, conversations_1.createConversation)(setReminder));
// Interactive Menu
var menu = new menu_1.Menu("main-menu")
    .text("My Stats", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var stats;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                stats = "\nYour Statistics:\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n\uD83D\uDC64 Name: ".concat(ctx.session.userData.name || 'Not set', "\nMessages sent: ").concat(ctx.session.messageCount, "\nLast command: ").concat(ctx.session.lastCommand || 'None', "\nInterests: ").concat(((_a = ctx.session.userData.interests) === null || _a === void 0 ? void 0 : _a.join(', ')) || 'None', "\nLanguage: ").concat(ctx.session.userData.language || 'Not set', "\nQuiz score: ").concat(ctx.session.quizScore, "\nFavorites: ").concat(ctx.session.favoriteMessages.length, "\n    ").trim();
                return [4 /*yield*/, ctx.reply(stats)];
            case 1:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); }).row()
    .text("Random Fact", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var facts;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                facts = [
                    "Honey never spoils. Archaeologists have found 3000-year-old honey that's still edible!",
                    "A group of flamingos is called a 'flamboyance'.",
                    "Octopuses have three hearts and blue blood.",
                    "Bananas are berries, but strawberries aren't!",
                    "The shortest war in history lasted 38-45 minutes.",
                    "A day on Venus is longer than a year on Venus!",
                    "Wombat poop is cube-shaped.",
                    "There are more stars in the universe than grains of sand on Earth."
                ];
                return [4 /*yield*/, ctx.reply("\uD83D\uDCA1 ".concat(facts[Math.floor(Math.random() * facts.length)]))];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }).row()
    .text("🎯 Start Quiz", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ctx.conversation.enter("quiz")];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })
    .text("⏰ Set Reminder", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ctx.conversation.enter("setReminder")];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); }).row()
    .text("⭐ View Favorites", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var favs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(ctx.session.favoriteMessages.length === 0)) return [3 /*break*/, 2];
                return [4 /*yield*/, ctx.reply("You haven't saved any favorite messages yet!\n\nReply to any message with /save to add it to favorites.")];
            case 1:
                _a.sent();
                return [3 /*break*/, 4];
            case 2:
                favs = ctx.session.favoriteMessages
                    .map(function (msg, i) { return "".concat(i + 1, ". ").concat(msg); })
                    .join('\n\n');
                return [4 /*yield*/, ctx.reply("\u2B50 Your Favorite Messages:\n\n".concat(favs))];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); }).row()
    .text("🔙 Close Menu", function (ctx) { return ctx.deleteMessage(); });
bot.use(menu);
// Command: Start with inline keyboard
bot.command("start", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var keyboard;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ctx.session.lastCommand = '/start';
                keyboard = new grammy_1.InlineKeyboard()
                    .text("✨ Setup Profile", "setup")
                    .row()
                    .text("📖 Help", "help")
                    .text("ℹ️ About", "about");
                return [4 /*yield*/, ctx.reply("🤖 *Welcome to the Smart Bot!*\n\n" +
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
                        "Choose an option below to get started:", {
                        parse_mode: "Markdown",
                        reply_markup: keyboard
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
// Command: Menu
bot.command("menu", function (ctx) {
    ctx.session.lastCommand = '/menu';
    return ctx.reply("🎯 Interactive Menu - Choose an option:", { reply_markup: menu });
});
// Command: Stats
bot.command("stats", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var uptime, hours, minutes, seconds;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ctx.session.lastCommand = '/stats';
                uptime = process.uptime();
                hours = Math.floor(uptime / 3600);
                minutes = Math.floor((uptime % 3600) / 60);
                seconds = Math.floor(uptime % 60);
                return [4 /*yield*/, ctx.reply("\uD83E\uDD16 *Bot Statistics*\n\n" +
                        "\u23F1\uFE0F Uptime: ".concat(hours, "h ").concat(minutes, "m ").concat(seconds, "s\n") +
                        "\uD83D\uDCBE Memory: ".concat((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2), " MB\n") +
                        "\uD83D\uDCCA Your messages: ".concat(ctx.session.messageCount, "\n") +
                        "\uD83C\uDFC6 Quiz score: ".concat(ctx.session.quizScore, "\n") +
                        "\u23F0 Active reminders: ".concat(ctx.session.reminders.length), { parse_mode: "Markdown" })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
// Command: Help
bot.command("help", function (ctx) {
    ctx.session.lastCommand = '/help';
    return ctx.reply("📚 *Available Commands:*\n\n" +
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
        "/help - Show this message", { parse_mode: "Markdown" });
});
// Command: Setup (starts conversation)
bot.command("setup", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ctx.session.lastCommand = '/setup';
                return [4 /*yield*/, ctx.conversation.enter("onboarding")];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
// Command: Quiz
bot.command("quiz", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ctx.session.lastCommand = '/quiz';
                return [4 /*yield*/, ctx.conversation.enter("quiz")];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
// Command: Reminder
bot.command("reminder", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ctx.session.lastCommand = '/reminder';
                return [4 /*yield*/, ctx.conversation.enter("setReminder")];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
// Command: Create Poll
bot.command("poll", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ctx.session.lastCommand = '/poll';
                return [4 /*yield*/, ctx.replyWithPoll("What's your favorite programming language?", ["TypeScript", "Python", "Rust", "Go", "JavaScript"], { is_anonymous: false })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
// Command: Weather (simulated)
bot.command("weather", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var cities, city, temp, conditions, condition;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ctx.session.lastCommand = '/weather';
                cities = ["New York", "London", "Tokyo", "Paris", "Sydney"];
                city = cities[Math.floor(Math.random() * cities.length)];
                temp = Math.floor(Math.random() * 30) + 10;
                conditions = ["Sunny", "Cloudy", "Rainy", "Partly Cloudy", "Windy"];
                condition = conditions[Math.floor(Math.random() * conditions.length)];
                return [4 /*yield*/, ctx.reply(" *Weather in ".concat(city, "*\n\n") +
                        "Temperature: ".concat(temp, "\u00B0C\n") +
                        "Conditions: ".concat(condition, "\n") +
                        "Humidity: ".concat(Math.floor(Math.random() * 40) + 40, "%\n\n") +
                        "_Note: This is simulated data_", { parse_mode: "Markdown" })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
// Command: Joke
bot.command("joke", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var jokes;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ctx.session.lastCommand = '/joke';
                jokes = [
                    "Why do programmers prefer dark mode? Because light attracts bugs!",
                    "Why did the developer go broke? Because he used up all his cache!",
                    "What's a programmer's favorite hangout place? Foo Bar!",
                    "Why do Java developers wear glasses? Because they don't C#!",
                    "How many programmers does it take to change a light bulb? None, that's a hardware problem!",
                    "Why did the programmer quit his job? He didn't get arrays!",
                    "What do you call a programmer from Finland? Nerdic!"
                ];
                return [4 /*yield*/, ctx.reply(" ".concat(jokes[Math.floor(Math.random() * jokes.length)]))];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
// Command: Calculate
bot.command("calculate", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var args, num1, operator, num2, result;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                ctx.session.lastCommand = '/calculate';
                args = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text.split(' ').slice(1);
                if (!args || args.length < 3) {
                    return [2 /*return*/, ctx.reply(" Calculator Usage:\n\n" +
                            "/calculate <number> <operator> <number>\n\n" +
                            "Example: /calculate 10 + 5\n" +
                            "Operators: +, -, *, /")];
                }
                num1 = parseFloat(args[0]);
                operator = args[1];
                num2 = parseFloat(args[2]);
                if (isNaN(num1) || isNaN(num2)) {
                    return [2 /*return*/, ctx.reply(" Invalid numbers provided!")];
                }
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
                            return [2 /*return*/, ctx.reply("Cannot divide by zero!")];
                        }
                        result = num1 / num2;
                        break;
                    default:
                        return [2 /*return*/, ctx.reply("Invalid operator! Use +, -, *, or /")];
                }
                return [4 /*yield*/, ctx.reply(" ".concat(num1, " ").concat(operator, " ").concat(num2, " = *").concat(result, "*"), { parse_mode: "Markdown" })];
            case 1:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); });
// Command: Save message to favorites
bot.command("save", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var messageText;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                ctx.session.lastCommand = '/save';
                if (!((_b = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.reply_to_message) === null || _b === void 0 ? void 0 : _b.text)) {
                    return [2 /*return*/, ctx.reply("Please reply to a message with /save to add it to your favorites!")];
                }
                messageText = ctx.message.reply_to_message.text;
                ctx.session.favoriteMessages.push(messageText);
                return [4 /*yield*/, ctx.reply("Message saved to favorites! You now have ".concat(ctx.session.favoriteMessages.length, " favorite message(s)."))];
            case 1:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
// Callback query handlers
bot.callbackQuery("setup", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ctx.answerCallbackQuery()];
            case 1:
                _a.sent();
                return [4 /*yield*/, ctx.conversation.enter("onboarding")];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
bot.callbackQuery(/lang_.*/, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var lang;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                lang = ctx.callbackQuery.data.replace("lang_", "");
                ctx.session.userData.language = lang;
                return [4 /*yield*/, ctx.answerCallbackQuery("Language set to ".concat(lang, "!"))];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
bot.callbackQuery("help", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ctx.answerCallbackQuery()];
            case 1:
                _a.sent();
                return [4 /*yield*/, ctx.reply("📚 This bot demonstrates:\n\n" +
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
                        "Use /help for command list!")];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
bot.callbackQuery("about", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ctx.answerCallbackQuery("Made with Grammy")];
            case 1:
                _a.sent();
                return [4 /*yield*/, ctx.reply(" *About This Bot*\n\n" +
                        "Built with Grammy framework\n" +
                        "Version: 2.0.0\n" +
                        "Features: Advanced middleware, conversations, analytics, games, and more!\n\n" +
                        "Perfect for interviews! 🚀", { parse_mode: "Markdown" })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
// Message handler with analytics and smart responses
bot.on("message:text", function (ctx) {
    ctx.session.messageCount++;
    var text = ctx.message.text.toLowerCase();
    // Smart responses based on keywords
    if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
        return ctx.reply("Hey ".concat(ctx.session.userData.name || 'there', "! \uD83D\uDC4B How can I help?"));
    }
    if (text.includes("bye") || text.includes("goodbye")) {
        return ctx.reply("Goodbye ".concat(ctx.session.userData.name || 'friend', "! See you soon! \uD83D\uDC4B"));
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
    var encouragements = [
        "Interesting message! ",
        "Got it! ",
        "Message received! ",
        "Thanks for sharing! ",
        "Noted! "
    ];
    var encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    ctx.reply("".concat(encouragement, "\n\n") +
        "Message #".concat(ctx.session.messageCount, "\n") +
        "Try /menu for interactive features!");
});
// Message handler for stickers
bot.on("message:sticker", function (ctx) {
    ctx.session.messageCount++;
    var responses = [
        "Cool sticker! 🎨",
        "Nice one! 😄",
        "Love that sticker! ⭐",
        "Great choice! 👍"
    ];
    return ctx.reply(responses[Math.floor(Math.random() * responses.length)]);
});
// Message handler for photos
bot.on("message:photo", function (ctx) {
    ctx.session.messageCount++;
    return ctx.reply("Nice photo! 📸 I can see you shared an image. Looking good!");
});
// Message handler for voice messages
bot.on("message:voice", function (ctx) {
    ctx.session.messageCount++;
    var duration = ctx.message.voice.duration;
    return ctx.reply("\uD83C\uDFA4 Thanks for the voice message! (".concat(duration, "s)\nI heard you loud and clear!"));
});
// Message handler for documents
bot.on("message:document", function (ctx) {
    ctx.session.messageCount++;
    var fileName = ctx.message.document.file_name || "unknown";
    return ctx.reply("\uD83D\uDCCE Document received: ".concat(fileName, "\nThanks for sharing!"));
});
// Message handler for locations
bot.on("message:location", function (ctx) {
    ctx.session.messageCount++;
    var lat = ctx.message.location.latitude;
    var lon = ctx.message.location.longitude;
    return ctx.reply("Location received!\nLatitude: ".concat(lat, "\nLongitude: ").concat(lon, "\n\nThanks for sharing your location!"));
});
// Error handling
bot.catch(function (err) {
    var ctx = err.ctx;
    console.error("Error while handling update ".concat(ctx.update.update_id, ":"));
    console.error(err.error);
    ctx.reply("An error occurred. Please try again or contact support.");
});
// Graceful shutdown
process.once("SIGINT", function () {
    console.log("Shutting down gracefully...");
    bot.stop();
});
process.once("SIGTERM", function () {
    console.log("Shutting down gracefully...");
    bot.stop();
});
// Start the bot
bot.start()
    .then(function () {
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
    .catch(function (err) {
    console.error("Bot failed to start:", err);
    process.exit(1);
});
