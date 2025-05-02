export type PostCreateInvoiceResponse = {
  invoiceUrl: string;
};

import { Bot } from "grammy";

export const handleCreateInvoice = async (userId: number, amount: number) => {
  const bot = new Bot(process.env.BOT_TOKEN!);

  const title = "Прокачать ферму";
  const description = "Прокачай свою алмазную ферму";
  const payload = JSON.stringify({ userId });
  const currency = "XTR";
  const prices = [{ amount: amount, label: title }];
  const provider_token = "";

  const invoiceUrl = await bot.api.createInvoiceLink(
    title,
    description,
    payload,
    provider_token,
    currency,
    prices,
  );

  console.log("invoiceUrl", invoiceUrl);

  return { invoiceUrl } satisfies PostCreateInvoiceResponse;
};
