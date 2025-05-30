import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BackButton } from "~/components/BackButton";
import { Graphic } from "~/components/images/Graphic";
import { Select, SelectContent, SelectItem, SelectTrigger } from "~/components/ui/select";
import calculateExchangeAmount from "~/lib/utils/converter/calculateExchangeAmount";
import getExchangeRateDisplay from "~/lib/utils/converter/getExchangeRateDisplay";
import getPercentageChange from "~/lib/utils/converter/getPercentageChange";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Token } from "~/components/icons/Token";
import { getTokenBalance } from "~/lib/utils/getTokenBalance";
import { getTokenIcon } from "~/lib/utils/getTokenIcon";
import tokenPrices from "~/tokenPrices";
import { useTRPC } from "~/trpc/init/react";
export const Route = createFileRoute("/exchange")({
  component: RouteComponent,
});

function RouteComponent() {
  const [swapped, setSwapped] = useState(false);
  const [fromToken, setFromToken] = useState("STR");
  const [toToken, setToToken] = useState("FRU");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("0");

  const scrollPositionRef = useRef<number>(0);
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: user } = useQuery(trpc.main.getUser.queryOptions());
  const balances = user?.balances as Record<string, number> | undefined;
  const exchangeBalance = useMutation(
    trpc.main.exchange.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.main.getUser.queryKey() });
        toast.success("Обмен успешно выполнен");
        setFromAmount("");
        setToAmount("");
      },
      onError: (error) => {
        console.log(error);
        if (error.message === "Insufficient balance") {
          toast.error("Обмен не выполнен, недостаточно средств");
        } else if (error.message) {
          toast.error("Упс, что-то пошло не так");
        }
      },
    }),
  );
  // Update toAmount whenever fromAmount or tokens change
  useEffect(() => {
    setToAmount(calculateExchangeAmount(fromAmount, fromToken, toToken));
  }, [fromAmount, fromToken, toToken]);
  const handleInputFocus = () => {
    scrollPositionRef.current = window.scrollY;
  };
  const handleInputBlur = () => {
    window.scrollTo({ top: scrollPositionRef.current, behavior: "auto" });
  };

  const handleSwap = () => {
    setSwapped(!swapped);

    // Keep the input value in the first field
    const newFromAmount = fromAmount;

    // Swap token values
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);

    // Calculate new toAmount based on the swapped tokens
    setToAmount(calculateExchangeAmount(newFromAmount, toToken, tempToken));
  };

  const handleFromTokenChange = (value: string) => {
    setFromToken(value);
    // Recalculate toAmount when fromToken changes
    setToAmount(calculateExchangeAmount(fromAmount, value, toToken));
  };

  const handleToTokenChange = (value: string) => {
    setToToken(value);
    // Recalculate toAmount when toToken changes
    setToAmount(calculateExchangeAmount(fromAmount, fromToken, value));
  };

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setFromAmount(value);
      // Update toAmount based on new fromAmount
      setToAmount(calculateExchangeAmount(value, fromToken, toToken));
    }
  };

  const percentChange = getPercentageChange();

  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full flex-col overflow-y-auto px-4 pt-12 pb-20 text-white">
      <div className="absolute top-4 left-4">
        <ArrowLeft onClick={() => navigate({ to: "/wallet" })} />
      </div>
      <BackButton onClick={() => window.history.back()} />
      <div className="font-manrope mx-auto mb-[33px] text-center text-2xl font-semibold">
        Обмен
      </div>
      <div className="mb-[21px] flex items-center justify-between">
        <div>
          <div className="font-manrope text-[10px] font-medium">
            {getExchangeRateDisplay(fromToken, toToken)}{" "}
            <span
              className={percentChange.isPositive ? "text-[#A2D448]" : "text-red-500"}
            >
              {" "}
              {percentChange.isPositive ? "+" : ""}
              {percentChange.value}%
            </span>
          </div>
        </div>
        <div className="font-manrope text-[10px] font-medium">
          {(
            tokenPrices[fromToken as keyof typeof tokenPrices] /
            tokenPrices[toToken as keyof typeof tokenPrices]
          ).toFixed(6)}
        </div>
      </div>
      <div className="relative mb-[21px] flex h-[173px] w-full items-end justify-end rounded-4xl bg-[#252A1B] pt-8 pb-2">
        <Graphic />

        <div className="font-manrope absolute bottom-[30px] left-[48px] text-[10px] font-medium text-[#6A7B49]">
          0,20140
        </div>
        <div className="font-manrope absolute inset-x-0 bottom-[17px] mx-auto flex h-[21px] w-[35px] items-center justify-center rounded-xl bg-[#394128] text-center text-xs font-medium text-[#ABC181]">
          1W
        </div>
      </div>
      <div className="relative flex flex-col gap-6">
        <div className="relative h-[124px] w-full rounded-3xl bg-[#222221] p-4">
          <div className="mb-4 flex items-center justify-between text-[#8F8F8F]">
            <div className="font-manrope text-xs font-medium text-[#8F8F8F]">Из</div>
            <div className="flex h-[25px] w-[150px] items-center justify-center rounded-xl border border-[#3B3B3B]">
              <div className="font-manrope text-[10px] font-medium">
                Доступно{" "}
                {fromToken === "FRU"
                  ? user?.tokenBalance
                  : getTokenBalance(fromToken, balances || {})}{" "}
                {fromToken}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">
                {fromToken === "FRU" ? (
                  <Token width={28} height={28} viewBox="0 0 34 34" />
                ) : (
                  getTokenIcon(fromToken)
                )}
              </span>
              <div className="font-manrope text-[24px] font-medium">{fromToken}</div>
              <Select onValueChange={handleFromTokenChange} value={fromToken}>
                <SelectTrigger className="bg-[#333333]"></SelectTrigger>
                <SelectContent className="z-50 bg-[#333333] p-3">
                  {Object.keys(tokenPrices)
                    .filter((token) => token !== "FRU")
                    .map((token) => (
                      <SelectItem
                        key={token}
                        className="mb-2 flex w-[100px] items-center justify-start rounded-none border-b border-white"
                        value={token}
                      >
                        {token}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <input
              type="text"
              value={fromAmount}
              onChange={handleFromAmountChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              className="font-manrope w-[120px] bg-transparent text-right text-[18px] font-medium text-[#8F8F8F] outline-none"
              placeholder="0.13 - 100000"
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
            <div
              className="font-manrope absolute right-4 bottom-4 cursor-pointer text-[12px] font-medium text-[#85BF1A]"
              onClick={() => {
                if (fromToken === "FRU") {
                  setFromAmount(user?.tokenBalance.toString() || "0");
                } else {
                  setFromAmount(getTokenBalance(fromToken, balances || {}).toString());
                }
              }}
            >
              Макс.
            </div>
          </div>
        </div>
        {/* 
        <button
          onClick={handleSwap}
          className="absolute top-1/2 left-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#141414] shadow-lg"
        >
          <Swap />
        </button> */}

        <div className="h-[124px] w-full rounded-3xl bg-[#222221] p-4">
          <div className="mb-4 flex items-center justify-between text-[#8F8F8F]">
            <div className="font-manrope text-xs font-medium text-[#8F8F8F]">В</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center gap-2">
              <div className="text-2xl">
                <Token width={28} height={28} viewBox="0 0 34 34" />
              </div>
              <div className="font-manrope text-[24px] font-medium">FRU</div>
            </div>
            <div className="font-manrope w-[120px] overflow-hidden text-right text-[18px] font-medium text-ellipsis text-[#8F8F8F]">
              {toAmount}
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={() =>
          exchangeBalance.mutate({
            fromToken,
            toToken,
            amount: fromAmount,
          })
        }
        className="font-manrope absolute right-4 bottom-[21px] left-4 flex h-[52px] w-auto max-w-md items-center justify-center rounded-full bg-[#76AD10] px-6 text-sm font-medium text-white"
      >
        {exchangeBalance.isPending ? "Обмен..." : "Обменять"}
      </button>
    </div>
  );
}
