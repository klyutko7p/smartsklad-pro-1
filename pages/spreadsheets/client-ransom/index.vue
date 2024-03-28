<script setup lang="ts">
import Cookies from "js-cookie";

const storeUsers = useUsersStore();
const storeRansom = useRansomStore();
const storePVZ = usePVZStore();
const storeSortingCenters = useSortingCentersStore();
const storeMarketplaces = useMarketplacesStore();

const router = useRouter();

let isLoading = ref(false);

let user = ref({} as User);

let rows = ref<Array<IClientRansom>>();
let pvz = ref<Array<PVZ>>();
let sortingCenters = ref<Array<SortingCenter>>();
let marketplaces = ref<Array<Marketplace>>();

let rowData = ref({} as IClientRansom);

let isOpen = ref(false);

function openModal(row: IClientRansom) {
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
    rowData.value = {} as IClientRansom;
    rowData.value.fromName = ''
  }
}

function closeModal() {
  isOpen.value = false;
  rowData.value = {} as IClientRansom;
}

async function updateDeliveryRow(obj: any) {
  let answer = confirm("Вы точно хотите изменить статус доставки?");
  if (answer) await storeRansom.updateDeliveryStatus(obj.row, obj.flag, 'ClientRansom', user.value.username);
  filteredRows.value = await storeRansom.getRansomRows("ClientRansom");
}

async function updateDeliveryRows(obj: any) {
  let answer = confirm(`Вы точно хотите изменить статус доставки? Количество записей: ${obj.idArray.length}`);
  if (answer) await storeRansom.updateDeliveryRowsStatus(obj.idArray, obj.flag, 'ClientRansom', user.value.username);
  filteredRows.value = await storeRansom.getRansomRows("ClientRansom");
}

async function deleteRow(id: number) {
  let answer = confirm("Вы точно хотите удалить данную строку?");
  if (answer) await storeRansom.deleteRansomRow(id, 'ClientRansom');
  filteredRows.value = await storeRansom.getRansomRows("ClientRansom");
}

async function deleteSelectedRows(idArray: number[]) {
  let answer = confirm(`Вы точно хотите удалить данные строки? Количество записей: ${idArray.length}`);
  if (answer) await storeRansom.deleteRansomSelectedRows(idArray, 'ClientRansom');
  filteredRows.value = await storeRansom.getRansomRows("ClientRansom");
}

async function updateRow() {
  await storeRansom.updateRansomRow(rowData.value, user.value.username, 'ClientRansom');
  await closeModal();
  filteredRows.value = await storeRansom.getRansomRows("ClientRansom");
}

async function createRow() {
  await storeRansom.createRansomRow(rowData.value, user.value.username, 'ClientRansom');
  await closeModal();
  filteredRows.value = await storeRansom.getRansomRows("ClientRansom");
}

async function createCopyRow(id: number) {
  await storeRansom.createCopyRow(id, 'ClientRansom');
  filteredRows.value = await storeRansom.getRansomRows("ClientRansom");
}

async function deleteIssuedRows() {
  isLoading.value = true;
  await storeRansom.deleteIssuedRows("ClientRansom");
  filteredRows.value = await storeRansom.getRansomRows("ClientRansom");
  rows.value = await storeRansom.getRansomRows("ClientRansom");
  isLoading.value = false;
}

function deleteIssuedRowsTimer() {
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  if (currentHour === 22 && currentMinute >= 0 || currentHour === 23 && currentMinute <= 59) {
    deleteIssuedRows();
  }
}


