import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChangeEvent, useRef, useState } from "react";
import { BackButton } from "~/components/BackButton";
import { AllianceGroup } from "~/components/icons/AllianceGroup";
import { PlusIcon } from "~/components/icons/PlusIcon";
import { Token } from "~/components/icons/Token";
import { Switch } from "~/components/ui/switch";
import { useAllianceCreate } from "~/hooks/useAllianceCreate";
import { useT } from "~/i18n";
import { convertHeicToPng } from "~/lib/utils/convertHeicToPng";
import { convertToBase64 } from "~/lib/utils/convertToBase64";
import { useTRPC } from "~/trpc/init/react";
export const Route = createFileRoute("/create-alliance")({
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { createWithFRU, createWithTON } = useAllianceCreate();
  const [allianceName, setAllianceName] = useState("");
  const [telegramUrl, setTelegramUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showErrors, setShowErrors] = useState(false);
  const scrollPositionRef = useRef<number>(0);
  const [isForTON, setIsForTON] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  const handleInputFocus = () => {
    scrollPositionRef.current = window.scrollY;
  };
  const handleInputBlur = () => {
    window.scrollTo({ top: scrollPositionRef.current, behavior: "auto" });
  };

  const isHeicFile = (file: File): boolean => {
    return file.name.toLowerCase().endsWith(".heic");
  };

  const handleCreateAllianceForTON = async () => {
    if (!selectedFile || !allianceName || isProcessing || !telegramUrl) {
      setShowErrors(true);
      return;
    }

    try {
      setIsProcessing(true);
      let fileToProcess = selectedFile;

      // If file is HEIC, convert to PNG first
      if (isHeicFile(selectedFile)) {
        fileToProcess = await convertHeicToPng(selectedFile);
      }

      const base64 = await convertToBase64(fileToProcess);
      console.log(base64);

      const createdAlliance = await createWithTON.mutateAsync({
        name: allianceName,
        telegramChannelUrl: telegramUrl,
        imageBase64: base64,
      });

      console.log(createdAlliance, "createdAlliance");

      await navigate({ to: "/wallet" });
    } catch (error) {
      console.error("Error creating alliance:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateAllianceForFRU = async () => {
    if (!selectedFile || !allianceName || isProcessing || !telegramUrl) {
      setShowErrors(true);
      return;
    }

    try {
      setIsProcessing(true);
      let fileToProcess = selectedFile;

      // If file is HEIC, convert to PNG first
      if (isHeicFile(selectedFile)) {
        fileToProcess = await convertHeicToPng(selectedFile);
      }

      const base64 = await convertToBase64(fileToProcess);
      console.log(base64);

      await createWithFRU.mutateAsync({
        name: allianceName,
        telegramChannelUrl: telegramUrl,
        imageBase64: base64,
      });

      await navigate({ to: "/alliances" });
    } catch (error) {
      console.error("Error creating alliance:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleButtonClickFRU = () => {
    if (!selectedFile || !allianceName || isProcessing || !telegramUrl) {
      setShowErrors(true);
    } else {
      handleCreateAllianceForFRU();
    }
  };

  const handleButtonClickTON = () => {
    if (!selectedFile || !allianceName || isProcessing || !telegramUrl) {
      setShowErrors(true);
    } else {
      handleCreateAllianceForTON();
    }
  };

  const nameInputClass = `h-[42px] w-full rounded-full ${
    showErrors && (!allianceName || !telegramUrl)
      ? "border-1 border-red-500 pr-[15px] pl-[12px]"
      : "px-[14px]"
  } bg-[#F7FFEB0F] text-sm text-white placeholder-gray-400 focus:border-[#76AD10] focus:ring-1 focus:ring-[#A2D448] focus:outline-none`;

  const fileUploadClass = `flex p-3 w-full items-center justify-start gap-4 rounded-full ${
    showErrors && !selectedFile ? "border-1 border-red-500 " : ""
  } bg-[#343D24] text-sm font-medium text-white`;

  const t = useT();

  return (
    <div className="pr-4 pl-4 text-white">
      <BackButton onClick={() => navigate({ to: "/alliances" })} />
      <div className="mt-[97px] flex flex-col items-center justify-center">
        <AllianceGroup />
        <div className="font-manrope mb-[21px] text-2xl leading-none font-semibold">
          {t("Create alliance")}
        </div>
        <div className="relative w-full max-w-md">
          <div className="relative mb-[16px] w-full">
            <input
              type="text"
              placeholder={t("Enter name")}
              className={nameInputClass}
              size={500}
              value={allianceName}
              onChange={(e) => setAllianceName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          <div className="relative mb-[18px] w-full">
            <input
              type="text"
              placeholder={t("Enter channel link @example")}
              className={nameInputClass}
              size={500}
              value={telegramUrl}
              onChange={(e) => setTelegramUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
        </div>
        <div className="w-full max-w-md">
          <label htmlFor="photo-upload" className="block cursor-pointer">
            <div className={fileUploadClass}>
              <div className="flex aspect-square h-[54px] w-[54px] items-center justify-center rounded-full bg-[#85BF1A]">
                <div className="flex h-[24px] w-[24px] items-center justify-center rounded-md bg-white">
                  <PlusIcon />
                </div>
              </div>
              <div className="flex flex-col gap-[7px]">
                <div className="font-manrope text-base font-semibold">
                  {selectedFile
                    ? selectedFile.name.length > 14
                      ? selectedFile.name.substring(0, 14) + "..."
                      : selectedFile.name
                    : t("Upload avatar")}
                </div>
                <div className="font-manrope text-xs font-medium text-[#93A179]">
                  {selectedFile ? t("Change photo") : t("Select photo")}
                </div>
              </div>
            </div>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </label>
        </div>
        <div className="absolute right-4 bottom-[82px] flex items-center justify-center gap-2">
          <div>{t("Buy for TON")}</div>
          <Switch checked={isForTON} onCheckedChange={() => setIsForTON(!isForTON)} />
        </div>
        <div className="mt-4 flex h-[109px] w-[65vw] flex-col items-center justify-center rounded-full border border-[#575757] bg-[#2A2A2A]">
          <div className="font-manrope text-base font-semibold">{t("Create cost")}</div>

          <div className="flex items-center justify-center gap-2">
            <Token width={40} height={40} viewBox="0 0 30 30" />
            <div className="font-manrope text-[30px] font-extrabold">40 000</div>
          </div>
        </div>

        {isForTON ? (
          <button
            className="font-manrope absolute right-4 bottom-[21px] left-4 flex h-[52px] w-auto max-w-md items-center justify-center rounded-full bg-[#76AD10] px-6 text-sm font-medium text-white disabled:opacity-70"
            onClick={handleButtonClickTON}
            disabled={createWithTON.isPending || isProcessing}
          >
            {createWithTON.isPending || isProcessing
              ? t("Creating...")
              : t("Create for TON")}
          </button>
        ) : (
          <button
            className="font-manrope absolute right-4 bottom-[21px] left-4 flex h-[52px] w-auto max-w-md items-center justify-center rounded-full bg-[#76AD10] px-6 text-sm font-medium text-white disabled:opacity-70"
            onClick={handleButtonClickFRU}
            disabled={createWithFRU.isPending || isProcessing}
          >
            {createWithFRU.isPending || isProcessing
              ? t("Creating...")
              : t("Create for FRU")}
          </button>
        )}
      </div>
    </div>
  );
}
