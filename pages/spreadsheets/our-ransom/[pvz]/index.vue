<script setup lang="ts">
import { useToast } from "vue-toastification";
import Cookies from "js-cookie";

let toast = useToast();

const route = useRoute();
let pvzString = route.params.pvz;

const storeUsers = useUsersStore();
const storeRansom = useRansomStore();
const storePVZ = usePVZStore();
const storeSortingCenters = useSortingCentersStore();
const storeOrderAccounts = useOrderAccountStore();

const router = useRouter();

let isLoading = ref(false);

let user = ref({} as User);

let rows = ref<Array<IOurRansom>>();
let pvz = ref<Array<PVZ>>();
let sortingCenters = ref<Array<SortingCenter>>();
let orderAccounts = ref<Array<OrderAccount>>();

let rowData = ref({} as IOurRansom);

let isOpen = ref(false);

function openModal(row: IOurRansom) {
  isOpen.value = true;
  if (row.id) {
    rowData.value = JSON.parse(JSON.stringify(row));
    rowData.value.deliveredSC = rowData.value.deliveredSC
      ? storeUsers.getISODateTime(rowData.value.deliveredSC)
      : null;
    rowData.value.deliveredPVZ = rowData.value.deliveredPVZ
      ? storeUsers.getISODateTime(rowData.value.deliveredPVZ)
      : null;
    rowData.value.issued = rowData.value.issued
      ? storeUsers.getISODateTime(rowData.value.issued)
      : null;
  } else {
    rowData.value = {} as IOurRansom;
    rowData.value.fromName = "";
  }
}

function closeModal() {
  isOpen.value = false;
  rowData.value = {} as IOurRansom;
}

async function updateDeliveryRow(obj: any) {
  let answer = confirm("Вы точно хотите изменить статус доставки?");
  if (answer) await storeRansom.updateDeliveryStatus(obj.row, obj.flag, "OurRansom", user.value.username);
  filteredRows.value = await storeRansom.getRansomRowsByPVZ(pvzString, "OurRansom");
}

async function updateDeliveryRows(obj: any) {
  let answer = confirm(
    `Вы точно хотите изменить статус доставки? Количество записей: ${obj.idArray.length}`
  );
  if (answer)
    await storeRansom.updateDeliveryRowsStatus(obj.idArray, obj.flag, "OurRansom", user.value.username);
  filteredRows.value = await storeRansom.getRansomRowsByPVZ(pvzString, "OurRansom");
}

async function deleteRow(id: number) {
  let answer = confirm("Вы точно хотите удалить данную строку?");
  if (answer) await storeRansom.deleteRansomRow(id, "OurRansom");
  filteredRows.value = await storeRansom.getRansomRowsByPVZ(pvzString, "OurRansom");
}

async function deleteSelectedRows(idArray: number[]) {
  let answer = confirm(
    `Вы точно хотите удалить данные строки? Количество записей: ${idArray.length}`
  );
  if (answer) await storeRansom.deleteRansomSelectedRows(idArray, "OurRansom");
  filteredRows.value = await storeRansom.getRansomRowsByPVZ(pvzString, "OurRansom");
}

async function updateRow() {
  isLoading.value = true;
  
  await storeRansom.updateRansomRow(rowData.value, user.value.username, "OurRansom");
  filteredRows.value = await storeRansom.getRansomRowsByPVZ(pvzString, "OurRansom");
  closeModal();

  isLoading.value = false;
}

async function createRow() {
  isLoading.value = true;
  
  await storeRansom.createRansomRow(rowData.value, user.value.username, "OurRansom");
  filteredRows.value = await storeRansom.getRansomRowsByPVZ(pvzString, "OurRansom");
  closeModal();

  isLoading.value = false;
}

async function createCopyRow(id: number) {
  await storeRansom.createCopyRow(id, "OurRansom");
  filteredRows.value = await storeRansom.getRansomRowsByPVZ(pvzString, "OurRansom");
}