const filteredRows = ref<Array<IClientRansom>>();
function handleFilteredRows(filteredRowsData: IClientRansom[]) {
  if (user.value.visiblePVZ === 'ВСЕ' && user.value.visibleSC === 'ВСЕ') {
    filteredRows.value = filteredRowsData;
  } else if (user.value.visiblePVZ === 'ВСЕ' && user.value.visibleSC !== 'ВСЕ') {
    filteredRows.value = filteredRowsData.filter((row) => row.orderPVZ === user.value.visibleSC && row.deliveredSC !== null);
  } else if (user.value.visiblePVZ !== "ВСЕ" && user.value.visibleSC === "ВСЕ") {
    filteredRows.value = filteredRowsData.filter(
      (row) => user.value.visiblePVZ.includes(row.dispatchPVZ) && row.deliveredSC !== null
    );
  } else if (user.value.visiblePVZ !== "ВСЕ" && user.value.visibleSC !== "ВСЕ") {
    filteredRows.value = filteredRowsData.filter(
      (row) =>
        user.value.visiblePVZ.includes(row.dispatchPVZ) &&
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
          }) === today || row.issued === null)
      );
    }
  }
}


onMounted(async () => {
  isLoading.value = true;
  user.value = await storeUsers.getUser();
  rows.value = await storeRansom.getRansomRows('ClientRansom');

  if (rows.value) {
    handleFilteredRows(rows.value)
  }

  isLoading.value = false;

  pvz.value = await storePVZ.getPVZ();
  sortingCenters.value = await storeSortingCenters.getSortingCenters();
  marketplaces.value = await storeMarketplaces.getMarketplaces();
});

onBeforeMount(() => {
  if (!token || user.value.dataClientRansom === "NONE") {
    router.push("/auth/login");
  }
})

definePageMeta({
  layout: false,
  name: "Все товары: Выкуп Клиента"
});

const token = Cookies.get("token");
let showAddFields = ref(false)

let isAutoCell = ref(true);
let isAutoFromName = ref(true);

function getCellFromName() {
  if (rowData.value.fromName.trim().length === 12 && isAutoFromName.value === true) {
    let rowCell = rows.value?.filter((row) => row.fromName === rowData.value.fromName);
    if (rowCell) {
      rowData.value.cell = rowCell[0].cell;
    }
  }
}



</script>

