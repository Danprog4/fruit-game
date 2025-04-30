import { Address } from "@ton/core";

export const getUQAddress = (address: string) => {
  return Address.parse(address).toString({ bounceable: false });
};

export const getShortAddress = (address: string) => {
  const uqAddress = getUQAddress(address);
  return uqAddress.slice(0, 4) + "..." + uqAddress.slice(-4);
};
