export const getAdminsIds = () => {
  const rawIds = process.env.ADMIN_IDS;
  if (!rawIds) throw new Error("ADMIN_IDS is unset");
  const ids = rawIds.split(",").map((id) => parseInt(id));
  return ids;
};

export const isAdmin = (userId: number) => {
  const admins = getAdminsIds();
  return admins.includes(userId);
};
