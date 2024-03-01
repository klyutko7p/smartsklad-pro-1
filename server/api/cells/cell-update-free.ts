import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    cells: Cell[];
}

export default defineEventHandler(async (event) => {
    try {
        const { cells } = await readBody<IRequestBody>(event);

        const cellIds = cells.map(cell => cell.id);

        const updateCells = await prisma.cell.updateMany({
            where: {
                id: {
                    in: cellIds 
                }
            },
            data: {
                status: "Свободно",
                fromName: null,
            }
        });

        return "Updated successfully";
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }
});
