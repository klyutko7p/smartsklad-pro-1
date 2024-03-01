import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    PVZ: string;
    flag: string;
}

export default defineEventHandler(async (event) => {
    try {
        const { PVZ, flag } = await readBody<IRequestBody>(event);

        if (flag === 'OurRansom') {
            const rows = await prisma.ourRansom.findMany({
                select: {
                    cell: true,
                    fromName: true,
                    deleted: true,
                    dispatchPVZ: true,
                    deliveredSC: true,
                    issued: true,
                    deliveredPVZ: true,
                    orderPVZ: true,
                },
                where: {
                    dispatchPVZ: PVZ,
                },
                orderBy: [
                    {
                        created_at: 'desc'
                    },
                ]
            });
            return rows;
        } else if (flag === 'ClientRansom') {
            const rows = await prisma.clientRansom.findMany({
                where: {
                    dispatchPVZ: PVZ,
                },
                orderBy: [
                    {
                        created_at: 'desc'
                    },
                ]
            });
            return rows;
        }
        // else if (flag === 'Delivery') {
        //     const rows = await prisma.delivery.findMany({
        //         where: {
        //             clientLink3: link,
        //             deleted: null,
        //         },
        //         orderBy: {
        //             created_at: 'desc',   
        //         }
        //     });
        //     return rows;
        // }

    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }

});
