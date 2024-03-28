<script setup lang="ts">
const props = defineProps({
  rows: { type: Array as PropType<IClientRansom[]>, required: true },
  user: { type: Object as PropType<User>}
});

const storeRansom = useRansomStore();

let showFilters = ref(false);

const selectedCell = ref<number | string | null>(null);
const selectedFromName = ref<string | null>(null);
const selectedProductName = ref<string | null>(null);
const selectedDispatchPVZ = ref<string | null>(null);
const selectedOrderPVZ = ref<string | null>(null);
const selectedOrderAccount = ref<string | null>(null);
const selectedAdditionally = ref<string | null>(null);
const selectedPriceSite = ref<number | null>(null);
const startingDate = ref<Date | string | null>(null);
const endDate = ref<Date | string | null>(null);
const startingDate2 = ref<Date | string | null>(null);
const endDate2 = ref<Date | string | null>(null);
const startingDate3 = ref<Date | string | null>(null);
const endDate3 = ref<Date | string | null>(null);
const startingDate4 = ref<Date | string | null>(null);
const endDate4 = ref<Date | string | null>(null);

const uniqueOrderAccounts = computed(() => {
  return storeRansom.getUniqueNonEmptyValues(props.rows, "orderAccount");
});

const uniqueOrderPVZ = computed(() => {
  return storeRansom.getUniqueNonEmptyValues(props.rows, "orderPVZ");
});

const uniquePVZ = computed(() => {
  return storeRansom.getUniqueNonEmptyValues(props.rows, "dispatchPVZ");
});

const uniqueCells = computed(() => {
  return storeRansom.getUniqueNonEmptyValues(props.rows, "cell");
});

const uniqueFromNames = computed(() => {
  return storeRansom.getUniqueNonEmptyValues(props.rows, "fromName");
});

const uniqueProductNames = computed(() => {
  return storeRansom.getUniqueNonEmptyValues(props.rows, "productName");
});

const uniqueAdditionally = computed(() => {
  return storeRansom.getUniqueNonEmptyValues(props.rows, "additionally");
});

const uniquePriceSite = computed(() => {
  return storeRansom.getUniqueNonEmptyValues(props.rows, "priceProgram");
});

const filteredRows = ref<Array<IClientRansom>>();

const emit = defineEmits(["filtered-rows"]);

const filterRows = () => {
  filteredRows.value = props.rows.slice();
  filteredRows.value = props.rows.filter((row) => {
    return (
      (!selectedCell.value || row.cell === selectedCell.value) &&
      (!selectedFromName.value || row.fromName === selectedFromName.value) &&
      (!selectedProductName.value || row.productName === selectedProductName.value) &&
      (!selectedDispatchPVZ.value || row.dispatchPVZ === selectedDispatchPVZ.value) &&
      (!selectedOrderPVZ.value || row.orderPVZ === selectedOrderPVZ.value) &&
      (!selectedOrderAccount.value || row.orderAccount === selectedOrderAccount.value) &&
      (!selectedAdditionally.value || row.additionally === selectedAdditionally.value) &&
      (!selectedPriceSite.value || row.priceProgram == selectedPriceSite.value) &&
      (!startingDate.value || new Date(row.issued) >= new Date(startingDate.value)) &&
      (!endDate.value || new Date(row.issued) <= new Date(endDate.value)) &&
      (!startingDate2.value || new Date(row.deliveredSC) >= new Date(startingDate2.value)) &&
      (!endDate2.value || new Date(row.deliveredSC) <= new Date(endDate2.value)) &&
      (!startingDate3.value || new Date(row.created_at) >= new Date(startingDate3.value)) &&
      (!endDate3.value || new Date(row.created_at) <= new Date(endDate3.value)) &&
      (!startingDate4.value || new Date(row.deliveredPVZ) >= new Date(startingDate4.value)) &&
      (!endDate4.value || new Date(row.deliveredPVZ) <= new Date(endDate4.value))
    );
  });
  emit("filtered-rows", filteredRows.value);
};


