import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IRequestBody {
    row: IBalance;
    flag: string;
    username: string;
}


export default defineEventHandler(async (event) => {
    try {
        const { row, flag, username} = await readBody<IRequestBody>(event);

        let updateField;

        switch (flag) {
            case 'issued':
                updateField = 'issued';
                break;
            case 'received':
                updateField = 'received';
                break;
            default:
                throw new Error(`Unsupported flag: ${flag}`);
        }

        if (updateField === 'issued') {
            const updateRow = await prisma.balance.update({
                where: {
                    id: row.id,
                },
                data: {
                    [updateField]: new Date(),
                    receivedUser: username,
                },
            });
        } else if (updateField === 'received') {
            const updateRow = await prisma.balance.update({
                where: {
                    id: row.id,
                },
                data: {
                    [updateField]: new Date(),
                    receivedUser2: username,
                },
            });
        }
        
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
    }
});