const filteredRows = ref<Array<IOurRansom>>();
function handleFilteredRows(filteredRowsData: IOurRansom[]) {
  if (user.value.visiblePVZ === "ВСЕ" && user.value.visibleSC === "ВСЕ") {
    filteredRows.value = filteredRowsData;
  } else if (user.value.visiblePVZ === "ВСЕ" && user.value.visibleSC !== "ВСЕ") {
    filteredRows.value = filteredRowsData.filter(
      (row) => row.orderPVZ === user.value.visibleSC && row.deliveredSC !== null
    );
  } else if (user.value.visiblePVZ !== "ВСЕ" && user.value.visibleSC === "ВСЕ") {
    filteredRows.value = filteredRowsData.filter(
      (row) => user.value.PVZ.includes(row.dispatchPVZ) && row.deliveredSC !== null
    );
  } else if (user.value.visiblePVZ !== "ВСЕ" && user.value.visibleSC !== "ВСЕ") {
    filteredRows.value = filteredRowsData.filter(
      (row) =>
        user.value.PVZ.includes(row.dispatchPVZ) &&
        row.orderPVZ === user.value.visibleSC &&
        row.deliveredSC !== null
    );
  }

  if (filteredRows.value) {
    if (user.value.role === "SORTIROVKA") {
      filteredRows.value = filteredRows.value.filter((row) => row.deliveredPVZ === null);
    } else if (user.value.role === "PVZ") {
      let today = new Date().toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
      filteredRows.value = filteredRows.value.filter(
        (row) =>
          row.deliveredSC !== null &&
          (new Date(row.issued).toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          }) === today ||
            row.issued === null)
      );
    }
  }
}

let originallyRows = ref<Array<IOurRansom>>()

onMounted(async () => {
  isLoading.value = true;
  user.value = await storeUsers.getUser();
  rows.value = await storeRansom.getRansomRowsByPVZ(pvzString, "OurRansom")

  if (rows.value) {
    handleFilteredRows(rows.value);
  }

  if (!user.value.PVZ.includes(pvzString)) {
    toast.error("У вас нет прав на просмотр этого ПВЗ!");
    router.push("/spreadsheets/our-ransom");
  } 

  isLoading.value = false;

  originallyRows.value = await storeRansom.getRansomRowsForModal("OurRansom");
  pvz.value = await storePVZ.getPVZ();
  sortingCenters.value = await storeSortingCenters.getSortingCenters();
  orderAccounts.value = await storeOrderAccounts.getOrderAccounts();
});

onBeforeMount(() => {
  if (!token || user.value.dataOurRansom === "NONE") {
    router.push("/auth/login");
  }
});

definePageMeta({
  layout: false,
  name: 'Товары из'
});

const token = Cookies.get("token");
let showAddFields = ref(false);

let isAutoCell = ref(true);
let isAutoFromName = ref(true);
let isAutoPVZ = ref(true);

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getCellFromName() {
  if (rowData.value.fromName.trim().length === 4) {
    let phoneNum = rowData.value.fromName.trim().toString().slice(-4);
    let row = originallyRows.value?.filter((row) => row.fromName ? row.fromName.slice(-4) === phoneNum : '');

    if (row && row.length > 0) {
      if (row.some(r => r.fromName !== row[0].fromName)) {
        toast.warning("Было найдено несколько номеров. Впишите полный номер");
      } else {
        rowData.value.fromName = row[0].fromName;
      }
    }
  }

  if (rowData.value.fromName.trim().length === 12 && isAutoPVZ.value === true) {
    let row = originallyRows.value?.filter((row) => row.fromName === rowData.value.fromName);
    if (row && row.length > 0) {
      if (row.some(r => r.dispatchPVZ !== row[0].dispatchPVZ)) {
        toast.warning("У клиента есть товары на разных ПВЗ! Выберите ПВЗ самостоятельно");
      } else {
        rowData.value.dispatchPVZ = row[0].dispatchPVZ;
      }
    }
  }

  if (rowData.value.fromName.trim().length === 12 && isAutoFromName.value === true) {
    let row = originallyRows.value?.filter((row) => row.fromName === rowData.value.fromName && row.dispatchPVZ === rowData.value.dispatchPVZ && (row.deliveredPVZ === null || row.deliveredSC === null));
    if (row && row.length > 0) {
      rowData.value.cell = row[0].cell;
    }
  }
}

async function changePVZ() {
  if (rowData.value.fromName.trim().length === 12 && isAutoFromName.value === true) {
    let row = originallyRows.value?.filter((row) => row.fromName === rowData.value.fromName && row.dispatchPVZ === rowData.value.dispatchPVZ && (row.deliveredPVZ === null || row.deliveredSC === null));
    if (row && row.length > 0) {
      rowData.value.cell = row[0].cell;
    } else {
      const unoccupiedCellsAndPVZ = await getUnoccupiedCellsAndPVZ();
      const freeCell = unoccupiedCellsAndPVZ.find(cell => cell.dispatchPVZ === rowData.value.dispatchPVZ);
      if (freeCell) {
        rowData.value.cell = freeCell.cell;
      } else {
        toast.warning("Нет свободных ячеек для выбранного ПВЗ");
      }
    }
  }
}

