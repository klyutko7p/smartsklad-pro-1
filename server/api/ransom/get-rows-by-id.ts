import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    id: number;
    flag: string;
}

export default defineEventHandler(async (event) => {
    try {
        const { id, flag } = await readBody<IRequestBody>(event);

        if (flag === 'OurRansom') {
            const rows = await prisma.ourRansom.findFirst({
                where: {
                    id: id,
                },
            });
            return rows;
        } else if (flag === 'ClientRansom') {
            const rows = await prisma.clientRansom.findFirst({
                where: {
                    id: id,
                },
            });
            return rows;
        } else if (flag === 'Delivery') {
            const rows = await prisma.delivery.findFirst({
                where: {
                    id: id,
                },
            });
            return rows;
        }

    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }

});