function clearFields() {
  selectedCell.value = "";
  selectedAdditionally.value = "";
  selectedDispatchPVZ.value = "";
  selectedOrderPVZ.value = "";
  selectedOrderAccount.value = "";
  selectedFromName.value = "";
  selectedAdditionally.value = "";
  selectedProductName.value = "";
  startingDate.value = "";
  endDate.value = "";
  startingDate2.value = "";
  endDate2.value = "";
  startingDate3.value = "";
  endDate3.value = "";
  startingDate4.value = "";
  endDate4.value = "";
  filterRows();
}


watch(
  [
    selectedCell,
    selectedFromName,
    selectedProductName,
    selectedDispatchPVZ,
    selectedOrderPVZ,
    selectedOrderAccount,
    selectedAdditionally,
    selectedPriceSite,
    startingDate,
    endDate,
    startingDate2,
    endDate2,
    startingDate3,
    endDate3,
    startingDate4,
    endDate4,
  ],
  filterRows
);

let variables = ref([
  selectedCell,
  selectedFromName,
  selectedProductName,
  selectedDispatchPVZ,
  selectedOrderPVZ,
  selectedOrderAccount,
  selectedAdditionally,
  selectedPriceSite,
  startingDate,
  endDate,
  startingDate2,
  endDate2,
  startingDate3,
  endDate3,
  startingDate4,
  endDate4,
]);

const nonEmptyCount: Ref<number> = computed(() => {
  return variables.value.filter((variable: any) => {
    return variable.value !== undefined && variable.value !== null && variable.value !== '';
  }).length;
});

