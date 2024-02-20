<script setup lang="ts">
import { read, utils, writeFile } from "xlsx";

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

function openModal(row: IClientRansom) {
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
  rows: { type: Array as PropType<IClientRansom[]> },
  pvzLink: { type: String }
});

async function exportToExcel() {
  perPage.value = await totalRows.value;
  await updateCurrentPageData();

  let table = await document.querySelector("#theTable");

  let wb = await utils.table_to_book(table);

  await writeFile(wb, "выкуп_клиента.xlsx");

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
const totalRows = computed(() => Math.ceil(props.rows?.length || 0));

let returnRows = ref<Array<IClientRansom>>()

function updateCurrentPageData() {
  const startIndex = (currentPage.value - 1) * perPage.value
  const endIndex = startIndex + perPage.value

  if (showDeletedRows.value) {
    returnRows.value = props.rows?.slice(startIndex, endIndex);
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

  updateCurrentPageData()

  if (props.user.role === 'SORTIROVKA') {
    perPage.value = totalRows.value;
    updateCurrentPageData();
  }

  await storeRansom.getSumOfRejection()
})

const router = useRouter()

let showOthersVariants = ref(false)

</script>
<template>
  <div class="flex items-center justify-between max-lg:block mt-10">
    <div>
      <div class="flex items-center max-sm:flex-col max-sm:items-start gap-5 mb-5">
        <h1 class="text-xl" v-if="user.role !== 'PVZ'">Товаров в работе: <span class="text-secondary-color font-bold">{{
          totalRows }}</span> </h1>
        <h1 class="text-xl" v-if="user.role === 'PVZ'">Товаров к выдаче: <span class="text-secondary-color font-bold">{{
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
      <Icon class="duration-200 hover:text-secondary-color cursor-pointer" size="40" name="material-symbols:sheets-add-on"
        @click="exportToExcel" />
    </div>
  </div>

  <div class="fixed top-24 z-40 left-1/2 translate-x-[-50%] translate-y-[-50%]" v-if="getAllSum > 0">
    <h1 class="text-base backdrop-blur-xl p-2 rounded-xl border-2 text-secondary-color font-bold">К оплате: {{
      getAllSum }} </h1>
  </div>

  <div class="fixed z-40 flex flex-col gap-3 left-1/2 translate-x-[-50%] translate-y-[-50%]"
    v-if="user.dataClientRansom === 'WRITE' && checkedRows.length > 0 && user.role !== 'PVZ'">
    <UIActionButton
      v-if="user.dataClientRansom === 'WRITE' && user.role === 'ADMIN' || user.role === 'ADMINISTRATOR' && checkedRows.length === 1"
      @click="createCopyRow">Скопировать запись</UIActionButton>
    <UIActionButton v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR' && user.dataOurRansom === 'WRITE'"
      @click="deleteSelectedRows">Удалить
      выделенные записи</UIActionButton>
    <UIActionButton v-if="user.deliveredSC1 === 'WRITE' && showButtonSC" @click="updateDeliveryRows('SC')">Доставить на сц
    </UIActionButton>
    <UIActionButton v-if="user.deliveredPVZ1 === 'WRITE' && showButtonPVZ" @click="updateDeliveryRows('PVZ')">Доставить на
      пвз
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

  <div class="fixed z-40 flex flex-col gap-3 top-44 left-1/2 translate-x-[-50%] translate-y-[-50%]"
    v-if="user.dataClientRansom === 'WRITE' && checkedRows.length > 0 && user.role === 'PVZ'">
    <UIActionButton v-if="user.deliveredPVZ2 === 'WRITE' && showButtonPVZ" @click="updateDeliveryRows('PVZ')">Доставить
      на пвз
    </UIActionButton>
    <UIActionButton v-if="user.issued2 === 'WRITE' && showButton" @click="showOthersVariants = !showOthersVariants">Выдать
      клиенту
    </UIActionButton>
    <div v-if="showOthersVariants" class="flex flex-col gap-3">
      <UIActionButton2 v-if="user.additionally2 === 'WRITE'" @click="updateDeliveryRows('additionally3')">Оплата наличными
      </UIActionButton2>
      <UIActionButton2 v-if="user.additionally2 === 'WRITE'" @click="updateDeliveryRows('additionally')">Оплачено онлайн
      </UIActionButton2>
      <UIActionButton2 v-if="user.additionally2 === 'WRITE'" @click="updateDeliveryRows('additionally1')">Отказ клиент
      </UIActionButton2>
      <UIActionButton2 v-if="user.additionally2 === 'WRITE'" @click="updateDeliveryRows('additionally2')">Отказ брак
      </UIActionButton2>
    </div>
  </div>

  <div class="relative max-h-[610px] mt-5 mb-10 mr-5">
    <div id="up"></div>
    <table id="theTable" class="w-full border-x-2 border-gray-50 text-sm text-left rtl:text-right text-gray-500"
      v-if="totalRows > 0">
      <thead class="text-xs sticky top-0 z-30 text-gray-700 uppercase text-center bg-gray-50">
        <tr>
          <th scope="col" class="border-2" v-if="user.dataClientRansom === 'WRITE'">
            Выделение
          </th>
          <th scope="col" class="exclude-row border-2 text-[10px]"
            v-if="user.dataClientRansom === 'WRITE' && (user.role === 'ADMIN' || user.role === 'ADMINISTRATOR')">
            изменение
          </th>
          <th scope="col" class="border-2 px-3">id</th>
          <th scope="col" class="border-2" v-if="user.clientLink2 === 'READ' || user.clientLink2 === 'WRITE'">
            ссылка для клиента
          </th>
          <th scope="col" class="border-2" v-if="user.cell2 === 'READ' || user.cell2 === 'WRITE'">
            ячейка
          </th>
          <th scope="col" class="border-2" v-if="user.fromName2 === 'READ' || user.fromName2 === 'WRITE'">
            телефон
          </th>
          <th scope="col" class="border-2" v-if="user.productLink2 === 'READ' || user.productLink2 === 'WRITE'">
            маркетплейс
          </th>
          <th scope="col" class="border-2" v-if="user.productName2 === 'READ' || user.productName2 === 'WRITE'">
            количество товаров
          </th>
          <th scope="col" class="border-2" v-if="user.priceProgram === 'READ' || user.priceProgram === 'WRITE'">
            стоимость выкупа товара
          </th>
          <th scope="col" class="border-2" v-if="user.prepayment2 === 'READ' || user.prepayment2 === 'WRITE'">
            предоплата
          </th>
          <th scope="col" class="border-2" v-if="user.percentClient2 === 'READ' || user.percentClient2 === 'WRITE'">
            процент с клиента (%)
          </th>
          <th scope="col" class="border-2" v-if="user.amountFromClient2 === 'READ' || user.amountFromClient2 === 'WRITE'">
            сумма с клиента
          </th>
          <th scope="col" class="border-2" v-if="user.dispatchPVZ2 === 'READ' || user.dispatchPVZ2 === 'WRITE'">
            отправка в пвз
          </th>
          <th scope="col" class="border-2" v-if="user.orderPVZ2 === 'READ' || user.orderPVZ2 === 'WRITE'">
            заказано на сц
          </th>
          <th scope="col" class="border-2" v-if="user.deliveredSC2 === 'READ' || user.deliveredSC2 === 'WRITE'">
            доставлено на сц
          </th>
          <th scope="col" class="border-2" v-if="user.deliveredPVZ2 === 'READ' || user.deliveredPVZ2 === 'WRITE'">
            доставлено на пвз
          </th>
          <th scope="col" class="border-2" v-if="user.issued2 === 'READ' || user.issued2 === 'WRITE'">
            выдан клиенту
          </th>
          <th scope="col" class="border-2" v-if="user.additionally2 === 'READ' || user.additionally2 === 'WRITE'">
            дополнительно
          </th>
          <th scope="col" class="border-2" v-if="user.profit2 === 'READ' || user.profit2 === 'WRITE'">
            прибыль (доход)
          </th>
          <th scope="col" class="border-2" v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'">создан (время)
          </th>
          <th scope="col" class="border-2" v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'">изменен (время)
          </th>
          <th scope="col" class="border-2" v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'">удален (время)
          </th>
          <th scope="col" class="border-2" v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'">создан</th>
          <th scope="col" class="border-2" v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'">изменен</th>
          <th scope="col" class="exclude-row border-2"
            v-if="user.dataClientRansom === 'WRITE' && (user.role === 'ADMIN' || user.role === 'ADMINISTRATOR')">
            удаление
          </th>
        </tr>
      </thead>
      <tbody>
        <tr :class="{ 'bg-orange-100': isChecked(row.id) }" class="border-b text-center text-sm"
          v-for="row in returnRows">
          <td v-if="user.dataClientRansom === 'WRITE'" class="border-2 text-secondary-color">
            <input type="checkbox" :value="row.id" :checked="isChecked(row.id)" @change="handleCheckboxChange(row)" />
          </td>
          <td class="border-2"
            v-if="user.dataClientRansom === 'WRITE' && (user.role === 'ADMIN' || user.role === 'ADMINISTRATOR')">
            <Icon @click="openModal(row)" class="text-green-600 cursor-pointer hover:text-green-300 duration-200"
              name="material-symbols:edit" size="32" />
          </td>
          <th scope="row" class="border-2 font-medium underline text-secondary-color whitespace-nowrap">
            <NuxtLink class="cursor-pointer hover:text-orange-200 duration-200" :to="`/spreadsheets/record/2/${row.id}`">
              {{ row.id }}
            </NuxtLink>
          </th>
          <td
            class="px-3 py-4 border-2 underline text-secondary-color whitespace-nowrap uppercase overflow-hidden max-w-[50px]"
            v-if="user.clientLink2 === 'READ' || user.clientLink2 === 'WRITE'">
            <NuxtLink target="_blank" class="cursor-pointer hover:text-orange-200 duration-200"
              :to="`/spreadsheets/order/${row.clientLink2}`">
              {{ row.clientLink2 }}
            </NuxtLink>
          </td>
          <td v-if="user.cell2 === 'READ' || user.cell2 === 'WRITE'" class="border-2">
            {{ row.cell }}
          </td>
          <td v-if="user.fromName2 === 'READ' || user.fromName2 === 'WRITE'" class="py-4 border-2">
            {{ row.fromName }}
          </td>
          <td class="border-2 whitespace-nowrap overflow-hidden max-w-[30px]"
            v-if="user.productLink2 === 'READ' || user.productLink2 === 'WRITE'">
            {{ row.productLink }}
          </td>
          <td class="border-2" v-if="user.productName2 === 'READ' || user.productName2 === 'WRITE'">
            {{ row.productName }}
          </td>
          <td class="border-2" v-if="user.priceProgram === 'READ' || user.priceProgram === 'WRITE'">
            {{ row.priceProgram }}
          </td>
          <td class="border-2" v-if="user.prepayment2 === 'READ' || user.prepayment2 === 'WRITE'">
            {{ row.prepayment }}
          </td>
          <td class="border-2" v-if="user.percentClient2 === 'READ' || user.percentClient2 === 'WRITE'">
            {{ row.percentClient }}
          </td>
          <td class="border-2" v-if="user.amountFromClient2 === 'READ' || user.amountFromClient2 === 'WRITE'">
            {{ row.amountFromClient2 }}
          </td>
          <td class="border-2" v-if="user.dispatchPVZ2 === 'READ' || user.dispatchPVZ2 === 'WRITE'">
            {{ row.dispatchPVZ }}
          </td>
          <td class="border-2" v-if="user.orderPVZ2 === 'READ' || user.orderPVZ2 === 'WRITE'">
            {{ row.orderPVZ }}
          </td>
          <td class="border-2" v-if="user.deliveredSC2 === 'READ' || user.deliveredSC2 === 'WRITE'">
            <h1 class="font-bold text-green-500">
              {{ row.deliveredSC ? storeUsers.getNormalizedDate(row.deliveredSC) : "" }}
            </h1>
          </td>
          <td class="border-2" v-if="user.deliveredPVZ2 === 'READ' || user.deliveredPVZ2 === 'WRITE'">
            <h1 class="font-bold text-green-500">
              {{ row.deliveredPVZ ? storeUsers.getNormalizedDate(row.deliveredPVZ) : "" }}
            </h1>
          </td>
          <td class="border-2" v-if="user.issued2 === 'READ' || user.issued2 === 'WRITE'">
            <h1 class="font-bold text-green-500">
              {{ row.issued ? storeUsers.getNormalizedDate(row.issued) : "" }}
            </h1>
          </td>
          <td class="border-2" v-if="user.additionally2 === 'READ' || user.additionally2 === 'WRITE'">
            {{ row.additionally ? row.additionally : "Пусто" }}
          </td>

          <td class="border-2" v-if="(user.profit2 === 'READ' || user.profit2 === 'WRITE') &&
            (row.additionally !== 'Отказ клиент' && row.additionally !== 'Отказ брак')">
            {{ row.profit2 }}
          </td>
          <td class="border-2" v-if="(user.profit2 === 'READ' || user.profit2 === 'WRITE') &&
            (row.additionally === 'Отказ клиент' || row.additionally === 'Отказ брак')">
            {{ row.profit2 }}
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
            v-if="user.dataClientRansom === 'WRITE' && user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'">
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
