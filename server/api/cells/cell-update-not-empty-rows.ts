import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    cells: any[];
}

export default defineEventHandler(async (event) => {
    try {
        const { cells } = await readBody<IRequestBody>(event);

        for (const cell of cells) {
            await prisma.cell.updateMany({
                where: {
                    name: cell.name,
                    PVZ: cell.PVZ
                },
                data: {
                    status: cell.status,
                    fromName: cell.fromName,
                }
            });
        }

        return "Updated successfully";
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }
});