async function getUnoccupiedCellsAndPVZ() {
  const unoccupiedCells = new Map();

  originallyRows.value?.forEach(row => {
    const { cell, issued, dispatchPVZ } = row;
    if (!unoccupiedCells.has(cell)) {
      unoccupiedCells.set(cell, { dispatchPVZ, hasEmptyIssued: issued === null });
    } else {
      const currentInfo = unoccupiedCells.get(cell);
      currentInfo.hasEmptyIssued = currentInfo.hasEmptyIssued || issued === null;
      unoccupiedCells.set(cell, currentInfo);
    }
  });

  const result: any[] = [];
  unoccupiedCells.forEach((value, key) => {
    if (!value.hasEmptyIssued) {
      result.push({ cell: key, dispatchPVZ: value.dispatchPVZ });
    }
  });

  return result;
}

async function getFromNameFromCell() {
  await sleep(3000)
  if (rowData.value.cell.trim() && isAutoCell.value === true) {
    let rowFromName = originallyRows.value?.filter((row) => row.cell === rowData.value.cell);
    if (rowFromName) {
      rowData.value.fromName = rowFromName[0].fromName;
    }
  }
}

</script>

<template>
  <Head>
    <Title>Наш выкуп</Title>
  </Head>
  <div>
    <div v-if="user.role === 'ADMIN'">
      <NuxtLayout name="admin">
        <div v-if="!isLoading" class="mt-3">

          <SpreadsheetsOurRansomTable @update-delivery-row="updateDeliveryRow" :rows="filteredRows" :user="user"
            @delete-row="deleteRow" @open-modal="openModal" @delete-selected-rows="deleteSelectedRows"
            @update-delivery-rows="updateDeliveryRows" @create-copy-row="createCopyRow" :pvz-link="pvzString" />

          <UIModal v-show="isOpen" @close-modal="closeModal">
            <template v-slot:header>
              <div class="custom-header" v-if="rowData.id">
                Изменение строки с ID - <b> {{ rowData.id }}</b>
              </div>
              <div class="custom-header" v-else>Создание новой строки</div>
            </template>
            <div class="text-black">

              <div class="grid grid-cols-2 mb-5" v-if="user.fromName1 === 'READ' || user.fromName1 === 'WRITE'">
                <label for="fromName" class="max-sm:text-sm">Телефон <sup>*</sup></label>
                <div>
                  <input :disabled="user.fromName1 === 'READ'"
                    class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="rowData.fromName" @input="getCellFromName" type="text" />
                  <div class="flex gap-3 items-center justify-center mt-1">
                    <h1 class="max-sm:text-sm">АВТО</h1>
                    <input type="checkbox" v-model="isAutoFromName" />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.dispatchPVZ1 === 'READ' || user.dispatchPVZ1 === 'WRITE'">
                <label for="dispatchPVZ1" class="max-sm:text-sm">Отправка в ПВЗ</label>
                <div>
                  <select
                    class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="rowData.dispatchPVZ" :disabled="user.dispatchPVZ1 === 'READ'" @change="changePVZ">
                    <option v-for="pvzData in pvz" :value="pvzData.name">
                      {{ pvzData.name }}
                    </option>
                  </select>
                  <div class="flex gap-3 items-center justify-center mt-1">
                    <h1 class="max-sm:text-sm">АВТО</h1>
                    <input type="checkbox" v-model="isAutoPVZ" />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.cell1 === 'READ' || user.cell1 === 'WRITE'">
                <label for="cell" class="max-sm:text-sm">Ячейка</label>
                <div>
                  <input :disabled="user.cell1 === 'READ'"
                    class="bg-transparent w-full rounded-md border-2 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="rowData.cell" @input="getFromNameFromCell" type="text" />
                  <div class="flex gap-3 items-center justify-center mt-1">
                    <h1 class="max-sm:text-sm">АВТО</h1>
                    <input type="checkbox" v-model="isAutoCell" />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.productLink1 === 'READ' || user.productLink1 === 'WRITE'">
                <label for="productLink1" class="max-sm:text-sm">Товар (ссылка)</label>
                <input :disabled="user.productLink1 === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.productLink" type="text" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.productName1 === 'READ' || user.productName1 === 'WRITE'">
                <label for="productName1" class="max-sm:text-sm">Название товара</label>
                <input :disabled="user.productName1 === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.productName" type="text" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.notation1 === 'READ' || user.notation1 === 'WRITE'">
                <label for="notation1" class="max-sm:text-sm">Примечание</label>
                <input :disabled="user.notation1 === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.notation" placeholder="По умолчанию: Пусто" type="text" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.priceSite === 'READ' || user.priceSite === 'WRITE'">
                <label for="priceSite" class="max-sm:text-sm">Стоимость сайт</label>
                <input :disabled="user.priceSite === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.priceSite" type="number" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.prepayment1 === 'READ' || user.prepayment1 === 'WRITE'">
                <label for="prepayment1" class="max-sm:text-sm">Предоплата</label>
                <input :disabled="user.prepayment1 === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.prepayment" type="number" placeholder="По умолчанию: 0" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.percentClient1 === 'READ' || user.percentClient1 === 'WRITE'">
                <label for="percentClient1" class="max-sm:text-sm">Процент с клиента</label>
                <input :disabled="user.percentClient1 === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.percentClient" placeholder="По умолчанию: 10" type="number" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.orderPVZ1 === 'READ' || user.orderPVZ1 === 'WRITE'">
                <label for="orderPVZ1" class="max-sm:text-sm">Заказано на СЦ</label>
                <select class="py-1 px-2 border-2 bg-transparent rounded-lg text-base disabled:text-gray-400"
                  v-model="rowData.orderPVZ" :disabled="user.orderPVZ1 === 'READ'">
                  <option v-for="sortingCenter in sortingCenters" :value="sortingCenter.name">
                    {{ sortingCenter.name }}
                  </option>
                </select>
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.orderAccount === 'READ' || user.orderAccount === 'WRITE'">
                <label for="orderAccount" class="max-sm:text-sm">Аккаунт заказа</label>
                <select :disabled="user.orderAccount === 'READ'"
                  class="py-1 px-2 border-2 bg-transparent rounded-lg text-base disabled:text-gray-400"
                  v-model="rowData.orderAccount">
                  <option v-for="orderAccount in orderAccounts" :value="orderAccount.name">
                    {{ orderAccount.name }}
                  </option>
                </select>
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="!rowData.id">
                <label for="quantity" class="max-sm:text-sm">Количество строк</label>
                <input type="number"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                  min="1" v-model="rowData.quantity" />
              </div>

              <h1 @click="showAddFields = !showAddFields"
                class="cursor-pointer hover:opacity-50 text-secondary-color font-bold duration-200 mb-5">
                Показать ещё настройки
              </h1>
              <div v-if="showAddFields">
                <div class="grid grid-cols-2 mb-5" v-if="user.deliveredSC1 === 'READ' || user.deliveredSC1 === 'WRITE'">
                  <label for="deliveredSC1" class="max-sm:text-sm">Доставлено на СЦ</label>
                  <input :disabled="user.deliveredSC1 === 'READ'"
                    class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="rowData.deliveredSC" type="datetime-local" />
                </div>

                <div class="grid grid-cols-2 mb-5" v-if="user.deliveredPVZ1 === 'READ' || user.deliveredPVZ1 === 'WRITE'">
                  <label for="deliveredPVZ1" class="max-sm:text-sm">Доставлено на ПВЗ</label>
                  <input :disabled="user.deliveredPVZ1 === 'READ'"
                    class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="rowData.deliveredPVZ" type="datetime-local" />
                </div>

                <div class="grid grid-cols-2 mb-5" v-if="user.issued1 === 'READ' || user.issued1 === 'WRITE'">
                  <label for="issued1" class="max-sm:text-sm">Выдан клиенту</label>
                  <input :disabled="user.issued1 === 'READ'"
                    class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="rowData.issued" type="datetime-local" />
                </div>

                <div class="grid grid-cols-2 mb-5" v-if="user.additionally1 === 'READ' || user.additionally1 === 'WRITE'">
                  <label for="additionally1" class="max-sm:text-sm">Дополнительно</label>
                  <select class="py-1 px-2 border-2 bg-transparent rounded-lg text-base disabled:text-gray-400"
                    v-model="rowData.additionally" :disabled="user.additionally1 === 'READ'">
                    <option value="">Отменить</option>
                    <option value="Оплачено онлайн">Оплачено онлайн</option>
                    <option value="Отказ клиент">Отказ клиент</option>
                    <option value="Отказ брак">Отказ брак</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-center gap-3 mt-10" v-if="rowData.id">
              <UIMainButton @click="updateRow">Сохранить </UIMainButton>
              <UIMainButton @click="closeModal">Отменить </UIMainButton>
            </div>
            <div class="flex items-center justify-center gap-3 mt-10" v-else>
              <UIMainButton :disabled="rowData.fromName === '' || rowData.fromName === null" @click="createRow">Создать
              </UIMainButton>
              <UIMainButton @click="closeModal">Отменить </UIMainButton>
            </div>
          </UIModal>
        </div>
        <div v-else>
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
    <div v-else>
      <NuxtLayout name="user">
        <div v-if="!isLoading" class="mt-3">

          <SpreadsheetsOurRansomTable @update-delivery-row="updateDeliveryRow" :rows="filteredRows" :user="user"
            @delete-row="deleteRow" @open-modal="openModal" @delete-selected-rows="deleteSelectedRows"
            @update-delivery-rows="updateDeliveryRows" @create-copy-row="createCopyRow" :pvz-link="pvzString" />

          <UIModal v-show="isOpen" @close-modal="closeModal">
            <template v-slot:header>
              <div class="custom-header" v-if="rowData.id">
                Изменение строки с ID - <b> {{ rowData.id }}</b>
              </div>
              <div class="custom-header" v-else>Создание новой строки</div>
            </template>
            <div class="text-black">

              <div class="grid grid-cols-2 mb-5" v-if="user.fromName1 === 'READ' || user.fromName1 === 'WRITE'">
                <label for="fromName" class="max-sm:text-sm">Телефон <sup>*</sup></label>
                <div>
                  <input :disabled="user.fromName1 === 'READ'"
                    class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="rowData.fromName" @input="getCellFromName" type="text" />
                  <div class="flex gap-3 items-center justify-center mt-1">
                    <h1 class="max-sm:text-sm">АВТО</h1>
                    <input type="checkbox" v-model="isAutoFromName" />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.dispatchPVZ1 === 'READ' || user.dispatchPVZ1 === 'WRITE'">
                <label for="dispatchPVZ1" class="max-sm:text-sm">Отправка в ПВЗ</label>
                <div>
                  <select
                    class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="rowData.dispatchPVZ" :disabled="user.dispatchPVZ1 === 'READ'" @change="changePVZ">
                    <option v-for="pvzData in pvz" :value="pvzData.name">
                      {{ pvzData.name }}
                    </option>
                  </select>
                  <div class="flex gap-3 items-center justify-center mt-1">
                    <h1 class="max-sm:text-sm">АВТО</h1>
                    <input type="checkbox" v-model="isAutoPVZ" />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.cell1 === 'READ' || user.cell1 === 'WRITE'">
                <label for="cell" class="max-sm:text-sm">Ячейка</label>
                <div>
                  <input :disabled="user.cell1 === 'READ'"
                    class="bg-transparent w-full rounded-md border-2 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="rowData.cell" @input="getFromNameFromCell" type="text" />
                  <div class="flex gap-3 items-center justify-center mt-1">
                    <h1 class="max-sm:text-sm">АВТО</h1>
                    <input type="checkbox" v-model="isAutoCell" />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.productLink1 === 'READ' || user.productLink1 === 'WRITE'">
                <label for="productLink1" class="max-sm:text-sm">Товар (ссылка)</label>
                <input :disabled="user.productLink1 === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.productLink" type="text" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.productName1 === 'READ' || user.productName1 === 'WRITE'">
                <label for="productName1" class="max-sm:text-sm">Название товара</label>
                <input :disabled="user.productName1 === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.productName" type="text" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.notation1 === 'READ' || user.notation1 === 'WRITE'">
                <label for="notation1" class="max-sm:text-sm">Примечание</label>
                <input :disabled="user.notation1 === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.notation" placeholder="По умолчанию: Пусто" type="text" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.priceSite === 'READ' || user.priceSite === 'WRITE'">
                <label for="priceSite" class="max-sm:text-sm">Стоимость сайт</label>
                <input :disabled="user.priceSite === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.priceSite" type="number" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.prepayment1 === 'READ' || user.prepayment1 === 'WRITE'">
                <label for="prepayment1" class="max-sm:text-sm">Предоплата</label>
                <input :disabled="user.prepayment1 === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.prepayment" type="number" placeholder="По умолчанию: 0" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.percentClient1 === 'READ' || user.percentClient1 === 'WRITE'">
                <label for="percentClient1" class="max-sm:text-sm">Процент с клиента</label>
                <input :disabled="user.percentClient1 === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.percentClient" placeholder="По умолчанию: 10" type="number" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.orderPVZ1 === 'READ' || user.orderPVZ1 === 'WRITE'">
                <label for="orderPVZ1" class="max-sm:text-sm">Заказано на СЦ</label>
                <select class="py-1 px-2 border-2 bg-transparent rounded-lg text-base disabled:text-gray-400"
                  v-model="rowData.orderPVZ" :disabled="user.orderPVZ1 === 'READ'">
                  <option v-for="sortingCenter in sortingCenters" :value="sortingCenter.name">
                    {{ sortingCenter.name }}
                  </option>
                </select>
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.orderAccount === 'READ' || user.orderAccount === 'WRITE'">
                <label for="orderAccount" class="max-sm:text-sm">Аккаунт заказа</label>
                <select :disabled="user.orderAccount === 'READ'"
                  class="py-1 px-2 border-2 bg-transparent rounded-lg text-base disabled:text-gray-400"
                  v-model="rowData.orderAccount">
                  <option v-for="orderAccount in orderAccounts" :value="orderAccount.name">
                    {{ orderAccount.name }}
                  </option>
                </select>
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="!rowData.id">
                <label for="quantity" class="max-sm:text-sm">Количество строк</label>
                <input type="number"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                  min="1" v-model="rowData.quantity" />
              </div>

              <h1 @click="showAddFields = !showAddFields"
                class="cursor-pointer hover:opacity-50 text-secondary-color font-bold duration-200 mb-5">
                Показать ещё настройки
              </h1>
              <div v-if="showAddFields">
                <div class="grid grid-cols-2 mb-5" v-if="user.deliveredSC1 === 'READ' || user.deliveredSC1 === 'WRITE'">
                  <label for="deliveredSC1" class="max-sm:text-sm">Доставлено на СЦ</label>
                  <input :disabled="user.deliveredSC1 === 'READ'"
                    class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="rowData.deliveredSC" type="datetime-local" />
                </div>

                <div class="grid grid-cols-2 mb-5" v-if="user.deliveredPVZ1 === 'READ' || user.deliveredPVZ1 === 'WRITE'">
                  <label for="deliveredPVZ1" class="max-sm:text-sm">Доставлено на ПВЗ</label>
                  <input :disabled="user.deliveredPVZ1 === 'READ'"
                    class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="rowData.deliveredPVZ" type="datetime-local" />
                </div>

                <div class="grid grid-cols-2 mb-5" v-if="user.issued1 === 'READ' || user.issued1 === 'WRITE'">
                  <label for="issued1" class="max-sm:text-sm">Выдан клиенту</label>
                  <input :disabled="user.issued1 === 'READ'"
                    class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="rowData.issued" type="datetime-local" />
                </div>

                <div class="grid grid-cols-2 mb-5" v-if="user.additionally1 === 'READ' || user.additionally1 === 'WRITE'">
                  <label for="additionally1" class="max-sm:text-sm">Дополнительно</label>
                  <select class="py-1 px-2 border-2 bg-transparent rounded-lg text-base disabled:text-gray-400"
                    v-model="rowData.additionally" :disabled="user.additionally1 === 'READ'">
                    <option value="">Отменить</option>
                    <option value="Оплачено онлайн">Оплачено онлайн</option>
                    <option value="Отказ клиент">Отказ клиент</option>
                    <option value="Отказ брак">Отказ брак</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-center gap-3 mt-10" v-if="rowData.id">
              <UIMainButton @click="updateRow">Сохранить </UIMainButton>
              <UIMainButton @click="closeModal">Отменить </UIMainButton>
            </div>
            <div class="flex items-center justify-center gap-3 mt-10" v-else>
              <UIMainButton :disabled="rowData.fromName === '' || rowData.fromName === null" @click="createRow">Создать
              </UIMainButton>
              <UIMainButton @click="closeModal">Отменить </UIMainButton>
            </div>
          </UIModal>
        </div>
        <div v-else>
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
  </div>
</template>
