import { defineStore } from "pinia";
import { useToast } from "vue-toastification";

const toast = useToast()

interface CellDispatchPair {
    cell: string;
    dispatchPVZ: string;
}

export const useCellsStore = defineStore("cells", () => {

    let cachesCells: any = null;

    function isUnique(obj, index, self) {
        return self.findIndex(o =>
            o.name === obj.name &&
            o.PVZ === obj.PVZ) === index;
    }

    async function getCells() {
        if (cachesCells) {
            return cachesCells;
        } else {
            try {
                let { data }: any = await useFetch('/api/cells/get-cells', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                cachesCells = data.value;
                let uniqueCells = cachesCells.filter(isUnique);
                return uniqueCells;
            } catch (error) {
                if (error instanceof Error) {
                    toast.error(error.message);
                }
            }
        }
    }

    async function updateCell(cell: Cell, status: string, fromName: string) {
        try {
            let data = await useFetch('/api/cells/cell-update-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cell: cell, statusString: status, fromNameString: fromName }),
            })
            cachesCells = null;
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    }

    async function updateCellsStatus(ransomRows: any[]): Promise<any[]> {
        try {
            const filteredData = ransomRows.filter(item => item.cell && !item.cell.includes("-") && item.dispatchPVZ !== 'НаДом');

            const groupedData: { [dispatchPVZ: string]: { [cell: string]: any[] } } = {};

            filteredData.forEach(item => {
                const dispatchPVZ = item.dispatchPVZ;
                const cell = item.cell;

                if (!groupedData[dispatchPVZ]) {
                    groupedData[dispatchPVZ] = {};
                }

                if (!groupedData[dispatchPVZ][cell]) {
                    groupedData[dispatchPVZ][cell] = [];
                }

                groupedData[dispatchPVZ][cell].push(item);
            });

            const freeCells: { cell: string, dispatchPVZ: string }[] = [];

            for (const dispatchPVZ in groupedData) {
                for (const cell in groupedData[dispatchPVZ]) {
                    const allIssuedNotNull = groupedData[dispatchPVZ][cell].every(item => item.issued !== null);
                    if (allIssuedNotNull) {
                        freeCells.push({ cell, dispatchPVZ });
                    }
                }
            }

            const allCells = await getCells()

            const matches: any = [];
            const disMatches: any = [];

            freeCells.forEach(item1 => {
                allCells.forEach(item2 => {
                    if (item1.cell === item2.name && item1.dispatchPVZ === item2.PVZ) {
                        matches.push(item2);
                    } else {
                        disMatches.push(item2)
                    }
                });
            });

            // const matchedData = filteredData.filter(filteredItem => {
            //     return filteredItem.issued === null && filteredItem.deleted === null && disMatches.some(cell =>
            //         cell.status === 'Занято' &&
            //         cell.name === filteredItem.cell &&
            //         cell.PVZ === filteredItem.dispatchPVZ &&
            //         cell.fromName !== filteredItem.fromName
            //     );
            // });

            // const resultArray = matchedData.map(item => ({
            //     name: item.cell,
            //     PVZ: item.dispatchPVZ,
            //     fromName: item.fromName,
            //     status: 'Занято'
            // }));

            // const uniqueArray = resultArray.filter((item, index, self) => {
            //     const firstIndex = self.findIndex((t) => (
            //         t.name === item.name && t.PVZ === item.PVZ
            //     ));
            //     return index === firstIndex || index === self.length - 1;
            // });

            // if (uniqueArray.length > 0) {
            //     try {
            //         let data = await useFetch('/api/cells/cell-update-not-empty-rows', {
            //             method: 'POST',
            //             headers: {
            //                 'Content-Type': 'application/json',
            //             },
            //             body: JSON.stringify({ cells: uniqueArray }),
            //         })
            //         if (data.data.value === 'Updated successfully') {
            //             cachesCells = null;
            //         } else {
            //             toast.error("Произошла ошибка при обновлении ячеек!");
            //         }
            //     } catch (error) {
            //         if (error instanceof Error) {
            //             toast.error(error.message);
            //         }
            //     }
            // }
            
            // const matchedData1 = filteredData.filter(filteredItem => {
            //     return filteredItem.issued === null && filteredItem.deleted === null && disMatches.some(cell =>
            //         cell.status === 'Свободно' &&
            //         cell.name === filteredItem.cell &&
            //         cell.PVZ === filteredItem.dispatchPVZ
            //     );
            // });

            // const resultArray1 = matchedData1.map(item => ({
            //     name: item.cell,
            //     PVZ: item.dispatchPVZ,
            //     fromName: item.fromName,
            //     status: 'Занято'
            // }));

            // const uniqueArray1 = resultArray1.filter((item, index, self) => {
            //     const firstIndex = self.findIndex((t) => (
            //         t.name === item.name && t.PVZ === item.PVZ
            //     ));
            //     return index === firstIndex || index === self.length - 1;
            // });


            // if (uniqueArray1.length > 0) {
            //     try {
            //         let data = await useFetch('/api/cells/cell-update-empty-rows', {
            //             method: 'POST',
            //             headers: {
            //                 'Content-Type': 'application/json',
            //             },
            //             body: JSON.stringify({ cells: uniqueArray1 }),
            //         })
            //         if (data.data.value === 'Updated successfully') {
            //             cachesCells = null;
            //         } else {
            //             toast.error("Произошла ошибка при обновлении ячеек!");
            //         }
            //     } catch (error) {
            //         if (error instanceof Error) {
            //             toast.error(error.message);
            //         }
            //     }
            // }
           
                try {
                    let data = await useFetch('/api/cells/cell-update-free', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ cells: matches }),
                    })
                    if (data.data.value === 'Updated successfully') {
                        cachesCells = null;
                    } else {
                        toast.error("Произошла ошибка при обновлении ячеек!");
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        toast.error(error.message);
                    }
                }

            const filteredFreeCells = freeCells.filter(cell =>
                !matches.some(match => match.name === cell.cell && match.PVZ === cell.dispatchPVZ)
            );

            if (filteredFreeCells.length > 0) {
                try {
                    let data = await useFetch('/api/cells/cell-update-create', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ cells: filteredFreeCells }),
                    })
                    if (data.data.value === 'Created successfully') {
                        cachesCells = null;
                    } else {
                        toast.error("Произошла ошибка при создании ячеек!");
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        toast.error(error.message);
                    }
                }
            }

            return freeCells;
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            }
            throw error;
        }
    }

    async function updateCellsStatusWithNoSpeed(ransomRows: any[]): Promise<any[]> {
        try {
            const filteredData = ransomRows.filter(item => item.cell && !item.cell.includes("-") && item.dispatchPVZ !== 'НаДом');

            const groupedData: { [dispatchPVZ: string]: { [cell: string]: any[] } } = {};

            filteredData.forEach(item => {
                const dispatchPVZ = item.dispatchPVZ;
                const cell = item.cell;

                if (!groupedData[dispatchPVZ]) {
                    groupedData[dispatchPVZ] = {};
                }

                if (!groupedData[dispatchPVZ][cell]) {
                    groupedData[dispatchPVZ][cell] = [];
                }

                groupedData[dispatchPVZ][cell].push(item);
            });

            const freeCells: { cell: string, dispatchPVZ: string }[] = [];

            for (const dispatchPVZ in groupedData) {
                for (const cell in groupedData[dispatchPVZ]) {
                    const allIssuedNotNull = groupedData[dispatchPVZ][cell].every(item => item.issued !== null);
                    if (allIssuedNotNull) {
                        freeCells.push({ cell, dispatchPVZ });
                    }
                }
            }

            const allCells = await getCells()

            const matches: any = [];
            const disMatches: any = [];

            freeCells.forEach(item1 => {
                allCells.forEach(item2 => {
                    if (item1.cell === item2.name && item1.dispatchPVZ === item2.PVZ) {
                        matches.push(item2);
                    } else {
                        disMatches.push(item2)
                    }
                });
            });

            const matchedData = filteredData.filter(filteredItem => {
                return filteredItem.issued === null && filteredItem.deleted === null && disMatches.some(cell =>
                    cell.status === 'Занято' &&
                    cell.name === filteredItem.cell &&
                    cell.PVZ === filteredItem.dispatchPVZ &&
                    cell.fromName !== filteredItem.fromName
                );
            });

            const resultArray = matchedData.map(item => ({
                name: item.cell,
                PVZ: item.dispatchPVZ,
                fromName: item.fromName,
                status: 'Занято'
            }));

            const uniqueArray = resultArray.filter((item, index, self) => {
                const firstIndex = self.findIndex((t) => (
                    t.name === item.name && t.PVZ === item.PVZ
                ));
                return index === firstIndex || index === self.length - 1;
            });

            if (uniqueArray.length > 0) {
                try {
                    let data = await useFetch('/api/cells/cell-update-not-empty-rows', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ cells: uniqueArray }),
                    })
                    if (data.data.value === 'Updated successfully') {
                        cachesCells = null;
                    } else {
                        toast.error("Произошла ошибка при обновлении ячеек!");
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        toast.error(error.message);
                    }
                }
            }
            
            const matchedData1 = filteredData.filter(filteredItem => {
                return filteredItem.issued === null && filteredItem.deleted === null && disMatches.some(cell =>
                    cell.status === 'Свободно' &&
                    cell.name === filteredItem.cell &&
                    cell.PVZ === filteredItem.dispatchPVZ
                );
            });

            const resultArray1 = matchedData1.map(item => ({
                name: item.cell,
                PVZ: item.dispatchPVZ,
                fromName: item.fromName,
                status: 'Занято'
            }));

            const uniqueArray1 = resultArray1.filter((item, index, self) => {
                const firstIndex = self.findIndex((t) => (
                    t.name === item.name && t.PVZ === item.PVZ
                ));
                return index === firstIndex || index === self.length - 1;
            });


            if (uniqueArray1.length > 0) {
                try {
                    let data = await useFetch('/api/cells/cell-update-empty-rows', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ cells: uniqueArray1 }),
                    })
                    if (data.data.value === 'Updated successfully') {
                        cachesCells = null;
                    } else {
                        toast.error("Произошла ошибка при обновлении ячеек!");
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        toast.error(error.message);
                    }
                }
            }

            return freeCells;
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            }
            throw error;
        }
    }


    return { getCells, updateCell, updateCellsStatus, updateCellsStatusWithNoSpeed }
})