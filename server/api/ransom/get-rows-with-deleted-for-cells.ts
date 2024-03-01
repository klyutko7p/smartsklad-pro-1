import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    flag: string
}

export default defineEventHandler(async (event) => {
    try {
        let { flag } = await readBody<IRequestBody>(event);

        if (flag === 'OurRansom') {
            const rows = await prisma.ourRansom.findMany({
                select: {
                    cell: true,
                    dispatchPVZ: true,
                    issued: true,
                },
                orderBy: {
                    created_at: 'desc',
                },
            });
            return rows;
        } else if (flag === 'ClientRansom') {
            const rows = await prisma.clientRansom.findMany({
                orderBy: {
                    created_at: 'desc',
                }
            });
            return rows;
        } else if (flag === 'Delivery') {
            const rows = await prisma.delivery.findMany({
                orderBy: {
                    created_at: 'desc',
                }
            });
            return rows;
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message)
            return { error: error.message };
        }
    }

});
