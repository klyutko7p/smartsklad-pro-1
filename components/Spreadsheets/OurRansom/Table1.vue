<script setup lang="ts">
import { read, utils, writeFile } from "xlsx";

const router = useRouter()
const route = useRoute()

const storeUsers = useUsersStore();
const storeRansom = useRansomStore()

const emit = defineEmits([
    "openModal",
    "deleteRow",
    "deleteSelectedRows",
    "updateDeliveryRows",
    "createCopyRow",
]);

function updateDeliveryRows(flag: string) {
    emit("updateDeliveryRows", { idArray: checkedRows.value, flag: flag });
    checkedRows.value = []
    allSum.value = []
    getAllSum.value = 0
}

function openModal(row: IOurRansom) {
    emit("openModal", row);
}

function createCopyRow() {
    emit("createCopyRow", checkedRows.value[0]);
    checkedRows.value = []
    allSum.value = []
    getAllSum.value = 0
}

function deleteRow(id: number) {
    emit("deleteRow", id);
}

function deleteSelectedRows() {
    emit("deleteSelectedRows", checkedRows.value);
    checkedRows.value = []
    allSum.value = []
    getAllSum.value = 0
}


const props = defineProps({
    user: { type: Object as PropType<User>, required: true },
    rows: { type: Array as PropType<IOurRansom[]> },
    pvzLink: { type: String }
});

async function exportToExcel() {
    perPage.value = await totalRows.value;
    await updateCurrentPageDataDeleted();

    let table = await document.querySelector("#theTable");

    let wb = await utils.table_to_book(table);

    await writeFile(wb, "наш_выкуп.xlsx");

    perPage.value = await 100;
}



const allSum: Ref<RowData[]> = ref([]);
const checkedRows: Ref<number[]> = ref([]);

const getAllSum: Ref<number> = ref(0);
const showButton: Ref<boolean> = ref(true);
const showButtonPVZ: Ref<boolean> = ref(true);
const showButtonSC: Ref<boolean> = ref(true);

const isChecked = (rowId: number): boolean => {
    return checkedRows.value.includes(rowId);
};

interface RowData {
    rowId: number;
    amount: number;
    issued: Date | null | string | number;
    deliveredPVZ: Date | null | string | number;
    deliveredSC: Date | null | string | number;
    orderPVZ: Date | null | string | number;
}

let scanStringItem = ref('')

let timeoutId: ReturnType<typeof setTimeout> | null = null;

function scanItem() {
    if (timeoutId !== null) {
        clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(async () => {
        let scannedLink = scanStringItem.value.trim();
        scannedLink = convertToURL(scannedLink);
        let rowData = await storeRansom.getRansomRowsById(+scannedLink, "OurRansom");
        handleCheckboxChange(rowData);
        scanStringItem.value = "";
    }, 1500);
}

function convertToURL(inputString: string) {
    if (inputString.includes("/")) {
        const parts = inputString.split("/");
        const entryID = parts[parts.length - 1];
        return entryID;
    } else if (inputString.includes(".")) {
        const parts = inputString.split(".");
        const entryID = parts[parts.length - 1];
        return entryID;
    }
}

const handleCheckboxChange = (row: IOurRansom): void => {
    if (isChecked(row.id)) {
        checkedRows.value = checkedRows.value.filter((id) => id !== row.id);
        allSum.value = allSum.value.filter((obj) => obj.rowId !== row.id);
    } else {
        checkedRows.value.push(row.id);
        allSum.value.push({ rowId: row.id, amount: Math.ceil(row.amountFromClient1 / 10) * 10, issued: row.issued, deliveredPVZ: row.deliveredPVZ, orderPVZ: row.orderPVZ, deliveredSC: row.deliveredSC, });
    }
    getAllSum.value = allSum.value.filter((obj) => obj.issued === null).reduce((sum, obj) => sum + obj.amount, 0);
    showButton.value = allSum.value.every(obj => obj.issued === null);
    showButtonPVZ.value = allSum.value.every(obj => obj.deliveredPVZ === null);
    showButtonSC.value = allSum.value.every(obj => obj.deliveredSC === null);
};

const showDeletedRows = ref(false);

const perPage = ref(100)
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil((props.rows?.length || 0) / perPage.value));
const totalRows = computed(() => Math.ceil(props.rows?.filter((row) => row.deleted === null).length || 0));

