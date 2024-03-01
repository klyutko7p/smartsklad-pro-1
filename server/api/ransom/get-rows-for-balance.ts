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
                    dispatchPVZ: true,
                    deliveredPVZ: true,
                    deliveredSC: true,
                    prepayment: true,
                    additionally: true,
                    deliveredKGT: true,
                    profit1: true,
                    amountFromClient1: true,    
                    issued: true,
                    priceSite: true,
                    percentClient: true,
                    deleted: true,
                    created_at: true,
                },
                orderBy: {
                    created_at: 'desc',
                },
            });
            return rows;
        } else if (flag === 'ClientRansom') {
            const rows = await prisma.clientRansom.findMany({
                select: {
                    dispatchPVZ: true,
                    deliveredPVZ: true,
                    deliveredSC: true,
                    prepayment: true,
                    additionally: true,
                    deliveredKGT: true,
                    profit2: true,
                    amountFromClient2: true,    
                    issued: true,
                    percentClient: true,
                    deleted: true,
                    created_at: true,
                },
                orderBy: {
                    created_at: 'desc',
                },
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
