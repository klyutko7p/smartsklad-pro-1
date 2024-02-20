<script lang="ts" setup>
import { useUsersStore } from "../stores/users";

const router = useRouter();
const route = useRoute()
const storeUsers = useUsersStore();
const storeBalance = useBalanceStore();
let user = ref({} as User);
let isOpen = ref(false);
let requests = ref<Array<IBalance>>()

function signOut() {
  storeUsers.signOut();
}

function editMenu() {
  isOpen.value = !isOpen.value;
  const screenWidth = window.innerWidth;
  if (isOpen.value && screenWidth < 1280) {
    useHead({
      bodyAttrs: {
        class: 'overflow-hidden'
      }
    });
  } else {
    document.body.classList.remove('overflow-hidden');
  }
}

onBeforeMount(async () => {
  user.value = storeUsers.getUser();
  requests.value = await storeBalance.getBalanceRows();
});

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
</script>
<template>
  <div
    class="fixed z-50 backdrop-blur-2xl w-full h-screen flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 max-w-[16rem] p-4 shadow-xl shadow-blue-gray-900/5 max-xl:hidden overflow-y-auto"
    v-if="isOpen">
    <div class="p-4 flex justify-between items-center">
      <h1 class="font-bold text-xl text-secondary-color">SMARTSKLAD</h1>
      <Icon @click="editMenu" name="ooui:arrow-previous-ltr" size="20"
        class="hover:text-orange-300 duration-200 cursor-pointer" />
    </div>
    <nav class="flex flex-col gap-1 min-w-[240px] p-2 font-sans text-base font-normal text-gray-700 overflow-y-auto">
      <div role="button" @click="router.push('/spreadsheets/our-ransom/info')" tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-orange-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        v-if="user.dataOurRansom === 'READ' || user.dataOurRansom === 'WRITE'">
        <div class="grid place-items-center mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
            class="h-5 w-5">
            <path fill-rule="evenodd"
              d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z"
              clip-rule="evenodd"></path>
          </svg>
        </div>
        <h1>Наш Выкуп</h1>
      </div>
      <div role="button" tabindex="0" @click="user.role !== 'SORTIROVKA' ? router.push('/spreadsheets/client-ransom/info') : router.push('/spreadsheets/client-ransom')"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-blue-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        v-if="user.dataClientRansom === 'READ' || user.dataClientRansom === 'WRITE'">
        <div class="grid place-items-center mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
            class="h-5 w-5">
            <path fill-rule="evenodd"
              d="M6.912 3a3 3 0 00-2.868 2.118l-2.411 7.838a3 3 0 00-.133.882V18a3 3 0 003 3h15a3 3 0 003-3v-4.162c0-.299-.045-.596-.133-.882l-2.412-7.838A3 3 0 0017.088 3H6.912zm13.823 9.75l-2.213-7.191A1.5 1.5 0 0017.088 4.5H6.912a1.5 1.5 0 00-1.434 1.059L3.265 12.75H6.11a3 3 0 012.684 1.658l.256.513a1.5 1.5 0 001.342.829h3.218a1.5 1.5 0 001.342-.83l.256-.512a3 3 0 012.684-1.658h2.844z"
              clip-rule="evenodd"></path>
          </svg>
        </div>
        <h1>Выкуп Клиента</h1>
      </div>
      <div
        v-if="(user.role === 'ADMIN' && user.username !== 'Светлана') || user.role === 'ADMINISTRATOR' || user.role === 'PVZ'"
        role="button" @click="router.push('/balance')" tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none">
        <div class="grid place-items-center mr-4">
          <Icon name="mdi:wallet-bifold" size="20" />
        </div>
        <h1>Баланс</h1>
        <Icon v-if="requests?.filter((row) => row.pvz === user.visiblePVZ && row.issued === null).length > 0"
          name="pepicons-print:exclamation" size="24" class="text-red-700" />
      </div>
      <div role="button" tabindex="0" @click="signOut()"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-orange-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none">
        <div class="grid place-items-center mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
            class="h-5 w-5">
            <path fill-rule="evenodd"
              d="M12 2.25a.75.75 0 01.75.75v9a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM6.166 5.106a.75.75 0 010 1.06 8.25 8.25 0 1011.668 0 .75.75 0 111.06-1.06c3.808 3.807 3.808 9.98 0 13.788-3.807 3.808-9.98 3.808-13.788 0-3.808-3.807-3.808-9.98 0-13.788a.75.75 0 011.06 0z"
              clip-rule="evenodd"></path>
          </svg>
        </div>
        Выйти
      </div>
    </nav>
  </div>

  <div
    class="absolute bg-gradient-to-tr from-white via-white to-yellow-100 bg-image top-0 bottom-0 left-0 right-0 z-50 hidden max-xl:flex items-center justify-center bg-white"
    v-if="isOpen">
    <Icon name="material-symbols:close" class="absolute duration-200 cursor-pointer hover:text-orange-400 top-2 right-4"
      size="40" @click="editMenu" />
    <nav class="flex flex-col gap-1 min-w-[240px] p-2 font-sans text-base font-normal text-gray-700">
      <h1 class="text-center font-bold text-3xl text-secondary-color mb-5">SMARTSKLAD</h1>
      <div role="button" @click="user.role !== 'SORTIROVKA' ? router.push('/spreadsheets/our-ransom/info') : router.push('/spreadsheets/our-ransom')" tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-orange-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        v-if="user.dataOurRansom === 'READ' || user.dataOurRansom === 'WRITE'">
        <div class="grid place-items-center mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
            class="h-5 w-5">
            <path fill-rule="evenodd"
              d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z"
              clip-rule="evenodd"></path>
          </svg>
        </div>
        <h1>Наш Выкуп</h1>
      </div>
      <div role="button" tabindex="0" @click="user.role !== 'SORTIROVKA' ? router.push('/spreadsheets/client-ransom/info') : router.push('/spreadsheets/client-ransom')"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-blue-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
        v-if="user.dataClientRansom === 'READ' || user.dataClientRansom === 'WRITE'">
        <div class="grid place-items-center mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
            class="h-5 w-5">
            <path fill-rule="evenodd"
              d="M6.912 3a3 3 0 00-2.868 2.118l-2.411 7.838a3 3 0 00-.133.882V18a3 3 0 003 3h15a3 3 0 003-3v-4.162c0-.299-.045-.596-.133-.882l-2.412-7.838A3 3 0 0017.088 3H6.912zm13.823 9.75l-2.213-7.191A1.5 1.5 0 0017.088 4.5H6.912a1.5 1.5 0 00-1.434 1.059L3.265 12.75H6.11a3 3 0 012.684 1.658l.256.513a1.5 1.5 0 001.342.829h3.218a1.5 1.5 0 001.342-.83l.256-.512a3 3 0 012.684-1.658h2.844z"
              clip-rule="evenodd"></path>
          </svg>
        </div>
        <h1>Выкуп Клиента</h1>
      </div>
      <div
        v-if="(user.role === 'ADMIN' && user.username !== 'Светлана') || user.role === 'ADMINISTRATOR' || user.role === 'PVZ'"
        role="button" @click="router.push('/balance')" tabindex="0"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none">
        <div class="grid place-items-center mr-4">
          <Icon name="mdi:wallet-bifold" size="20" />
        </div>
        <h1>Баланс</h1>
        <Icon v-if="requests?.filter((row) => row.pvz === user.visiblePVZ && row.issued === null).length > 0"
          name="pepicons-print:exclamation" size="24" class="text-red-700" />
      </div>
      <div role="button" tabindex="0" @click="signOut()"
        class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-orange-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none">
        <div class="grid place-items-center mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
            class="h-5 w-5">
            <path fill-rule="evenodd"
              d="M12 2.25a.75.75 0 01.75.75v9a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM6.166 5.106a.75.75 0 010 1.06 8.25 8.25 0 1011.668 0 .75.75 0 111.06-1.06c3.808 3.807 3.808 9.98 0 13.788-3.807 3.808-9.98 3.808-13.788 0-3.808-3.807-3.808-9.98 0-13.788a.75.75 0 011.06 0z"
              clip-rule="evenodd"></path>
          </svg>
        </div>
        Выйти
      </div>
    </nav>
  </div>

  <div v-else
    :class="{ 'absolute': route.fullPath.includes('+') || route.fullPath === '/spreadsheets/our-ransom' || route.fullPath === '/spreadsheets/client-ransom' }"
    class="py-1 px-3 fixed z-40 max-xl:right-0 flex items-center max-sm:gap-3 justify-between duration-200 w-full bg-gradient-to-br from-purple-700 to-orange-400 backdrop-blur-2xl text-white">
    <div class="flex items-center gap-1">
      <Icon @click="editMenu" size="40" name="material-symbols-light:menu"
        class="hover:opacity-50 duration-200 cursor-pointer" />
      <Icon v-if="requests?.filter((row) => row.pvz === user.visiblePVZ && row.issued === null).length > 0"
        name="pepicons-print:exclamation" size="40" class="text-red-700" />
      <h1 class="font-medium">{{ user.username }}</h1>
    </div>
    <h1 class="text-lg font-medium max-sm:text-sm"
      v-if="route.meta.name === 'Товары из' && route.fullPath.includes('/our-ransom')">{{ route.meta.name }} {{
        route.params.pvz }} (Наш Выкуп) </h1>
    <h1 class="text-lg font-medium max-sm:text-sm"
      v-else-if="route.fullPath.includes('/client-ransom') && route.params.pvz && !route.params.fromName">
      Товары из {{ route.meta.name }} {{ route.params.pvz }} (Выкуп Клиента)
    </h1>
    <h1 class="text-lg font-medium max-sm:text-sm"
      v-else-if="route.fullPath.includes('/client-ransom') && route.params.pvz && route.params.fromName">
      Товары по телефону: {{ formatPhoneNumber(route.params.fromName) }} (Выкуп Клиента)
    </h1>
    <h1 class="text-lg font-medium max-sm:text-sm"
      v-else-if="route.fullPath.includes('/our-ransom') && route.params.pvz && route.params.fromName">
      Товары по телефону: {{ formatPhoneNumber(route.params.fromName) }} (Наш Выкуп) </h1>
    <h1 class="text-lg font-medium max-sm:text-sm" v-else>{{ route.meta.name }}</h1>
    <Icon @click="router.go(-1)" name="material-symbols:arrow-back-rounded" size="32"
      class="cursor-pointer hover:opacity-50 duration-200" />
  </div></template>
