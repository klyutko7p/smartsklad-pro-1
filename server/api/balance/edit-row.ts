import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    row: IBalance;
}


export default defineEventHandler(async (event) => {
    try {
        const { row } = await readBody<IRequestBody>(event);
        const updateRow = await prisma.balance.update({
            where: {
                id: row.id,
            },
            data: {
                id: row.id,
                sum: row.sum,
                pvz: row.pvz,
                issued: row.issued ? new Date(row.issued).toISOString() : null,
                received: row.received ? new Date(row.received).toISOString() : null,
                notation: row.notation,
                receivedUser: row.receivedUser,
                receivedUser2: row.receivedUser2,
                createdUser: row.createdUser,
            },
        })
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }

});
