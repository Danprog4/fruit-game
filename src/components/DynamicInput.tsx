import { useState } from "react";
import { Drawer } from "vaul";
import { PencilIcon } from "./icons/pencilIcon";

export const NameInput = ({
  userAlliance,
  isOwner,
  handleSave,
}: {
  userAlliance:
    | {
        id: number;
        name: string;
        ownerId: number;
        avatarId: string | null;
        telegramChannelUrl: string | null;
        members: number | null | undefined;
      }
    | undefined;
  isOwner: boolean;
  handleSave: (name: string) => void;
}) => {
  const [name, setName] = useState(userAlliance?.name || "");
  const [open, setOpen] = useState(false);

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <div className="font-manrope flex cursor-pointer items-center gap-2 text-xs font-medium">
          {userAlliance?.name}
          <PencilIcon />
        </div>
      </Drawer.Trigger>
      {isOwner && (
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
          <Drawer.Content className="fixed right-0 bottom-0 left-0 z-[1000] h-fit max-h-[80vh] overflow-y-auto rounded-t-[20px] bg-[#2A2A2A] outline-none">
            <div className="flex flex-col p-6">
              <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-[#575757]" />

              <div className="font-manrope mb-4 text-2xl font-bold text-white">
                Изменить название
              </div>

              <input
                type="text"
                value={name}
                className="mb-4 w-full rounded-xl bg-[#3A3A3A] p-4 text-white"
                placeholder="Название альянса"
                minLength={5}
                maxLength={20}
                onChange={(e) => setName(e.target.value)}
              />

              <button
                className="font-manrope mt-4 h-[52px] w-full rounded-full bg-[#76AD10] text-base font-medium text-white"
                onClick={() => {
                  handleSave(name);
                  setName("");
                  setOpen(false);
                }}
              >
                Сохранить
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      )}
    </Drawer.Root>
  );
};