let returnRows = ref<Array<IOurRansom>>()

function updateCurrentPageData() {
    const startIndex = (currentPage.value - 1) * perPage.value
    const endIndex = startIndex + perPage.value

    if (showDeletedRows.value) {
        returnRows.value = props.rows?.slice(startIndex, endIndex);
    } else {
        returnRows.value = props.rows?.filter((row) => !row.deleted).slice(startIndex, endIndex);
    }
}

async function updateCurrentPageDataDeleted() {
    const startIndex = (currentPage.value - 1) * perPage.value
    const endIndex = startIndex + perPage.value

    if (showDeletedRows.value) {
        returnRows.value = await storeRansom.getRansomRowsWithDeleted("OurRansom");
    } else {
        returnRows.value = props.rows?.filter((row) => !row.deleted).slice(startIndex, endIndex);
    }
}

watch([currentPage, totalRows, props.rows], updateCurrentPageData)

const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--
    }
}

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++
    }
}

const toggleShowDeletedRows = () => {
    showDeletedRows.value = !showDeletedRows.value;
    updateCurrentPageData();
};

let isVisiblePages = ref(true)


onMounted(async () => {
    focusInput()

    updateCurrentPageData();

    if (props.user.role === 'SORTIROVKA') {
        perPage.value = totalRows.value;
        updateCurrentPageData();
    }

    await storeRansom.getSumOfRejection()

})


let showOthersVariants = ref(false)
const myInput = ref(null);

function focusInput() {
    myInput.value.focus();
}

