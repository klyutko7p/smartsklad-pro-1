import { defineStore } from "pinia";
import { useToast } from "vue-toastification";
import crypto from 'crypto-js';

const toast = useToast()

export const useBalanceStore = defineStore("balance", () => {

    let cachedBalanceRows: IBalance[] | null = null;

    async function createBalanceRow(row: IBalance, username: string) {
        try {
            if (row.sum === undefined) row.sum = '0';
            if (row.pvz === undefined) row.pvz = '';

            row.createdUser = username;
            row.receivedUser = '';

            let data = await useFetch('/api/balance/create-row', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ row: row }),
            });

            if (data.data.value === undefined) {
                cachedBalanceRows = null;
                toast.success("Запись успешно создана!");
            } else {
                toast.error("Произошла ошибка при создании записи");
            }
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    }

    async function getBalanceRows() {
        try {
            if (cachedBalanceRows) {
                return cachedBalanceRows;
            } else {
                let { data }: any = await useFetch('/api/balance/get-rows', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({})
                });
                cachedBalanceRows = data.value;
                return cachedBalanceRows;
            }
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    }

    async function updateBalanceRow(row: IBalance, username: string) {
        try {
            if (row.sum === undefined) row.sum = '0';
            if (row.pvz === undefined) row.pvz = '';

            let data = await useFetch('/api/balance/edit-row', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ row: row }),
            });

            if (data.data.value === undefined) {
                cachedBalanceRows = null;
                toast.success("Запись успешно обновлена!");
            } else {
                toast.error("Произошла ошибка при обновлении записи!");
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message)
                toast.error(error.message);
            }
        }
    }

    async function updateDeliveryStatus(row: IBalance, flag: string, username: string) {
        try {
            let data = await useFetch('/api/balance/update-delivery', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ row: row, flag: flag, username: username }),
            });

            if (data.data.value === undefined) {
                cachedBalanceRows = null;
                toast.success("Статус успешно обновлен!");
            } else {
                console.log(data.data.value);
                toast.error("Произошла ошибка");
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message)
                toast.error(error.message);
            }
        }
    }

    return { updateDeliveryStatus, updateBalanceRow, getBalanceRows, createBalanceRow }
})