import { WidgetConfig } from '../types';

export interface TelegramNotificationParams {
  type: 'new_chat' | 'new_message' | 'test';
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerIp?: string;
  department?: string;
  problemIssue?: string;
  chatId?: string;
  messageText?: string;
  timestamp?: string;
}

/**
 * Sends real-time Telegram notifications when a customer starts a chat or sends an SMS
 */
export async function sendTelegramNotification(
  params: TelegramNotificationParams,
  widgetConfig?: Partial<WidgetConfig>
): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Retrieve bot token & chat id from passed widgetConfig or localStorage
    let botToken = widgetConfig?.telegramBotToken;
    let chatId = widgetConfig?.telegramChatId;
    let isEnabled = widgetConfig?.telegramNotificationsEnabled !== false;

    if (!botToken || !chatId) {
      try {
        const localCfg = localStorage.getItem('novachat_widget_config');
        if (localCfg) {
          const parsed = JSON.parse(localCfg);
          botToken = botToken || parsed.telegramBotToken;
          chatId = chatId || parsed.telegramChatId;
          if (parsed.telegramNotificationsEnabled !== undefined) {
            isEnabled = parsed.telegramNotificationsEnabled;
          }
        }
      } catch (e) {
        console.warn('Error reading telegram config from localStorage', e);
      }
    }

    // If notifications are disabled or missing credentials
    if (!isEnabled && params.type !== 'test') {
      return { success: false, message: 'টেলিগ্রাম নোটিফিকেশন বন্ধ করা আছে।' };
    }

    if (!botToken || !chatId) {
      console.log('Telegram Bot Token or Chat ID not configured yet.');
      return { success: false, message: 'Telegram Bot Token বা Chat ID সেট করা হয়নি।' };
    }

    const cleanToken = botToken.trim();
    const cleanChatId = chatId.trim();
    const timeStr = params.timestamp || new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: true });

    let messageText = '';

    if (params.type === 'test') {
      messageText = `🤖 <b>NovaChat টেলিগ্রাম নোটিফিকেশন টেস্ট</b>\n\n` +
        `✅ অভিনন্দন! আপনার টেলিগ্রাম বট সফলভাবে কানেক্ট হয়েছে।\n` +
        `⏰ সময়: ${timeStr}\n` +
        `🔔 এখন থেকে কোনো কাস্টমার মেসেজ দিলে এখানে সাথে সাথে নোটিফিকেশন আসবে।`;
    } else if (params.type === 'new_chat') {
      messageText = `🔔 <b>নতুন কাস্টমার চ্যাট শুরু হয়েছে! (New Chat)</b>\n\n` +
        `🆔 <b>চ্যাট আইডি:</b> #${params.chatId || 'N/A'}\n` +
        `👤 <b>গ্রাহকের নাম:</b> ${params.customerName || 'অজ্ঞাত'}\n` +
        `📞 <b>ফোন নম্বর:</b> ${params.customerPhone || 'দেওয়া হয়নি'}\n` +
        `🌐 <b>IP এড্রেস:</b> ${params.customerIp || 'N/A'}\n` +
        `🏢 <b>ডিপার্টমেন্ট:</b> ${params.department || 'সাধারণ সহায়তা'}\n` +
        (params.problemIssue ? `📌 <b>সমস্যার ধরন:</b> ${params.problemIssue}\n` : '') +
        `💬 <b>প্রথম মেসেজ:</b> <i>"${params.messageText || 'হাই'}"</i>\n\n` +
        `⏰ <b>সময়:</b> ${timeStr}`;
    } else {
      // new_message
      messageText = `💬 <b>কাস্টমারের নতুন মেসেজ (New Customer SMS)</b>\n\n` +
        `🆔 <b>চ্যাট আইডি:</b> #${params.chatId || 'N/A'}\n` +
        `👤 <b>গ্রাহক:</b> ${params.customerName || 'Customer'}\n` +
        `📞 <b>ফোন:</b> ${params.customerPhone || 'N/A'}\n` +
        (params.problemIssue ? `📌 <b>সমস্যা:</b> ${params.problemIssue}\n` : '') +
        `📨 <b>মেসেজ:</b> <i>"${params.messageText || ''}"</i>\n\n` +
        `⏰ <b>সময়:</b> ${timeStr}`;
    }

    // Send HTTP POST request to Telegram Bot API
    const telegramUrl = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: messageText,
        parse_mode: 'HTML',
      }),
    });

    const resData = await response.json();
    if (resData && resData.ok) {
      return { success: true, message: 'টেলিগ্রামে সফলভাবে নোটিফিকেশন পাঠানো হয়েছে!' };
    } else {
      const errMsg = resData?.description || 'টেলিগ্রাম এপিআই ত্রুটি';
      console.warn('Telegram Notification Error:', errMsg);
      return { success: false, message: `টেলিগ্রাম ত্রুটি: ${errMsg}` };
    }
  } catch (error: any) {
    console.error('Failed to send Telegram notification:', error);
    return { success: false, message: error?.message || 'টেলিগ্রাম কানেকশন এরর' };
  }
}
