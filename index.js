const TelegramBot = require('node-telegram-bot-api');
const math = require('mathjs');

const TOKEN = process.env.TOKEN;

// Create a new instance of the Telegram Bot
const bot = new TelegramBot(TOKEN, { polling: true });

// Handle the /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Hello! I\'m the bot of the group Oasis. Type /help to see available commands.');
});

const helpMessage = 'Available commands: \n' + '/start - Start the bot\n' + '/help - Show this help message\n' + '/calculate - Calculate a mathematical expression';

bot.onText(/\/help/, (msg) => {
    const chatID = msg.chat.id;
    bot.sendMessage(chatID, helpMessage);
});


const badWordsList = ['lee', 'kmkl', 'mmsp', 'fuck', 'nigga', 'shit'];
var warnings = 0;

bot.on('message', (msg) => {
    // Check if the message contains any bad words
    if (msg.text && containsBadWords(msg.text)) {
        // Delete the message
        bot.deleteMessage(msg.chat.id, msg.message_id);

        // Warn the user
        bot.sendMessage(msg.chat.id, `Your message contained inappropriate content. Please refrain from using such language.`);
        warnings++;
        if (warnings >= 3) {
            muteUser(msg.chat.id, msg.from.id, 300);
        }
    }

    else if (msg.text && msg.text.startsWith('/calculate')) {
        const problem = msg.text.replace('/calculate', '').trim();
        if (problem) {
            try {
                const result = calculate(problem);
                bot.sendMessage(msg.chat.id, `The result is: ${result}`);
            } catch (error) {
                bot.sendMessage(msg.chat.id, 'Invalid mathematical expression.');
            }
        } else {
            bot.sendMessage(msg.chat.id, 'Please enter a mathematical expression after /calculate.');
        }
    }
});

function calculate(problem) {
    // Regular expressions to match patterns in word problems
    const additionRegex = /(\d+)\s*plus\s*(\d+)/i;
    const subtractionRegex = /(\d+)\s*minus\s*(\d+)/i;
    const multiplicationRegex = /(\d+)\s*times\s*(\d+)/i;
    const divisionRegex = /(\d+)\s*divided\s*by\s*(\d+)/i;

    // Match the problem against different patterns
    let match;
    if ((match = problem.match(additionRegex))) {
        return parseInt(match[1]) + parseInt(match[2]);
    } else if ((match = problem.match(subtractionRegex))) {
        return parseInt(match[1]) - parseInt(match[2]);
    } else if ((match = problem.match(multiplicationRegex))) {
        return parseInt(match[1]) * parseInt(match[2]);
    } else if ((match = problem.match(divisionRegex))) {
        return parseInt(match[1]) / parseInt(match[2]);
    } else {
        // If no pattern is matched, try to extract numerical values and perform addition
        const numbers = problem.match(/\b\d+\b/g);
        if (numbers && numbers.length >= 2) {
            return numbers.reduce((total, num) => total + parseInt(num), 0);
        } else {
            // If no pattern or numerical values are matched, consider it an invalid expression
            throw new Error('Invalid mathematical expression.');
        }
    }
}


// Mute function
function muteUser(chatId, userId, durationSeconds) {
    // Use restrictChatMember method to mute the user
    bot.restrictChatMember(chatId, userId, {
        until_date: Math.floor(Date.now() / 1000) + durationSeconds,
        can_send_messages: false,
        can_send_media_messages: false,
        can_send_other_messages: false,
        can_add_web_page_previews: false,
        can_send_polls: false,
        can_invite_users: false,
    }).catch((error) => {
        console.error(`Error muting user: ${error.message}`);
    });
}

function containsBadWords(message) {
    const lowerCaseMessage = message.toLowerCase();
    return badWordsList.some((badWord) => {
        const regex = new RegExp(`\\b${badWord}\\b`, 'i');
        return regex.test(lowerCaseMessage);
    });
}


// Log errors
bot.on('polling_error', (error) => {
    console.error(error);
});

// Log when the bot is ready
bot.on('polling', () => {
    console.log('Bot is polling...');
});
