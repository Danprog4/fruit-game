export const createMemo = (
  txType: string,
  txId: string,
  name?: string,
  telegramChannelUrl?: string,
  imageUUID?: string,
) => {
  return `${txType} #${txId} #${name} #${telegramChannelUrl} #${imageUUID}`;
};
