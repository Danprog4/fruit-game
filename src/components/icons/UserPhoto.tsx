export const UserPhoto = ({ friendPhotoUrl }: { friendPhotoUrl?: string }) => {
  return (
    <img
      src={friendPhotoUrl || undefined}
      alt="user"
      className="h-[54px] w-[54px] rounded-full"
    />
  );
};
