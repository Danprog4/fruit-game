import { eq } from "drizzle-orm";
import { db } from "../db";
import { usersTable } from "../db/schema";

export const incrementUserFarm = async (userId: number, farmId: string) => {
  const user = await db.query.usersTable.findFirst({
    where: (users) => eq(users.id, userId),
  });

  if (!user) {
    return;
  }

  const currentFarms = user.farms || {};

  const farmCount = currentFarms[farmId] || 0;

  const updatedFarms = {
    ...currentFarms,
    [farmId]: farmCount + 1,
  };

  await db
    .update(usersTable)
    .set({
      farms: updatedFarms,
    })
    .where(eq(usersTable.id, userId));
};
