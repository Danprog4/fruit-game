export const createMemo = (txType: string, txId: string) => {
  return `${txType} #${txId}`;
};
