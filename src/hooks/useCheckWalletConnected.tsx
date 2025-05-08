import { useNavigate } from "@tanstack/react-router";
import { useTonAddress } from "@tonconnect/ui-react";
import { toast } from "sonner";

export const useCheckWalletConnected = () => {
  const address = useTonAddress();
  const navigate = useNavigate();

  const checkWalletConnected = () => {
    if (!address) {
      toast.error(
        <div>
          Подключите ваш TON-кошелек
          <div
            onClick={() => {
              navigate({ to: "/wallet" });
            }}
            className="cursor-pointer underline"
          >
            Подключить
          </div>
        </div>,
      );

      return false;
    }

    return true;
  };

  return { checkWalletConnected };
};