function saveToLocalStorage(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadFromLocalStorage(key: string) {
  const storedValue = localStorage.getItem(key);
  return storedValue ? JSON.parse(storedValue) : null;
}

function saveFiltersToLocalStorage() {
  saveToLocalStorage('selectedCell', selectedCell.value);
  saveToLocalStorage('selectedFromName', selectedFromName.value);
  saveToLocalStorage('selectedProductName', selectedProductName.value);
  saveToLocalStorage('selectedDispatchPVZ', selectedDispatchPVZ.value);
  saveToLocalStorage('selectedOrderPVZ', selectedOrderPVZ.value);
  saveToLocalStorage('selectedOrderAccount', selectedOrderAccount.value);
  saveToLocalStorage('selectedAdditionally', selectedAdditionally.value);
  saveToLocalStorage('selectedPriceSite', selectedPriceSite.value);
  saveToLocalStorage('startingDate', startingDate.value);
  saveToLocalStorage('endDate', endDate.value);
  saveToLocalStorage('startingDate2', startingDate2.value);
  saveToLocalStorage('endDate2', endDate2.value);
  saveToLocalStorage('startingDate3', startingDate3.value);
  saveToLocalStorage('endDate3', endDate3.value);
  saveToLocalStorage('startingDate4', startingDate4.value);
  saveToLocalStorage('endDate4', endDate4.value);
  showFilters.value = false;
}

function clearLocalStorage() {
  localStorage.clear();
  selectedCell.value = null;
  selectedFromName.value = null;
  selectedProductName.value = null;
  selectedDispatchPVZ.value = null;
  selectedOrderPVZ.value = null;
  selectedOrderAccount.value = null;
  selectedAdditionally.value = null;
  selectedPriceSite.value = null;
  startingDate.value = null;
  endDate.value = null;
  startingDate2.value = null;
  endDate2.value = null;
  startingDate3.value = null;
  endDate3.value = null;
  startingDate4.value = null;
  endDate4.value = null;
}

onMounted(() => {
  const storedSelectedCell = loadFromLocalStorage('selectedCell');
  if (storedSelectedCell !== null) {
    selectedCell.value = storedSelectedCell;
  }

  const storedSelectedFromName = loadFromLocalStorage('selectedFromName');
  if (storedSelectedFromName !== null) {
    selectedFromName.value = storedSelectedFromName;
  }

  const storedSelectedProductName = loadFromLocalStorage('selectedProductName');
  if (storedSelectedProductName !== null) {
    selectedProductName.value = storedSelectedProductName;
  }

  const storedSelectedDispatchPVZ = loadFromLocalStorage('selectedDispatchPVZ');
  if (storedSelectedDispatchPVZ !== null) {
    selectedDispatchPVZ.value = storedSelectedDispatchPVZ;
  }

  const storedSelectedOrderPVZ = loadFromLocalStorage('selectedOrderPVZ');
  if (storedSelectedOrderPVZ !== null) {
    selectedOrderPVZ.value = storedSelectedOrderPVZ;
  }

  const storedSelectedOrderAccount = loadFromLocalStorage('selectedOrderAccount');
  if (storedSelectedOrderAccount !== null) {
    selectedOrderAccount.value = storedSelectedOrderAccount;
  }

  const storedSelectedAdditionally = loadFromLocalStorage('selectedAdditionally');
  if (storedSelectedAdditionally !== null) {
    selectedAdditionally.value = storedSelectedAdditionally;
  }

  const storedSelectedPriceSite = loadFromLocalStorage('selectedPriceSite');
  if (storedSelectedPriceSite !== null) {
    selectedPriceSite.value = storedSelectedPriceSite;
  }

  const storedStartingDate = loadFromLocalStorage('startingDate');
  if (storedStartingDate !== null) {
    startingDate.value = storedStartingDate;
  }

  const storedEndDate = loadFromLocalStorage('endDate');
  if (storedEndDate !== null) {
    endDate.value = storedEndDate;
  }

  const storedStartingDate2 = loadFromLocalStorage('startingDate2');
  if (storedStartingDate2 !== null) {
    startingDate2.value = storedStartingDate2;
  }

  const storedEndDate2 = loadFromLocalStorage('endDate2');
  if (storedEndDate2 !== null) {
    endDate2.value = storedEndDate2;
  }

  const storedStartingDate3 = loadFromLocalStorage('startingDate3');
  if (storedStartingDate3 !== null) {
    startingDate3.value = storedStartingDate3;
  }

  const storedEndDate3 = loadFromLocalStorage('endDate3');
  if (storedEndDate3 !== null) {
    endDate3.value = storedEndDate3;
  }

  
  const storedStartingDate4 = loadFromLocalStorage('startingDate4');
  if (storedStartingDate4 !== null) {
    startingDate4.value = storedStartingDate4;
  }

  const storedEndDate4 = loadFromLocalStorage('endDate4');
  if (storedEndDate4 !== null) {
    endDate4.value = storedEndDate4;
  }
})

let dateFilter = ref('issued')
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mt-14 max-xl:mt-0">
      <h1 class="text-xl font-bold">Фильтры</h1>
      <Icon @click="showFilters = !showFilters" class="cursor-pointer duration-200 hover:text-secondary-color"
        name="solar:filters-line-duotone" size="24" />
      <h1 class="bg-secondary-color px-3 py-1 font-bold text-white rounded-full"> {{ nonEmptyCount }} </h1>
    </div>
    <div v-if="showFilters" class="border-2 border-gray-300 p-3 mt-3 border-dashed">
      <div class="grid grid-cols-2 max-xl:grid-cols-2 max-md:grid-cols-1">
        <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
          <h1>Ячейка:</h1>
          <input type="text"
            class="bg-transparent max-w-[150px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
            v-model="selectedCell" list="uniqueCells">
          <datalist id="uniqueCells" class="">
            <option v-for="value in uniqueCells" :value="value">{{ value }}</option>
          </datalist>
        </div>
        <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
          <h1>Телефон:</h1>
          <input type="text"
            class="bg-transparent max-w-[150px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
            v-model="selectedFromName" list="uniqueFromNames">
          <datalist id="uniqueFromNames" class="">
            <option v-for="value in uniqueFromNames" :value="value">{{ value }}</option>
          </datalist>
        </div>
        <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
          <h1>Название товара:</h1>
          <input type="text"
            class="bg-transparent max-w-[150px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
            v-model="selectedProductName" list="uniqueProductNames">
          <datalist id="uniqueProductNames" class="">
            <option v-for="value in uniqueProductNames" :value="value">{{ value }}</option>
          </datalist>
        </div>
        <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
          <h1>Стоимость выкупа товара:</h1>
          <input type="text"
            class="bg-transparent max-w-[150px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
            v-model="selectedPriceSite" list="uniquePriceSite">
          <datalist id="uniquePriceSite" class="">
            <option v-for="value in uniquePriceSite" :value="value">{{ value }}</option>
          </datalist>
        </div>
        <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
          <h1>ПВЗ:</h1>
          <input type="text"
            class="bg-transparent max-w-[150px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
            v-model="selectedDispatchPVZ" list="uniquePVZ">
          <datalist id="uniquePVZ" class="">
            <option v-for="value in uniquePVZ" :value="value">{{ value }}</option>
          </datalist>
        </div>
        <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
          <h1>СЦ:</h1>
          <input type="text"
            class="bg-transparent max-w-[150px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
            v-model="selectedOrderPVZ" list="uniqueOrderPVZ">
          <datalist id="uniqueOrderPVZ" class="">
            <option v-for="value in uniqueOrderPVZ" :value="value">{{ value }}</option>
          </datalist>
        </div>
        <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
          <h1>Аккаунт Заказа:</h1>
          <input type="text"
            class="bg-transparent max-w-[150px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
            v-model="selectedOrderAccount" list="uniqueOrderAccounts">
          <datalist id="uniqueOrderAccounts" class="">
            <option v-for="value in uniqueOrderAccounts" :value="value">{{ value }}</option>
          </datalist>
        </div>
        <div class="grid grid-cols-2 m-3 text-center border-b-2 py-2">
          <h1>Дополнительно:</h1>
          <input type="text"
            class="bg-transparent max-w-[150px] px-3 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
            v-model="selectedAdditionally" list="uniqueAdditionally">
          <datalist id="uniqueAdditionally" class="">
            <option v-for="value in uniqueAdditionally" :value="value">{{ value }}</option>
          </datalist>
        </div>
      </div>
      <div v-if="user?.role !== 'SORTIROVKA'">
        <div class="mt-10">
          <div>
            <select v-model="dateFilter" class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400 mb-3">
              <option value="issued" selected>Дата выдачи</option>
              <option value="sorted">Дата сортировки</option>
              <option value="delivered">Дата доставки на пвз</option>
              <option value="created">Дата создания</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-1">
          <div class="grid grid-cols-2 my-2" v-if="dateFilter === 'issued'">
            <h1>От Даты:</h1>
            <input
              class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
              type="date" v-model="startingDate" />
          </div>
          <div class="grid grid-cols-2 my-2" v-if="dateFilter === 'issued'">
            <h1>До Даты:</h1>
            <input
              class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
              type="date" v-model="endDate" />
          </div>
          <div class="grid grid-cols-2 my-2" v-if="dateFilter === 'sorted'">
            <h1>От Даты:</h1>
            <input
              class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
              type="date" v-model="startingDate2" />
          </div>
          <div class="grid grid-cols-2 my-2" v-if="dateFilter === 'sorted'">
            <h1>До Даты:</h1>
            <input
              class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
              type="date" v-model="endDate2" />
          </div>
          <div class="grid grid-cols-2 my-2" v-if="dateFilter === 'created'">
            <h1>От Даты:</h1>
            <input
              class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
              type="date" v-model="startingDate3" />
          </div>
          <div class="grid grid-cols-2 my-2" v-if="dateFilter === 'created'">
            <h1>До Даты:</h1>
            <input
              class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
              type="date" v-model="endDate3" />
          </div>
          <div class="grid grid-cols-2 my-2" v-if="dateFilter === 'delivered'">
            <h1>От Даты:</h1>
            <input
              class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
              type="date" v-model="startingDate4" />
          </div>
          <div class="grid grid-cols-2 my-2" v-if="dateFilter === 'delivered'">
            <h1>До Даты:</h1>
            <input
              class="bg-transparent rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6 disabled:text-gray-400"
              type="date" v-model="endDate4" />
          </div>
      </div>
      </div>
      <div class="flex justify-end gap-3 mt-3">
        <UIMainButton @click="saveFiltersToLocalStorage">Принять</UIMainButton>
        <UIMainButton @click="clearFields(), clearLocalStorage()">Очистить фильтры</UIMainButton>
      </div>
    </div>
  </div>
</template>
