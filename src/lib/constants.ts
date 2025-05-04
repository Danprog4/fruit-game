export const WITHDRAWAL_FEE = 0.05; // 5% fee

export const WITHDRAW_CHAT_ID = process.env.WITHDRAW_CHAT_ID as string;
if (!WITHDRAW_CHAT_ID) throw new Error("WITHDRAW_CHAT_ID is unset");
