import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChangeEvent, useRef, useState } from "react";
import { BackButton } from "~/components/BackButton";
import { AllianceGroup } from "~/components/icons/AllianceGroup";
import { PlusIcon } from "~/components/icons/PlusIcon";
import { Token } from "~/components/icons/Token";
import { convertHeicToPng } from "~/lib/utils/convertHeicToPng";
import { convertToBase64 } from "~/lib/utils/convertToBase64";
import { useTRPC } from "~/trpc/init/react";

export const Route = createFileRoute("/create-alliance")({
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const navigate = useNavigate();
  const createAlliance = useMutation(trpc.alliances.createAlliance.mutationOptions());
  const [allianceName, setAllianceName] = useState("");
  const [telegramUrl, setTelegramUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showErrors, setShowErrors] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const isHeicFile = (file: File): boolean => {
    return file.name.toLowerCase().endsWith(".heic");
  };

  const handleCreateAlliance = async () => {
    if (!selectedFile || !allianceName) {
      setShowErrors(true);
      return;
    }

    try {
      let fileToProcess = selectedFile;

      // If file is HEIC, convert to PNG first
      if (isHeicFile(selectedFile)) {
        fileToProcess = await convertHeicToPng(selectedFile);
      }

      const base64 = await convertToBase64(fileToProcess);
      console.log(base64);

      await createAlliance.mutateAsync({
        name: allianceName,
        telegramChannelUrl: telegramUrl,
        imageBase64: base64,
      });

      await navigate({ to: "/alliances" });
    } catch (error) {
      console.error("Error creating alliance:", error);
    }
  };

  const handleButtonClick = () => {
    if (!selectedFile || !allianceName) {
      setShowErrors(true);
    } else {
      handleCreateAlliance();
    }
  };

  const nameInputClass = `h-[42px] w-full rounded-full ${
    showErrors && !allianceName
      ? "border-1 border-red-500 pr-[15px] pl-[12px]"
      : "px-[14px]"
  } bg-[#F7FFEB0F] text-sm text-white placeholder-gray-400 focus:border-[#76AD10] focus:ring-1 focus:ring-[#A2D448] focus:outline-none`;

  const fileUploadClass = `flex p-3 w-full items-center justify-start gap-4 rounded-full ${
    showErrors && !selectedFile ? "border-1 border-red-500 " : ""
  } bg-[#343D24] text-sm font-medium text-white`;

  return (
    <div className="pr-4 pl-4 text-white">
      <BackButton onClick={() => navigate({ to: "/alliances" })} />
      <div className="mt-[97px] flex flex-col items-center justify-center">
        <AllianceGroup />
        <div className="font-manrope mb-[21px] text-2xl leading-none font-semibold">
          Создание альянса
        </div>
        <div className="relative w-full max-w-md">
          <div className="relative mb-[16px] w-full">
            <input
              type="text"
              placeholder="Введите название"
              className={nameInputClass}
              size={500}
              value={allianceName}
              onChange={(e) => setAllianceName(e.target.value)}
            />
          </div>
          <div className="relative mb-[18px] w-full">
            <input
              type="text"
              placeholder="Ссылка на ваш канал"
              className="h-[42px] w-full rounded-full bg-[#F7FFEB0F] px-[14px] text-sm text-white placeholder-gray-400 focus:border-[#76AD10] focus:ring-1 focus:ring-[#A2D448] focus:outline-none"
              size={500}
              value={telegramUrl}
              onChange={(e) => setTelegramUrl(e.target.value)}
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
                    : "Загрузите аватар"}
                </div>
                <div className="font-manrope text-xs font-medium text-[#93A179]">
                  {selectedFile ? "Изменить фото" : "Выбрать фото"}
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
        <div className="absolute bottom-[110px] flex h-[109px] w-[65vw] flex-col items-center justify-center rounded-full border border-[#575757] bg-[#2A2A2A]">
          <div className="font-manrope text-base font-semibold">Стоимость создания</div>

          <div className="flex items-center justify-center gap-2">
            <Token width={40} height={40} viewBox="0 0 30 30" />
            <div className="font-manrope text-[30px] font-extrabold">40 000</div>
          </div>
        </div>
        <button
          className="font-manrope absolute right-4 bottom-[21px] left-4 flex h-[52px] w-auto max-w-md items-center justify-center rounded-full bg-[#76AD10] px-6 text-sm font-medium text-white"
          onClick={handleButtonClick}
          disabled={createAlliance.isPending}
        >
          {createAlliance.isPending ? "Создание..." : "Создать"}
        </button>
      </div>
    </div>
  );
}