</script>
<template>
    <div class="flex items-center justify-between max-lg:block mt-10">
        <div>
            <input class="block w-full bg-transparent mb-5 border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 rounded-2xl focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
            placeholder="Отсканируйте товар (Выделение)" ref="myInput" autofocus v-model="scanStringItem" @input="scanItem" />
            <div class="flex items-center max-sm:flex-col max-sm:items-start gap-5 mb-5">
                <h1 class="text-xl" v-if="user.role !== 'PVZ'">Товаров в работе: <span
                        class="text-secondary-color font-bold">{{
                            totalRows }}</span> </h1>
                <h1 class="text-xl" v-if="user.role === 'PVZ'">Товаров к выдаче: <span
                        class="text-secondary-color font-bold">{{
                            totalRows }}</span> </h1>
            </div>

            <div class="flex items-center gap-5" v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'">
                <UIActionButton @click="toggleShowDeletedRows">
                    {{ showDeletedRows ? 'Скрыть удаленное' : 'Показать удаленное' }}
                </UIActionButton>
            </div>



        </div>
        <div class="flex items-end max-lg:mt-5 max-lg:justify-between gap-20">
            <div class="flex flex-col text-center" v-if="isVisiblePages">
                <h1 class="text-base">Страница:</h1>
                <h1 class="text-base mb-2"> {{ currentPage }} из {{ totalPages }} </h1>
                <div class="flex items-center justify-center gap-2">
                    <button @click="prevPage(), updateCurrentPageData()" :disabled="currentPage === 1"
                        class="disabled:opacity-40 disabled:cursor-not-allowed duration-150 bg-secondary-color flex items-center justify-center rounded-sm p-3">
                        <Icon name="material-symbols:arrow-back-ios-new-rounded" class="text-white" />
                    </button>
                    <button @click="nextPage(), updateCurrentPageData()" :disabled="currentPage === totalPages"
                        class="disabled:opacity-40 disabled:cursor-not-allowed duration-150 bg-secondary-color flex items-center justify-center rounded-sm p-3">
                        <Icon name="material-symbols:arrow-forward-ios-rounded" class="text-white" />
                    </button>
                </div>
            </div>
            <Icon class="duration-200 hover:text-secondary-color cursor-pointer" size="40"
                name="material-symbols:sheets-add-on" @click="exportToExcel" />
        </div>
    </div>

    <div class="fixed top-16 z-40 left-1/2 translate-x-[-50%] translate-y-[-50%]" v-if="getAllSum > 0">
        <h1 class="text-base backdrop-blur-xl p-2 rounded-xl border-2 text-secondary-color font-bold">К оплате: {{
            getAllSum }} </h1>
    </div>

    <div class="fixed z-40 flex flex-col gap-3 left-1/2 translate-x-[-50%] translate-y-[-50%]"
        v-if="user.dataOurRansom === 'WRITE' && checkedRows.length > 0 && user.role !== 'PVZ'">
        <UIActionButton
            v-if="user.dataOurRansom === 'WRITE' && user.role === 'ADMIN' || user.role === 'ADMINISTRATOR' && checkedRows.length === 1"
            @click="createCopyRow">Скопировать запись</UIActionButton>
        <UIActionButton v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR' && user.dataOurRansom === 'WRITE'"
            @click="deleteSelectedRows">Удалить
            выделенные записи</UIActionButton>
        <UIActionButton v-if="user.deliveredSC1 === 'WRITE' && showButtonSC" @click="updateDeliveryRows('SC')">Доставить на
            сц
        </UIActionButton>
        <UIActionButton v-if="user.deliveredPVZ1 === 'WRITE' && showButtonPVZ" @click="updateDeliveryRows('PVZ')">Доставить
            на пвз
        </UIActionButton>
        <UIActionButton v-if="user.issued1 === 'WRITE' && showButton" @click="showOthersVariants = !showOthersVariants">
            Выдать клиенту
        </UIActionButton>
        <div v-if="showOthersVariants" class="flex flex-col gap-3">
            <UIActionButton2 v-if="user.additionally1 === 'WRITE'" @click="updateDeliveryRows('additionally3')">Оплата
                наличными
            </UIActionButton2>
            <UIActionButton2 v-if="user.additionally1 === 'WRITE'" @click="updateDeliveryRows('additionally')">Оплата
                онлайн
            </UIActionButton2>
            <UIActionButton2 v-if="user.additionally1 === 'WRITE'" @click="updateDeliveryRows('additionally1')">Отказ клиент
            </UIActionButton2>
            <UIActionButton2 v-if="user.additionally1 === 'WRITE'" @click="updateDeliveryRows('additionally2')">Отказ брак
            </UIActionButton2>
        </div>
    </div>

    <div class="fixed z-40 flex flex-col gap-3 left-1/2 translate-x-[-50%] translate-y-[-50%]"
        v-if="user.dataOurRansom === 'WRITE' && checkedRows.length > 0 && user.role === 'PVZ'">
        <UIActionButton v-if="user.deliveredPVZ1 === 'WRITE' && showButtonPVZ" @click="updateDeliveryRows('PVZ')">Доставить
            на пвз
        </UIActionButton>
        <UIActionButton v-if="user.issued1 === 'WRITE' && showButton" @click="showOthersVariants = !showOthersVariants">
            Выдать
            клиенту
        </UIActionButton>
        <div v-if="showOthersVariants" class="flex flex-col gap-3">
            <UIActionButton2 v-if="user.additionally1 === 'WRITE'" @click="updateDeliveryRows('additionally3')">Оплата
                наличными
            </UIActionButton2>
            <UIActionButton2 v-if="user.additionally1 === 'WRITE'" @click="updateDeliveryRows('additionally')">Оплата
                онлайн
            </UIActionButton2>
            <UIActionButton2 v-if="user.additionally1 === 'WRITE'" @click="updateDeliveryRows('additionally1')">Отказ клиент
            </UIActionButton2>
            <UIActionButton v-if="user.additionally1 === 'WRITE'" @click="updateDeliveryRows('additionally2')">Отказ брак
            </UIActionButton>
        </div>
    </div>

    <div class="relative max-h-[610px] mt-5 mb-10 mr-5">
        <div id="up"></div>
        <table v-if="totalRows > 0" id="theTable"
            class="w-full border-x-2 border-gray-50 text-sm text-left rtl:text-right text-gray-500">
            <thead class="text-xs sticky top-0 z-30 text-gray-700 uppercase text-center bg-gray-50">
                <tr>
                    <th scope="col" class="border-2" v-if="user.dataOurRansom === 'WRITE'">
                        Выделение
                    </th>
                    <th scope="col" class="exclude-row border-2 text-[10px]"
                        v-if="user.dataOurRansom === 'WRITE' && user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'">
                        изменение
                    </th>
                    <th scope="col" class="border-2 px-3">id</th>
                    <th scope="col" class="border-2" v-if="user.clientLink1 === 'READ' || user.clientLink1 === 'WRITE'">
                        ссылка для клиента
                    </th>
                    <th scope="col" class=" border-2" v-if="user.cell1 === 'READ' || user.cell1 === 'WRITE'">
                        ячейка
                    </th>
                    <th scope="col" class="border-2" v-if="user.fromName1 === 'READ' || user.fromName1 === 'WRITE'">
                        телефон
                    </th>
                    <th scope="col" class="border-2" v-if="user.productLink1 === 'READ' || user.productLink1 === 'WRITE'">
                        товар (ссылка)
                    </th>
                    <th scope="col" class="border-2" v-if="user.productName1 === 'READ' || user.productName1 === 'WRITE'">
                        название товара
                    </th>
                    <th scope="col" class="border-2" v-if="user.notation1 === 'READ' || user.notation1 === 'WRITE'">
                        примечание
                    </th>
                    <th scope="col" class=" border-2" v-if="user.priceSite === 'READ' || user.priceSite === 'WRITE'">
                        стоимость сайт
                    </th>
                    <th scope="col" class="border-2" v-if="user.prepayment1 === 'READ' || user.prepayment1 === 'WRITE'">
                        предоплата
                    </th>
                    <th scope="col" class="border-2"
                        v-if="user.percentClient1 === 'READ' || user.percentClient1 === 'WRITE'">
                        процент с клиента (%)
                    </th>
                    <th scope="col" class="border-2" v-if="user.deliveredKGT1 === 'READ' || user.deliveredKGT1 === 'WRITE'">
                        дополнительный доход
                    </th>
                    <th scope="col" class="border-2"
                        v-if="user.amountFromClient1 === 'READ' || user.amountFromClient1 === 'WRITE'">
                        сумма с клиента
                    </th>
                    <th scope="col" class="border-2" v-if="user.dispatchPVZ1 === 'READ' || user.dispatchPVZ1 === 'WRITE'">
                        отправка в пвз
                    </th>
                    <th scope="col" class="border-2" v-if="user.orderPVZ1 === 'READ' || user.orderPVZ1 === 'WRITE'">
                        заказано на сц
                    </th>
                    <th scope="col" class="border-2" v-if="user.orderAccount === 'READ' || user.orderAccount === 'WRITE'">
                        аккаунт заказа
                    </th>
                    <th scope="col" class="border-2" v-if="user.deliveredSC1 === 'READ' || user.deliveredSC1 === 'WRITE'">
                        доставлено на сц
                    </th>
                    <th scope="col" class="border-2" v-if="user.deliveredPVZ1 === 'READ' || user.deliveredPVZ1 === 'WRITE'">
                        доставлено на пвз
                    </th>
                    <th scope="col" class="border-2" v-if="user.issued1 === 'READ' || user.issued1 === 'WRITE'">
                        выдан клиенту
                    </th>
                    <th scope="col" class="border-2" v-if="user.additionally1 === 'READ' || user.additionally1 === 'WRITE'">
                        дополнительно
                    </th>
                    <th scope="col" class="border-2" v-if="user.profit1 === 'READ' || user.profit1 === 'WRITE'">
                        прибыль (доход)
                    </th>
                    <th scope="col" class="border-2" v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'">создан
                        (время)
                    </th>
                    <th scope="col" class="border-2" v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'">изменен
                        (время)
                    </th>
                    <th scope="col" class="border-2" v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'">удален
                        (время)
                    </th>
                    <th scope="col" class="border-2" v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'">создан
                    </th>
                    <th scope="col" class="border-2" v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'">изменен
                    </th>
                    <th scope="col" class="exclude-row px-6 py-3 border-2"
                        v-if="user.dataOurRansom === 'WRITE' && user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'">
                        удаление
                    </th>
                </tr>
            </thead>
            <tbody>
                <div id="left"></div>
                <tr :class="{ 'bg-orange-100': isChecked(row.id) }" class="border-b text-center text-sm"
                    v-for="row in returnRows">
                    <td v-if="user.dataOurRansom === 'WRITE'" class="border-2 text-secondary-color">
                        <input type="checkbox" :value="row.id" :checked="isChecked(row.id)"
                            @change="handleCheckboxChange(row)" />
                    </td>
                    <td class="border-2"
                        v-if="user.dataOurRansom === 'WRITE' && user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'">
                        <Icon @click="openModal(row)"
                            class="text-green-600 cursor-pointer hover:text-green-300 duration-200"
                            name="material-symbols:edit" size="32" />
                    </td>
                    <th scope="row" class="border-2 font-medium underline text-secondary-color whitespace-nowrap">
                        <NuxtLink v-if="user.role !== 'PVZ' && user.role !== 'ADMINISTRATOR'"
                            class="cursor-pointer hover:text-orange-200 duration-200"
                            :to="`/spreadsheets/record/1/${row.id}`">
                            {{ row.id }}
                        </NuxtLink>
                        <h1 v-else>{{ row.id }}</h1>
                    </th>
                    <td class="px-3 py-4 border-2 underline text-secondary-color whitespace-nowrap uppercase overflow-hidden max-w-[50px]"
                        v-if="user.clientLink1 === 'READ' || user.clientLink1 === 'WRITE'">
                        <NuxtLink target="_blank" class="cursor-pointer hover:text-orange-200 duration-200"
                            :to="`/spreadsheets/order/${row.clientLink1}`">
                            {{ row.clientLink1 }}
                        </NuxtLink>
                    </td>
                    <td v-if="user.cell1 === 'READ' || user.cell1 === 'WRITE'" class="border-2">
                        {{ row.cell }}
                    </td>
                    <td v-if="user.fromName1 === 'READ' || user.fromName1 === 'WRITE'" class="py-4 border-2">
                        {{ row.fromName }}
                    </td>
                    <td class="underline border-2 text-secondary-color whitespace-nowrap overflow-hidden max-w-[30px]"
                        v-if="user.productLink1 === 'READ' || user.productLink1 === 'WRITE'">
                        <a :href="row.productLink" target="_blank" class="hover:text-orange-200 duration-200">{{
                            row.productLink
                        }}</a>
                    </td>
                    <td class="border-2 overflow-hidden max-h-[40px]"
                        v-if="user.productName1 === 'READ' || user.productName1 === 'WRITE'">
                        {{ row.productName }}
                    </td>
                    <td class="border-2" v-if="user.notation1 === 'READ' || user.notation1 === 'WRITE'">
                        {{ row.notation ? row.notation : "Пусто" }}
                    </td>
                    <td class="border-2" v-if="user.priceSite === 'READ' || user.priceSite === 'WRITE'">
                        {{ row.priceSite }}
                    </td>
                    <td class="border-2" v-if="user.prepayment1 === 'READ' || user.prepayment1 === 'WRITE'">
                        {{ row.prepayment }}
                    </td>
                    <td class="border-2" v-if="user.percentClient1 === 'READ' || user.percentClient1 === 'WRITE'">
                        {{ row.percentClient }}
                    </td>
                    <td class="border-2" v-if="user.deliveredKGT1 === 'READ' || user.deliveredKGT1 === 'WRITE'">
                        {{ row.deliveredKGT }}
                    </td>
                    <td class="border-2" v-if="user.amountFromClient1 === 'READ' || user.amountFromClient1 === 'WRITE'">
                        {{ Math.ceil(row.amountFromClient1 / 10) * 10 }}
                    </td>
                    <td class="px-2 py-4 border-2" v-if="user.dispatchPVZ1 === 'READ' || user.dispatchPVZ1 === 'WRITE'">
                        {{ row.dispatchPVZ }}
                    </td>
                    <td class="px-2 py-4 border-2" v-if="user.orderPVZ1 === 'READ' || user.orderPVZ1 === 'WRITE'">
                        {{ row.orderPVZ }}
                    </td>
                    <td class="px-2 py-4 border-2" v-if="user.orderAccount === 'READ' || user.orderAccount === 'WRITE'">
                        {{ row.orderAccount }}
                    </td>
                    <td class="border-2" v-if="user.deliveredSC1 === 'READ' || user.deliveredSC1 === 'WRITE'">
                        <h1 class="font-bold text-green-500">
                            {{ row.deliveredSC ? storeUsers.getNormalizedDate(row.deliveredSC) : "" }}
                        </h1>
                    </td>
                    <td class="border-2" v-if="user.deliveredPVZ1 === 'READ' || user.deliveredPVZ1 === 'WRITE'">
                        <h1 class="font-bold text-green-500">
                            {{ row.deliveredPVZ ? storeUsers.getNormalizedDate(row.deliveredPVZ) : "" }}
                        </h1>
                    </td>
                    <td class="border-2" v-if="user.issued1 === 'READ' || user.issued1 === 'WRITE'">
                        <h1 class="font-bold text-green-500">
                            {{ row.issued ? storeUsers.getNormalizedDate(row.issued) : "" }}
                        </h1>
                    </td>
                    <td class="px-6 py-4 border-2" v-if="user.additionally1 === 'READ' || user.additionally1 === 'WRITE'">
                        {{ row.additionally ? row.additionally : "Пусто" }}
                    </td>

                    <td class="px-1 py-4 border-2" v-if="(user.profit1 === 'READ' || user.profit1 === 'WRITE') &&
                        (row.additionally !== 'Отказ клиент' && row.additionally !== 'Отказ брак') && !row.prepayment">
                        {{ row.percentClient !== 0 ? Math.ceil(row.amountFromClient1 / 10) * 10 - row.priceSite +
                            row.deliveredKGT : row.deliveredKGT }}
                    </td>

                    <td class="px-1 py-4 border-2" v-if="(user.profit1 === 'READ' || user.profit1 === 'WRITE') &&
                        (row.additionally !== 'Отказ клиент' && row.additionally !== 'Отказ брак') && row.prepayment">
                        {{ row.percentClient !== 0 ? Math.ceil((row.priceSite * row.percentClient / 100) + row.deliveredKGT)
                            :
                            row.deliveredKGT }}
                    </td>


                    <td class="px-1 py-4 border-2" v-if="(user.profit1 === 'READ' || user.profit1 === 'WRITE') &&
                        (row.additionally === 'Отказ клиент' || row.additionally === 'Отказ брак')">
                        {{ row.profit1 }}
                    </td>

                    <td class="px-6 border-2" v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'">
                        {{ storeUsers.getNormalizedDate(row.created_at) }}
                    </td>
                    <td class="px-6 border-2" v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'">
                        {{ storeUsers.getNormalizedDate(row.updated_at) }}
                    </td>
                    <td class="px-6 border-2" v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'">
                        {{ storeUsers.getNormalizedDate(row.deleted) }}
                    </td>
                    <td class="px-6 border-2" v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'">
                        {{ row.createdUser }}
                    </td>
                    <td class="px-6 border-2" v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'">
                        {{ row.updatedUser }}
                    </td>

                    <td class="px-6 py-4 border-2"
                        v-if="user.dataOurRansom === 'WRITE' && user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'">
                        <Icon @click="deleteRow(row.id)" class="text-red-600 cursor-pointer hover:text-red-300 duration-200"
                            name="material-symbols:playlist-remove-rounded" size="32" />
                    </td>
                    <div id="right"></div>
                </tr>
            </tbody>
        </table>
        <div v-else class="flex items-center flex-col justify-center mt-10 text-2xl">
            <Icon name="ion:ios-close-empty" size="100" class="text-red-500" />
            <h1>Извините, записи по данным фильтрам не были найдены!</h1>
            <h1>Попробуйте поставить другие фильтры или очистить их</h1>
        </div>
        <div id="down"></div>
    </div>
</template>

<style scoped>
.hidden-row {
    display: none !important;
}
</style>
