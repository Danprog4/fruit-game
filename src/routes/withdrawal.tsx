import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { BackButton } from "~/components/BackButton";
import { Swap } from "~/components/icons/Swap";
import { WITHDRAWAL_FEE } from "~/lib/constants";
import { useTRPC } from "~/trpc/init/react";
export const Route = createFileRoute("/withdrawal")({
  component: RouteComponent,
});

function RouteComponent() {
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const MIN_AMOUNT = 1;
  const navigate = useNavigate();

  const trpc = useTRPC();

  const { data: user } = useQuery(trpc.main.getUser.queryOptions());

  const wallet = user?.walletAddress;

  // add scroll save/restore logic
  const scrollPositionRef = useRef<number>(0);
  const handleInputFocus = () => {
    scrollPositionRef.current = window.scrollY;
  };
  const handleInputBlur = () => {
    window.scrollTo({ top: scrollPositionRef.current, behavior: "auto" });
  };

  const handleLongPress = () => {
    navigator.clipboard
      .readText()
      .then((text) => {
        setAddress(text);
      })
      .catch((err) => {
        console.error("Failed to read clipboard contents: ", err);
      });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleMaxAmount = () => {
    setAmount(user?.tokenBalance.toString() || "0");
  };

  const queryClient = useQueryClient();

  const requestWithdraw = useMutation(
    trpc.main.requestWithdraw.mutationOptions({
      onSuccess: () => {
        navigate({ to: "/wallet" });
        queryClient.invalidateQueries({
          queryKey: trpc.main.getLastWithdrawals.queryKey(),
        });
        toast.success("Вывод средств успешно запрошен");
      },
    }),
  );

  const handleWithdraw = async () => {
    await requestWithdraw.mutateAsync({ amount: parseFloat(amount) });
  };

  console.log(amount, "amount");
  console.log(user?.tokenBalance, "user?.tokenBalance");
  console.log(user?.tokenBalance! < parseFloat(amount), "user?.tokenBalance < amount");
  return (
    <div
      className="flex h-screen w-full flex-col overflow-hidden px-4 pt-12 text-white"
      style={{ height: window.innerHeight }}
    >
      <div className="absolute top-4 left-4">
        <ArrowLeft onClick={() => navigate({ to: "/wallet" })} />
      </div>
      <BackButton onClick={() => window.history.back()} />
      <div className="mb-9 flex items-center justify-center">
        {/* <div className="invisible flex items-center justify-center gap-2">
          <About />
          <History />
        </div> */}
        <div className="font-manrope text-center text-2xl font-semibold">Вывод</div>
        <div className="flex items-center justify-center gap-2">
          {/* <Drawer.Root>
            <Drawer.Trigger asChild>
              <button className="cursor-pointer">
                <About />
              </button>
            </Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/40" />
              <Drawer.Content className="fixed right-0 bottom-0 left-0 z-[1000] mt-24 flex h-[80vh] flex-col rounded-t-[10px] bg-[#1A1A1A] p-4">
                <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-gray-400" />
                <div className="p-4">
                  <h2 className="mb-4 text-xl font-semibold text-white">О выводе</h2>
                  <p className="text-gray-300">
                    Информация о выводе средств и комиссиях.
                  </p>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
          <Drawer.Root>
            <Drawer.Trigger asChild>
              <button className="cursor-pointer">
                <History />
              </button>
            </Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/40" />
              <Drawer.Content className="fixed right-0 bottom-0 left-0 mt-24 flex h-[80vh] flex-col rounded-t-[10px] bg-[#1A1A1A] p-4">
                <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-gray-400" />
                <div className="p-4">
                  <h2 className="mb-4 text-xl font-semibold text-white">
                    История выводов
                  </h2>
                  <div className="flex flex-col gap-4">
                    <p className="text-gray-300">
                      Ваша история выводов будет отображаться здесь.
                    </p>
                  </div>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root> */}
        </div>
      </div>
      <div className="relative z-10"></div>
      <div className="font-manrope text-xs font-medium">Адрес</div>
      <div className="relative mt-4 mb-[22px] flex w-full items-center">
        <div className="relative flex w-full">
          <div className="flex h-[42px] w-full items-center rounded-full bg-[#F7FFEB0F] pr-[50px] pl-[19px] text-sm text-white placeholder-gray-400 focus:border-[#76AD10] focus:ring-1 focus:ring-[#A2D448] focus:outline-none">
            {wallet?.slice(0, 4)}...{wallet?.slice(-4)}
          </div>
        </div>
      </div>
      <div className="font-manrope text-xs font-medium">Сумма вывода</div>
      <div className="relative mt-4 flex w-full items-center">
        <div className="relative w-full">
          <input
            type="text"
            value={amount}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length > 20) {
                return;
              }
              setAmount(value);
            }}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
            placeholder={`Минимум ${MIN_AMOUNT}`}
            className="h-[42px] w-full rounded-full bg-[#F7FFEB0F] pr-[50px] pl-[19px] text-sm text-white placeholder-gray-400 focus:border-[#76AD10] focus:ring-1 focus:ring-[#A2D448] focus:outline-none"
            size={500}
          />
          <div className="absolute top-1/2 right-4 flex -translate-y-1/2 items-center justify-center gap-3 text-sm">
            <div className="font-manrope text-xs font-medium">FRU</div>
            <span
              className="font-manrope cursor-pointer text-xs font-medium text-[#73A517]"
              onClick={handleMaxAmount}
            >
              Макс
            </span>
          </div>
        </div>
      </div>
      <div className="mt-[13px] flex items-center justify-between">
        <div className="font-manrope text-[10px] font-medium text-[#8F8F8F]">
          Доступно
        </div>
        <div className="font-manrope text-[10px] font-medium text-[#8F8F8F]">
          {user?.tokenBalance} FRU
        </div>
      </div>
      <div className="mt-auto mb-[34px] flex items-center justify-between">
        <div className="font-manrope flex flex-col items-start gap-1 text-[10px] font-medium">
          <div className="flex items-center gap-3">
            Сумма к получению
            <div style={{ transform: "rotate(90deg)" }}>
              <Swap />
            </div>
          </div>
          <div className="font-manrope text-lg font-medium">
            {amount
              ? amount.length > 15
                ? `${amount.substring(0, 8)}...${amount.substring(amount.length - 6)}`
                : (Number(amount) * (1 - WITHDRAWAL_FEE)).toFixed(2)
              : "0,00"}{" "}
            FRU
          </div>
          <div className="font-manrope text-[10px] font-medium text-[#8F8F8F]">
            Комиссия <span className="text-white">5%</span>
          </div>
        </div>
        <button
          onClick={() => {
            handleWithdraw();
          }}
          type="button"
          className={`font-manrope left-4 flex h-[52px] w-[150px] items-center justify-center rounded-full ${
            !amount ||
            parseFloat(amount) < MIN_AMOUNT ||
            user?.tokenBalance === undefined ||
            user?.tokenBalance < parseFloat(amount) ||
            requestWithdraw.isPending
              ? "cursor-not-allowed bg-[#76AD10]/50"
              : "cursor-pointer bg-[#76AD10]"
          } px-6 text-sm font-medium text-white`}
          disabled={
            !amount ||
            parseFloat(amount) < MIN_AMOUNT ||
            user?.tokenBalance === undefined ||
            user?.tokenBalance < parseFloat(amount) ||
            requestWithdraw.isPending
          }
        >
          {requestWithdraw.isPending ? "Вывод..." : "Вывод"}
        </button>
      </div>
    </div>
  );
}
