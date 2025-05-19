import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { fromNano } from "@ton/core";
import { TonConnectButton, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { ArrowUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { BackButton } from "~/components/BackButton";
import { Dollar } from "~/components/icons/Dollar";
import { GreenDollar } from "~/components/icons/GreenDollar";
import Farm from "~/components/icons/navbar/Farm";
import Main from "~/components/icons/navbar/Main";
import Wallet from "~/components/icons/navbar/Wallet";
import { Token } from "~/components/icons/Token";
import { Wallet as WalletIcon } from "~/components/icons/Wallet";
import { Transaction } from "~/components/Transaction";
import { useJettonBalance } from "~/hooks/useJettonBalance";
import { useT } from "~/i18n";
import { FARMS_CONFIG } from "~/lib/farms.config";
import { getShortAddress } from "~/lib/utils/address";
import { tokenPriceInUSD } from "~/lib/web3/token-price-stonfi";
import { useTRPC } from "~/trpc/init/react";

export const Route = createFileRoute("/wallet")({
  component: RouteComponent,
});

function RouteComponent() {
  const wallet = useTonWallet();
  const [tonConnectUI, setOptions] = useTonConnectUI();
  const t = useT();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isWalletPage, setIsWalletPage] = useState(true);

  const pendingTxsRef = useRef<Record<string, boolean>>({});
  const balanceIntervalRef = useRef<number | null>(null);
  const { data: users } = useQuery(trpc.main.getUsers.queryOptions());
  const { data: user } = useQuery(trpc.main.getUser.queryOptions());
  const jettonBalance = useJettonBalance(user?.walletAddress ?? "");

  const calculateCurrentBalances = () => {
    if (!user) return {};

    const updatedBalances: Record<string, number> = {
      ...(user.balances as Record<string, number>),
    };

    for (const farmId in user.farms) {
      const count = (user.farms as Record<string, number>)[farmId];
      const farmConfig = FARMS_CONFIG.find((f) => f.id === farmId);
      if (!farmConfig) continue;

      const ratePerSecond = farmConfig.miningRate / 3600;
      const prev = (user.balances as Record<string, number>)[farmId] ?? 0;
      updatedBalances[farmId] = prev + count * ratePerSecond;
    }

    const userReffals = users?.filter((referral) => referral.referrerId === user.id);

    if (!userReffals) {
      return updatedBalances;
    }

    for (const reffal of userReffals) {
      for (const farmId in reffal.farms) {
        const count = (reffal.farms as Record<string, number>)[farmId];
        const farmConfig = FARMS_CONFIG.find((f) => f.id === farmId);
        if (!farmConfig) continue;

        const ratePerSecond = farmConfig.miningRate / 3600;
        const prev = (user.balances as Record<string, number>)[farmId] ?? 0;
        const bonus = count * ratePerSecond * 0.05;
        updatedBalances[farmId] = prev + bonus;
      }
    }
    return updatedBalances;
  };

  const invalidateBalancesData = () => {
    queryClient.setQueryData(trpc.main.getUser.queryKey(), (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        balances: calculateCurrentBalances(),
      };
    });
  };

  const updateBalances = () => {
    // Clear any existing interval first
    if (balanceIntervalRef.current) {
      clearInterval(balanceIntervalRef.current);
    }

    // Set a new interval
    balanceIntervalRef.current = window.setInterval(() => {
      invalidateBalancesData();
    }, 1000);
  };

  useEffect(() => {
    updateBalances();

    return () => {
      if (balanceIntervalRef.current) {
        clearInterval(balanceIntervalRef.current);
        balanceIntervalRef.current = null;
      }
    };
  }, [user]);

  const connectWallet = useMutation(
    trpc.main.connectWallet.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.main.getUser.queryKey() });
      },
    }),
  );

  const disconnectWallet = useMutation(
    trpc.main.disconnectWallet.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.main.getUser.queryKey() });
      },
    }),
  );

  const getLastWithdrawals = useQuery(trpc.main.getLastWithdrawals.queryOptions());

  useEffect(
    () =>
      tonConnectUI.onStatusChange((wallet) => {
        if (!wallet) {
          disconnectWallet.mutate();
          return;
        }

        connectWallet.mutate({ walletAddress: wallet.account.address });
      }),

    // eslint-disable-next-line @tanstack/query/no-unstable-deps
    [tonConnectUI, connectWallet],
  );

  useEffect(() => {
    if (tonConnectUI) {
      console.log("Setting TonConnect UI language to Russian");
      setOptions({ language: "ru" });
    }
  }, [tonConnectUI, setOptions]);

  // Get user balances from the user data
  const balances = user?.balances as Record<string, number> | undefined;
  const lastTxs = useQuery(trpc.farms.getLastTxs.queryOptions());

  const isPending = lastTxs.data?.some((tx) => tx.status === "pending");
  const isWithdrawPending = getLastWithdrawals.data?.some(
    (withdrawal) =>
      withdrawal.status === "waiting_for_approve" ||
      withdrawal.status === "approved" ||
      withdrawal.status === "sending_to_wallet",
  );

  useEffect(() => {
    if (lastTxs.data) {
      // Check for transactions that changed from pending to completed
      lastTxs.data.forEach((tx) => {
        if (tx.status === "completed" && pendingTxsRef.current[tx.id]) {
          // Transaction was pending before and is now completed
          toast.success(
            <div>
              {t("You have successfully purchased a farm!")}{" "}
              <a
                onClick={() => navigate({ to: "/farms" })}
                className="cursor-pointer underline"
              >
                {t("Go to farms")}
              </a>
            </div>,
          );
          // Remove from tracking
          delete pendingTxsRef.current[tx.id];
        } else if (tx.status === "pending") {
          // Track pending transactions
          pendingTxsRef.current[tx.id] = true;
        }
      });
    }
  }, [lastTxs.data]);

  useEffect(() => {
    const somethingIsPending = isPending || isWithdrawPending;

    if (somethingIsPending) {
      const interval = setInterval(() => {
        if (isPending) {
          queryClient.invalidateQueries({ queryKey: trpc.farms.getLastTxs.queryKey() });
        }
        if (isWithdrawPending) {
          queryClient.invalidateQueries({
            queryKey: trpc.main.getLastWithdrawals.queryKey(),
          });
        }
        queryClient.invalidateQueries({ queryKey: trpc.main.getUser.queryKey() });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [
    isPending,
    isWithdrawPending,
    queryClient,
    trpc.farms.getLastTxs,
    trpc.main.getLastWithdrawals,
    trpc.main.getUser,
  ]);

  const allTransactions = useMemo(() => {
    const farmTransactions =
      lastTxs.data?.map((tx) => ({
        id: tx.id,
        createdAt: tx.createdAt,
        amount: Number(fromNano(tx.fruAmount)),
        label: tx.txType,
        status: tx.status,
        statusText:
          tx.status === "completed"
            ? t("Completed")
            : tx.status === "pending"
              ? t("In processing")
              : t("Error"),
      })) || [];

    const withdrawalTransactions =
      getLastWithdrawals.data?.map((withdrawal) => ({
        id: withdrawal.id,
        createdAt: withdrawal.createdAt,
        amount: Number(fromNano(withdrawal.amount)),
        label: t("Withdrawal"),
        status:
          withdrawal.status === "completed"
            ? t("Completed")
            : withdrawal.status === "failed"
              ? t("Failed")
              : t("Pending"),
        statusText:
          withdrawal.status === "completed"
            ? t("Completed")
            : withdrawal.status === "failed"
              ? t("Error")
              : t("Waiting for confirmation"),
      })) || [];

    const txs = [...farmTransactions, ...withdrawalTransactions];

    return txs.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [lastTxs.data, getLastWithdrawals.data]);

  const tokenPrice = useMemo(() => {
    return jettonBalance ? tokenPriceInUSD * Number(jettonBalance) : 0;
  }, [jettonBalance]);

  const balanceFruitsInUSD = (farmId: string) => {
    const farmConfig = FARMS_CONFIG.find((f) => f.id === farmId);
    if (!farmConfig) return 0;
    if (balances === undefined) return 0;
    const balance = ((balances[farmId] / farmConfig.rateFru / 1) * tokenPriceInUSD)
      .toFixed(3)
      .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    console.log(balance);
    return balance;
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-y-auto px-4 pt-12 pb-28 text-white">
      <BackButton onClick={() => window.history.back()} />

      <div className="flex w-full items-center justify-between">
        <div className="w-full">
          <div className="relative mx-auto mb-4 flex h-[65px] w-[70vw] items-center justify-between rounded-full bg-[#7AB019] p-4">
            <div
              className="absolute z-0 h-[45px] rounded-full border-1 border-[#97C73F] bg-gradient-to-b from-[#A2D448] to-[#A2D448] transition-all duration-300"
              style={{
                width: "45%",
                left: isWalletPage ? "5%" : "50%",
              }}
            />
            <div
              className={`relative z-10 flex h-[45px] w-[118px] cursor-pointer items-center justify-center gap-2 rounded-full p-5 transition-all duration-300`}
              onClick={() => setIsWalletPage(true)}
            >
              <Wallet />
              <div>{t("Wallet")}</div>
            </div>
            <div
              className={`relative z-10 flex w-[118px] cursor-pointer items-center justify-center gap-2 p-2 transition-all duration-300`}
              onClick={() => setIsWalletPage(false)}
            >
              <Farm />
              <div>{t("Farm")}</div>
            </div>
          </div>
          {isWalletPage && (
            <>
              <div className="flex h-[76px] w-full items-center justify-start gap-[20px] rounded-full bg-[#343D24] p-[14px]">
                <div className="relative flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#85BF1A]">
                  <WalletIcon />
                  <div className="absolute inset-0 opacity-0">
                    <TonConnectButton className="h-[54px] w-[54px]" />
                  </div>
                  {!wallet && (
                    <div className="absolute right-[1px] -bottom-[1px] flex h-4 w-4 items-center justify-center rounded-sm bg-white shadow-sm">
                      <svg
                        width="8"
                        height="8"
                        viewBox="0 0 8 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4 1V7M1 4H7"
                          stroke="#85BF1A"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-start gap-1">
                  <div className="font-manrope text-base font-semibold">
                    {wallet ? t("Connected") : t("Connect wallet")}
                  </div>
                  <div className="font-manrope text-xs font-medium text-[#93A179]">
                    {wallet ? getShortAddress(wallet.account.address) : "TON Connect"}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="mt-[15px] mb-8 flex h-[76px] w-full items-center justify-between rounded-full border-1 border-[#75A818] bg-[#343D24] p-[14px]">
            <div className="flex items-center gap-[20px]">
              <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#141414]">
                <Token width={30} height={34} viewBox="0 0 30 30" />
              </div>
              <div className="flex flex-col items-start gap-1">
                <div className="font-manrope text-base font-semibold">FRU</div>
                <div className="font-manrope text-xs font-medium text-[#93A179]">
                  {jettonBalance?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") ?? 0}{" "}
                  FRU
                </div>
              </div>
            </div>
            <div className="font-manrope pr-4 text-lg font-semibold">
              {tokenPrice.toFixed(2)} $
            </div>
          </div>

          {!isWalletPage && (
            <div className="mt-4 mb-8 flex items-center justify-center gap-2">
              <div className="flex h-[76px] w-full items-center justify-start rounded-full bg-[#2A2A2A] pl-[13px]">
                <div className="flex items-center gap-2">
                  <div
                    onClick={() => navigate({ to: "/exchange" })}
                    className="flex h-[54px] w-[54px] cursor-pointer items-center justify-center rounded-full bg-[#404040]"
                  >
                    <Dollar />
                  </div>
                  <div>{t("Exchange")}</div>
                </div>
              </div>
              <div className="flex h-[76px] w-full items-center justify-start rounded-full bg-[#2A2A2A] pl-[13px]">
                <div className="flex items-center justify-start gap-2">
                  <div
                    onClick={() => navigate({ to: "/withdrawal" })}
                    className="flex h-[54px] w-[54px] cursor-pointer items-center justify-center rounded-full bg-[#404040]"
                  >
                    <ArrowUp />
                  </div>
                  <div>{t("Withdrawal")}</div>
                </div>
              </div>
            </div>
          )}

          {isWalletPage && (
            <div className="flex flex-col items-center justify-center">
              <div className="font-manrope text-base font-semibold">
                {t("Last transactions")}
              </div>
              <div className="mt-4 flex w-full flex-col gap-3">
                {allTransactions.length > 0 ? (
                  allTransactions.map((tx) => (
                    <Transaction
                      key={tx.id}
                      label={tx.label}
                      createdAt={tx.createdAt}
                      status={tx.status as "pending" | "completed" | "failed"}
                      amount={tx.amount}
                      statusText={tx.statusText}
                    />
                  ))
                ) : (
                  <div className="py-4 text-center text-[#93A179]">
                    {t("No transactions yet")}
                  </div>
                )}
              </div>
            </div>
          )}

          {!isWalletPage && (
            <div className="mb-[15px] flex items-center justify-center gap-[14px]">
              <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[#76AD10]">
                <GreenDollar />
              </div>
              <div>{t("Fruits balance")}</div>
            </div>
          )}
        </div>
      </div>
      {!isWalletPage && (
        <div className="flex flex-col gap-[15px]">
          {balances && Object.keys(balances).length > 0 ? (
            FARMS_CONFIG.filter((farm) => balances[farm.id] !== undefined).map((farm) => (
              <div
                key={farm.id}
                className="flex h-[76px] w-full items-center justify-between rounded-full border-1 border-[#575757] bg-[#2A2A2A] p-[14px]"
              >
                <div className="flex items-center gap-[20px]">
                  <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#141414]">
                    <div className="text-2xl">{farm.icon}</div>
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <div className="font-manrope text-base font-semibold">
                      {farm.id.charAt(0).toUpperCase() + farm.id.slice(1)}
                    </div>
                    <div className="font-manrope text-xs font-medium text-[#8F8F8F]">
                      {balances[farm.id].toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")}{" "}
                      {farm.tokenName}
                    </div>
                  </div>
                </div>
                <div className="font-manrope pr-4 text-lg font-semibold">
                  {balanceFruitsInUSD(farm.id) + " $"}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400">{t("No available fruits")}</div>
          )}
        </div>
      )}
      <div className="font-manrope px fixed right-4 bottom-[21px] left-4 flex h-[76px] w-auto items-center justify-between rounded-full bg-[#7AB019] px-4 text-sm font-medium text-white">
        <div className="flex flex-col items-center justify-center gap-1">
          <div
            className="flex w-[105px] flex-col items-center justify-center gap-1"
            onClick={() => navigate({ to: "/farms" })}
          >
            <Farm />
            <div className="font-manrope text-xs font-medium">{t("Farm")}</div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-1">
          <div
            className="flex w-[105px] flex-col items-center justify-center gap-1"
            onClick={() => navigate({ to: "/" })}
          >
            <Main />
            <div className="font-manrope text-xs font-medium">{t("Main")}</div>
          </div>
        </div>
        <div className="flex h-[63px] w-[105px] flex-col items-center justify-center gap-1 rounded-full border-1 border-[#97C73F] bg-gradient-to-b from-[#A2D448] to-[#A2D448]">
          <Wallet />
          <div className="font-manrope text-xs font-medium">{t("Wallet")}</div>
        </div>
      </div>
    </div>
  );
}
