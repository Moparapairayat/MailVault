export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

export const getTelegramConfig = (): TelegramConfig => {
  const saved = localStorage.getItem('mailvault_telegram_config');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return {
    botToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '',
    chatId: import.meta.env.VITE_TELEGRAM_CHAT_ID || '',
    enabled: true
  };
};

export const saveTelegramConfig = (config: TelegramConfig) => {
  localStorage.setItem('mailvault_telegram_config', JSON.stringify(config));
};

export const sendTelegramAlert = async (message: string): Promise<boolean> => {
  const config = getTelegramConfig();
  if (!config.enabled || !config.botToken || !config.chatId) {
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });
    return res.ok;
  } catch (err) {
    console.warn('Telegram notification failed:', err);
    return false;
  }
};