<template>
  <Head>
    <Title>Выкуп клиента</Title>
  </Head>
  <div>
    <div v-if="user.role === 'ADMIN'">
      <NuxtLayout name="admin">
        <div v-if="!isLoading" class="mt-3">
          <div>
            <SpreadsheetsClientRansomFilters v-if="rows" @filtered-rows="handleFilteredRows" :rows="rows" />
            <div class="mt-5 flex items-center gap-3" v-if="user.dataClientRansom === 'WRITE'">
              <UIMainButton v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'" @click="openModal">Создать новую
                запись</UIMainButton>
            </div>
          </div>

          <SpreadsheetsClientRansomTable1 @update-delivery-row="updateDeliveryRow" :rows="filteredRows" :user="user"
            @delete-row="deleteRow" @open-modal="openModal" @delete-selected-rows="deleteSelectedRows"
            @update-delivery-rows="updateDeliveryRows" @create-copy-row="createCopyRow" />

            <UIModal v-show="isOpen" @close-modal="closeModal">
              <template v-slot:header>
                <div class="custom-header" v-if="rowData.id">
                  Изменение строки с ID - <b> {{ rowData.id }}</b>
                </div>
                <div class="custom-header" v-else>Создание новой строки</div>
              </template>
              <div class="text-black">
  
                <div class="grid grid-cols-2 mb-5" v-if="user.fromName2 === 'READ' || user.fromName2 === 'WRITE'">
                  <label for="fromName" class="max-sm:text-sm">Телефон <sup>*</sup></label>
                  <div>
                    <input :disabled="user.fromName2 === 'READ'"
                      class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                      v-model="rowData.fromName" @input="getCellFromName" type="text" />
                    <div class="flex gap-3 items-center justify-center mt-1">
                      <h1 class="max-sm:text-sm">АВТО</h1>
                      <input type="checkbox" v-model="isAutoFromName" />
                    </div>
                  </div>
                </div>
  
                <div class="grid grid-cols-2 mb-5" v-if="user.cell2 === 'READ' || user.cell2 === 'WRITE'">
                  <label for="cell" class="max-sm:text-sm">Ячейка</label>
                  <div>
                    <input :disabled="user.cell2 === 'READ'"
                      class="bg-transparent w-full rounded-md border-2 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                      v-model="rowData.cell" type="text" />
                  </div>
                </div>
  
                <div class="grid grid-cols-2 mb-5" v-if="user.dispatchPVZ2 === 'READ' || user.dispatchPVZ2 === 'WRITE'">
                  <label for="dispatchPVZ1" class="max-sm:text-sm">Отправка в ПВЗ</label>
                  <select class="py-1 px-2 border-2 bg-transparent rounded-lg text-base disabled:text-gray-400"
                    v-model="rowData.dispatchPVZ" :disabled="user.dispatchPVZ1 === 'READ'">
                    <option v-for="pvzData in pvz" :value="pvzData.name">
                      {{ pvzData.name }}
                    </option>
                  </select>
                </div>
  
                <div class="grid grid-cols-2 mb-5" v-if="user.productLink2 === 'READ' || user.productLink2 === 'WRITE'">
                  <label for="productLink1" class="max-sm:text-sm">Маркетплейс</label>
                  <select :disabled="user.productLink2 === 'READ'"
                    class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="rowData.productLink">
                    <option value="">Пусто</option>
                    <option v-for="marketplace in marketplaces" :value="marketplace.name"> {{ marketplace.name }} </option>
                  </select>
                </div>
  
                <div class="grid grid-cols-2 mb-5" v-if="user.productName2 === 'READ' || user.productName2 === 'WRITE'">
                  <label for="productName1" class="max-sm:text-sm">Количество товаров</label>
                  <input :disabled="user.productName2 === 'READ'"
                    class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="rowData.productName" type="text" />
                </div>
  
                <div class="grid grid-cols-2 mb-5" v-if="user.priceProgram === 'READ' || user.priceProgram === 'WRITE'">
                  <label for="priceProgram" class="max-sm:text-sm">Стоимость выкупа <br> товара</label>
                  <input :disabled="user.priceProgram === 'READ'"
                    class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="rowData.priceProgram" type="number" />
                </div>
  
                <div class="grid grid-cols-2 mb-5" v-if="user.prepayment2 === 'READ' || user.prepayment2 === 'WRITE'">
                  <label for="prepayment1" class="max-sm:text-sm">Предоплата</label>
                  <input :disabled="user.prepayment2 === 'READ'"
                    class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="rowData.prepayment" type="number" placeholder="По умолчанию: 0" />
                </div>
  
                <div class="grid grid-cols-2 mb-5" v-if="user.percentClient2 === 'READ' || user.percentClient2 === 'WRITE'">
                  <label for="percentClient1" class="max-sm:text-sm">Процент с клиента</label>
                  <input :disabled="user.percentClient2 === 'READ'"
                    class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="rowData.percentClient" placeholder="По умолчанию: 10" type="number" />
                </div>
  
                              <div class="grid grid-cols-2 mb-5" v-if="user.orderPVZ2 === 'READ' || user.orderPVZ2 === 'WRITE'">
                  <label for="orderPVZ1" class="max-sm:text-sm">Заказано на СЦ</label>
                  <select class="py-1 px-2 border-2 bg-transparent rounded-lg text-base disabled:text-gray-400"
                    v-model="rowData.orderPVZ" :disabled="user.orderPVZ1 === 'READ'">
                    <option v-for="sortingCenter in sortingCenters" :value="sortingCenter.name">
                      {{ sortingCenter.name }}
                    </option>
                  </select>
                </div>
  
  
                <h1 @click="showAddFields = !showAddFields"
                  class="cursor-pointer hover:opacity-50 text-secondary-color font-bold duration-200 mb-5">Показать ещё
                  настройки</h1>
                <div v-if="showAddFields">
                  <div class="grid grid-cols-2 mb-5" v-if="user.deliveredSC1 === 'READ' || user.deliveredSC1 === 'WRITE'">
                    <label for="deliveredSC1" class="max-sm:text-sm">Доставлено на СЦ</label>
                    <input :disabled="user.deliveredSC1 === 'READ'"
                      class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                      v-model="rowData.deliveredSC" type="datetime-local" />
                  </div>
  
                  <div class="grid grid-cols-2 mb-5" v-if="user.deliveredPVZ1 === 'READ' || user.deliveredPVZ1 === 'WRITE'">
                    <label for="deliveredPVZ1" class="max-sm:text-sm">Доставлено на ПВЗ</label>
                    <input :disabled="user.deliveredPVZ1 === 'READ'"
                      class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                      v-model="rowData.deliveredPVZ" type="datetime-local" />
                  </div>
  
                  <div class="grid grid-cols-2 mb-5" v-if="user.issued1 === 'READ' || user.issued1 === 'WRITE'">
                    <label for="issued1" class="max-sm:text-sm">Выдан клиенту</label>
                    <input :disabled="user.issued1 === 'READ'"
                      class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
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
                <UIMainButton @click="updateRow">Сохранить
                </UIMainButton>
                <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
              </div>
              <div class="flex items-center justify-center gap-3 mt-10" v-else>
                <UIMainButton :disabled="rowData.fromName === '' || rowData.fromName === null" @click="createRow">Создать
                </UIMainButton>
                <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
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
          <div>
            <SpreadsheetsClientRansomFilters v-if="rows && user.role !== 'PVZ'" @filtered-rows="handleFilteredRows"
              :rows="rows" :user="user" />
            <div class="mt-5 flex items-center gap-3" v-if="user.dataOurRansom === 'WRITE'">
              <UIMainButton v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'" @click="openModal">Создать новую
                запись</UIMainButton>
            </div>
          </div>

          <SpreadsheetsClientRansomTable1 @update-delivery-row="updateDeliveryRow" :rows="filteredRows" :user="user"
            @delete-row="deleteRow" @open-modal="openModal" @delete-selected-rows="deleteSelectedRows"
            @update-delivery-rows="updateDeliveryRows" @create-copy-row="createCopyRow" />

          <UIModal v-show="isOpen" @close-modal="closeModal">
            <template v-slot:header>
              <div class="custom-header" v-if="rowData.id">
                Изменение строки с ID - <b> {{ rowData.id }}</b>
              </div>
              <div class="custom-header" v-else>Создание новой строки</div>
            </template>
            <div class="text-black">

              <div class="grid grid-cols-2 mb-5" v-if="user.fromName2 === 'READ' || user.fromName2 === 'WRITE'">
                <label for="fromName" class="max-sm:text-sm">Телефон <sup>*</sup></label>
                <div>
                  <input :disabled="user.fromName2 === 'READ'"
                    class="bg-transparent w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="rowData.fromName" @input="getCellFromName" type="text" />
                  <div class="flex gap-3 items-center justify-center mt-1">
                    <h1 class="max-sm:text-sm">АВТО</h1>
                    <input type="checkbox" v-model="isAutoFromName" />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.cell2 === 'READ' || user.cell2 === 'WRITE'">
                <label for="cell" class="max-sm:text-sm">Ячейка</label>
                <div>
                  <input :disabled="user.cell2 === 'READ'"
                    class="bg-transparent w-full rounded-md border-2 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="rowData.cell" type="text" />
                </div>
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.dispatchPVZ2 === 'READ' || user.dispatchPVZ2 === 'WRITE'">
                <label for="dispatchPVZ1" class="max-sm:text-sm">Отправка в ПВЗ</label>
                <select class="py-1 px-2 border-2 bg-transparent rounded-lg text-base disabled:text-gray-400"
                  v-model="rowData.dispatchPVZ" :disabled="user.dispatchPVZ1 === 'READ'">
                  <option v-for="pvzData in pvz" :value="pvzData.name">
                    {{ pvzData.name }}
                  </option>
                </select>
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.productLink2 === 'READ' || user.productLink2 === 'WRITE'">
                <label for="productLink1" class="max-sm:text-sm">Маркетплейс</label>
                <select :disabled="user.productLink2 === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.productLink">
                  <option value="">Пусто</option>
                  <option v-for="marketplace in marketplaces" :value="marketplace.name"> {{ marketplace.name }} </option>
                </select>
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.productName2 === 'READ' || user.productName2 === 'WRITE'">
                <label for="productName1" class="max-sm:text-sm">Количество товаров</label>
                <input :disabled="user.productName2 === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.productName" type="text" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.priceProgram === 'READ' || user.priceProgram === 'WRITE'">
                <label for="priceProgram" class="max-sm:text-sm">Стоимость выкупа <br> товара</label>
                <input :disabled="user.priceProgram === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.priceProgram" type="number" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.prepayment2 === 'READ' || user.prepayment2 === 'WRITE'">
                <label for="prepayment1" class="max-sm:text-sm">Предоплата</label>
                <input :disabled="user.prepayment2 === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.prepayment" type="number" placeholder="По умолчанию: 0" />
              </div>

              <div class="grid grid-cols-2 mb-5" v-if="user.percentClient2 === 'READ' || user.percentClient2 === 'WRITE'">
                <label for="percentClient1" class="max-sm:text-sm">Процент с клиента</label>
                <input :disabled="user.percentClient2 === 'READ'"
                  class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                  v-model="rowData.percentClient" placeholder="По умолчанию: 10" type="number" />
              </div>

                            <div class="grid grid-cols-2 mb-5" v-if="user.orderPVZ2 === 'READ' || user.orderPVZ2 === 'WRITE'">
                <label for="orderPVZ1" class="max-sm:text-sm">Заказано на СЦ</label>
                <select class="py-1 px-2 border-2 bg-transparent rounded-lg text-base disabled:text-gray-400"
                  v-model="rowData.orderPVZ" :disabled="user.orderPVZ1 === 'READ'">
                  <option v-for="sortingCenter in sortingCenters" :value="sortingCenter.name">
                    {{ sortingCenter.name }}
                  </option>
                </select>
              </div>


              <h1 @click="showAddFields = !showAddFields"
                class="cursor-pointer hover:opacity-50 text-secondary-color font-bold duration-200 mb-5">Показать ещё
                настройки</h1>
              <div v-if="showAddFields">
                <div class="grid grid-cols-2 mb-5" v-if="user.deliveredSC1 === 'READ' || user.deliveredSC1 === 'WRITE'">
                  <label for="deliveredSC1" class="max-sm:text-sm">Доставлено на СЦ</label>
                  <input :disabled="user.deliveredSC1 === 'READ'"
                    class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="rowData.deliveredSC" type="datetime-local" />
                </div>

                <div class="grid grid-cols-2 mb-5" v-if="user.deliveredPVZ1 === 'READ' || user.deliveredPVZ1 === 'WRITE'">
                  <label for="deliveredPVZ1" class="max-sm:text-sm">Доставлено на ПВЗ</label>
                  <input :disabled="user.deliveredPVZ1 === 'READ'"
                    class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
                    v-model="rowData.deliveredPVZ" type="datetime-local" />
                </div>

                <div class="grid grid-cols-2 mb-5" v-if="user.issued1 === 'READ' || user.issued1 === 'WRITE'">
                  <label for="issued1" class="max-sm:text-sm">Выдан клиенту</label>
                  <input :disabled="user.issued1 === 'READ'"
                    class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
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
              <UIMainButton @click="updateRow">Сохранить
              </UIMainButton>
              <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
            </div>
            <div class="flex items-center justify-center gap-3 mt-10" v-else>
              <UIMainButton :disabled="rowData.fromName === '' || rowData.fromName === null" @click="createRow">Создать
              </UIMainButton>
              <UIErrorButton @click="closeModal">Отменить </UIErrorButton>
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
