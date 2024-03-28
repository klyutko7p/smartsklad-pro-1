import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    flag: string
}

const currentDate = new Date();
const currentDayOfWeek = currentDate.getDay();

const startOfWeek = new Date(currentDate);
startOfWeek.setDate(currentDate.getDate() - currentDayOfWeek);

const endOfWeek = new Date(currentDate);
endOfWeek.setDate(startOfWeek.getDate() + 7);

export default defineEventHandler(async (event) => {
    try {
        let { flag } = await readBody<IRequestBody>(event);

        if (flag === 'OurRansom') {
            const rows = await prisma.ourRansom.findMany({
                where: {
                    deleted: {
                        gte: startOfWeek,
                        lt: endOfWeek,
                    },
                    issued: {
                        gte: startOfWeek,
                        lt: endOfWeek,
                    },
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
