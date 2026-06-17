import { Telegraf, Context, Markup } from 'telegraf';
import { message } from 'telegraf/filters';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
// @ts-ignore
import { HttpsProxyAgent } from 'https-proxy-agent';

dotenv.config();

const prisma = new PrismaClient();

const telegrafOptions: any = {};
if (process.env.TELEGRAM_PROXY_URL) {
  telegrafOptions.telegram = {
    agent: new HttpsProxyAgent(process.env.TELEGRAM_PROXY_URL),
  };
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '', telegrafOptions);

// Middleware to log messages and ensure bot only talks to authorized users if needed
bot.use(async (ctx, next) => {
  // console.log('Telegram update:', ctx.update);
  return next();
});

// /start command
bot.start((ctx) => {
  return ctx.reply(
    'Welcome to Trodat Shop! 🛒\n\nPlease share your contact to link your account and receive order notifications.',
    Markup.keyboard([
      [Markup.button.contactRequest('📱 Share Contact')],
    ]).resize()
  );
});

// Handle contact sharing
bot.on(message('contact'), async (ctx) => {
  const contact = ctx.message.contact;
  if (!contact || !contact.user_id) return;

  const telegramId = contact.user_id.toString();
  const phoneNumber = contact.phone_number.replace(/\+/g, '');
  const username = ctx.from?.username || '';
  const firstName = contact.first_name || '';

  const isAdmin = phoneNumber.endsWith((process.env.ADMIN_PHONE || '').replace(/\+/g, ''));

  try {
    // Upsert user based on telegramId
    const user = await prisma.user.upsert({
      where: { telegramId },
      update: {
        phone: phoneNumber,
        telegramUsername: username,
        name: firstName,
        role: isAdmin ? 'ADMIN' : undefined,
      },
      create: {
        telegramId,
        phone: phoneNumber,
        telegramUsername: username,
        name: firstName,
        role: isAdmin ? 'ADMIN' : 'USER',
      },
    });

    return ctx.reply(
      `Thank you, ${firstName}! Your account is now linked with phone: +${phoneNumber}.${isAdmin ? ' You have been recognized as an ADMIN.' : ''} You can now receive verification codes and order updates here.`,
      Markup.removeKeyboard()
    );
  } catch (error) {
    console.error('Error saving contact:', error);
    return ctx.reply('Sorry, there was an error linking your account. Please try again later.');
  }
});

// Function to send verification code
export const sendVerificationCode = async (phoneNumber: string, code: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { phone: phoneNumber.replace(/\+/g, '') },
    });

    if (!user || !user.telegramId) {
      throw new Error('User not found or Telegram not linked. Please start the bot first: @' + bot.botInfo?.username);
    }

    await bot.telegram.sendMessage(
      user.telegramId,
      `Your verification code for Trodat Shop: ${code}\n\nDo not share this code with anyone.`
    );
    return true;
  } catch (error) {
    console.error('Error sending Telegram code:', error);
    throw error;
  }
};

// Function to notify admin about new order
export const notifyAdminOrder = async (orderId: string, userData: any, items: any[], total: number) => {
  try {
    // Find admin user(s)
    const admins = await prisma.user.findMany({
      where: { 
        role: 'ADMIN',
        telegramId: { not: null }
      },
    });

    if (admins.length === 0 && !process.env.TELEGRAM_ADMIN_CHAT_ID) {
      console.warn('No admins with linked Telegram found and no TELEGRAM_ADMIN_CHAT_ID env variable defined.');
      return;
    }

    const itemsList = items.map(item => `- ${item.name} (${item.quantity}x)`).join('\n');
    const messageText = `🔔 *New Order Received!*\n\n` +
      `📦 *заказ ID:* ${orderId}\n` +
      `👤 *Клиент:* ${userData.name}\n` +
      `📞 *Телефон:* [+${userData.phone}](tel:+${userData.phone})\n\n` +
      `🛍️ *Товар:*\n${itemsList}\n\n` +
      `💰 *Сумма:* ${total} сом\n\n` +
      `Пожалуйста, свяжитесь с клиентом для подтверждения заказа.`;

    // Notify registered DB admins
    for (const admin of admins) {
      if (admin.telegramId) {
        await bot.telegram.sendMessage(admin.telegramId, messageText, { parse_mode: 'Markdown' });
      }
    }

    // Notify explicit Telegram chat ID if configured
    if (process.env.TELEGRAM_ADMIN_CHAT_ID) {
      await bot.telegram.sendMessage(process.env.TELEGRAM_ADMIN_CHAT_ID, messageText, { parse_mode: 'Markdown' });
    }
  } catch (error) {
    console.error('Error notifying admin:', error);
  }
};

// Launch bot
export const initTelegramBot = () => {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN not provided. Telegram features will be disabled.');
    return;
  }

  bot.launch()
    .then(() => console.log('✅ Telegram bot started'))
    .catch((err) => console.error('❌ Failed to start Telegram bot:', err));

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
};

export default bot;
