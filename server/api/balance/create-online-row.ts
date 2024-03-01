import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
  row: IBalanceOnline;
}

export default defineEventHandler(async (event) => {
  try {
    let { row } = await readBody<IRequestBody>(event);
    const rowData = await prisma.balanceOnline.create({
      data: {
        id: row.id,
        sum: row.sum,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message)
      return { error: error.message };
    }
  }
});
