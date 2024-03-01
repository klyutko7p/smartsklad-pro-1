import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    cell: Cell;
    statusString: string;
    fromNameString: string;
}


export default defineEventHandler(async (event) => {
    try {
        const { cell, statusString, fromNameString } = await readBody<IRequestBody>(event);

        const updateCell = await prisma.cell.update({
            where: {
                id: cell.id,
            },
            data: {
                status: statusString,
                fromName: fromNameString,
                PVZ: cell.PVZ,
            },
        })

    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }

});
