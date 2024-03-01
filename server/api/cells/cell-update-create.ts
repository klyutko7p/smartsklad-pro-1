import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    cells: any[];
}

export default defineEventHandler(async (event) => {
    try {
        const { cells } = await readBody<IRequestBody>(event);

        const cellsToCreate = cells.map(cell => ({
            name: cell.cell,
            status: 'Свободно',
            fromName: null,
            PVZ: cell.dispatchPVZ,
        }));

        const createdCells = await prisma.cell.createMany({
            data: cellsToCreate,
        });
        
        return "Created successfully";
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }
});
