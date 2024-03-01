<script setup lang="ts">
import type { PropType } from "vue";

const router = useRouter();
const storeUsers = useUsersStore();
const storeRansom = useRansomStore()

const props = defineProps({
  user: { type: Object as PropType<User>, required: true },
  rows: { type: Array as PropType<IClientRansom[]> },
  pvzLink: { type: String }
});


const showDeletedRows = ref(false);

const perPage = ref(100)
const currentPage = ref(1)
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

  if (searchQuery.value !== '') {
    returnRows.value = props.rows?.filter((row) => {
      const fromNameMatch = row.fromName && row.fromName.includes(searchQuery.value);
      const cellMatch = row.cell && row.cell.includes(searchQuery.value);
      return fromNameMatch || cellMatch;
    });
  }
}

watch([currentPage, totalRows, props.rows], updateCurrentPageData)

const toggleShowDeletedRows = () => {
  showDeletedRows.value = !showDeletedRows.value;
  updateCurrentPageData();
  updateRowsByFromName();
};


onMounted(async () => {

  updateRowsByFromName();

  if (props.user.role === 'SORTIROVKA') {
    perPage.value = totalRows.value;
  }

  await storeRansom.getSumOfRejection()

})

function updateRowsByFromName() {
  updateCurrentPageData();
  returnRows.value = returnRows.value?.filter((element, index) => {
    return returnRows.value?.findIndex(i => i.cell === element.cell && i.fromName === element.fromName) === index;
  })
}

let searchQuery = ref('')

function formatPhoneNumber(phoneNumber: string) {
  if (!phoneNumber) {
    return 'Номер телефона не указан';
  }

  const digitsOnly = phoneNumber.replace(/\D/g, '');

  if (digitsOnly.length < 11) {
    return 'Неправильный формат номера телефона';
  }

  const maskedPhoneNumber =
    '+7' +
    '*'.repeat(digitsOnly.length - 5) +
    digitsOnly.slice(-4);

  return maskedPhoneNumber;
}

let scanStringItem = ref('')
let timeoutId: ReturnType<typeof setTimeout> | null = null;

function scanItem() {
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
  }

  timeoutId = setTimeout(() => {
    let scannedLink = scanStringItem.value.trim();
    scannedLink = convertToURL(scannedLink)
    if (isValidUrl(scannedLink)) {
      window.location.href = scannedLink;
    } else {
      console.error('Invalid URL:', scannedLink);
    }
  }, 2000);
}

function convertToURL(inputString: string) {
  if (inputString.includes('/')) {
    const parts = inputString.split('/');

    const recordID = parts[parts.length - 2];
    const entryID = parts[parts.length - 1];

    const url = `https://smartsklad-pro-1.netlify.app/spreadsheets/record/${recordID}/${entryID}`;

    return url;
  } else if (inputString.includes('.')) {
    const parts = inputString.split('.');

    const recordID = parts[parts.length - 2];
    const entryID = parts[parts.length - 1];

    const url = `https://smartsklad-pro-1.netlify.app/spreadsheets/record/${recordID}/${entryID}`;

    return url;
  }

}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

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
  </div>


  <div class="mt-10">
    <div class="flex flex-col gap-10 mb-5">
      <h1 class="text-2xl">Режим выдачи товаров ({{ pvzLink }}) </h1>
    </div>
    <input type="text" v-model="searchQuery"
      class="block w-full bg-transparent mb-5 border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 rounded-2xl focus:ring-2 focus:ring-yellow-600 sm:text-sm sm:leading-6"
      placeholder="Введите телефон или ячейку..." @input="updateRowsByFromName" />
    <div v-for="row in returnRows">
      <div @click="router.push(`/spreadsheets/client-ransom/${pvzLink}/${row.fromName}/${row.cell}`)"
        class="cursor-pointer hover:bg-hover-color duration-300 flex items-center  justify-between p-10 mb-3 border-2">
        <div class="rounded-full border-2 p-3 min-w-[50px] text-center border-secondary-color">
          <h1>{{ row.cell }}</h1>
        </div>
        <div>
          <h1>Телефон: {{ formatPhoneNumber(row.fromName) }} </h1>
        </div>
      </div>
    </div>
  </div>
</template>

