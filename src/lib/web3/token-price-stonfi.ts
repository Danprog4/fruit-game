import { fromNano } from "@ton/ton";
import ky from "ky";

interface PoolResponse {
  pool: {
    reserve0: string;
    reserve1: string;
    token0_address: string;
    token1_address: string;
  };
}

const getPoolPrice = async (poolAddress: string) => {
  const response = await ky.get(`https://api.ston.fi/v1/pools/${poolAddress}`).json();
  const pool = (response as PoolResponse).pool;

  const reserve0 = Number(fromNano(pool.reserve0));
  const reserve1 = Number(fromNano(pool.reserve1));

  return {
    price: reserve0 / reserve1,
    token0: pool.token0_address,
    token1: pool.token1_address,
    reserves: { reserve0, reserve1 },
  };
};

const poolAddress = "EQAMWMphHm4kkjX3Jnm8ZZr_e99OL2y0QQRJUtFnp2ZNKqIE";

const getTONPrice = async () => {
  const response = await ky
    .get("https://www.okx.com/api/v5/market/ticker?instId=TON-USDT", {
      headers: {
        "OK-ACCESS-KEY": process.env.OKX_API_KEY,
      },
    })
    .json();

  return (response as any).data[0].last;
};

export const getTokenPriceInUSD = async () => {
  const result = await getPoolPrice(poolAddress);
  const tonPrice = await getTONPrice();

  console.log("HOW MANY TOKENS YOU GET FOR 1 TON:", result.price);
  console.log("TON PRICE:", tonPrice);

  const tokenPrice = (1 / result.price) * tonPrice;
  console.log("TOKEN PRICE IN USD:", tokenPrice);

  return tokenPrice;
};
