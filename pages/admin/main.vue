<script setup lang="ts">
import Cookies from "js-cookie";
const storeUsers = useUsersStore();
const storeRansom = useRansomStore();
const router = useRouter();

let user = ref({} as User);
const token = Cookies.get("token");
let isLoading = ref(false);

onBeforeMount(async () => {
  isLoading.value = true;
  user.value = await storeUsers.getUser();
  await storeRansom.getSumOfRejection();
  isLoading.value = false;
});

onMounted(() => {
  if (!token) {
    router.push("/auth/login");
  }
});

function signOut() {
  storeUsers.signOut();
}

definePageMeta({
  layout: false,
});

</script>

<template>
  <Head>
    <Title>Главная страница</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="token && user.role === 'ADMIN'">
      <NuxtLayout name="admin">
        <div class="py-5">
          <div class="mt-10 mb-10 flex items-center gap-3">
            <h1 class="text-xl">Приветствуем, {{ user.username }}!</h1>
            <!-- <UIActionButton @click="updateCellsStatus">Обновить статус ячеек</UIActionButton> -->
          </div>
          <div>
            <h1 class="font-bold text-6xl max-[400px]:text-4xl max-md:text-center text-secondary-color mb-5">SMARTSKLAD
            </h1>
            <div role="button" @click="router.push('/spreadsheets/our-ransom/info')" tabindex="0"
              class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
              v-if="user.dataOurRansom === 'READ' || user.dataOurRansom === 'WRITE' && user.username !== 'Светлана'">
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
            <div role="button" @click="router.push('/spreadsheets/our-ransom')" tabindex="0"
              class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
              v-if="user.dataOurRansom === 'READ' || user.dataOurRansom === 'WRITE' && user.username === 'Светлана'">
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
            <div role="button" tabindex="0" @click="router.push('/spreadsheets/client-ransom/info')"
              class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
              v-if="user.dataClientRansom === 'READ' || user.dataClientRansom === 'WRITE' && user.username !== 'Светлана'">
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
            <div role="button" tabindex="0" @click="router.push('/spreadsheets/client-ransom')"
              class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none"
              v-if="user.dataClientRansom === 'READ' || user.dataClientRansom === 'WRITE' && user.username === 'Светлана'">
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
              v-if="(user.dataDelivery === 'READ' || user.dataDelivery === 'WRITE') && (user.role === 'ADMIN' || user.role === 'OPT')"
              role="button" @click="router.push('/spreadsheets/delivery')" tabindex="0"
              class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none">
              <div class="grid place-items-center mr-4">
                <Icon name="carbon:delivery" size="20" />
              </div>
              <h1>Доставка и сортировка</h1>
            </div>
            <div v-if="(user.role === 'ADMIN' || user.role === 'PVZ')" role="button" @click="router.push('/acceptance')"
              tabindex="0"
              class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none">
              <div class="grid place-items-center mr-4">
                <Icon name="material-symbols:call-received-rounded" size="20" />
              </div>
              <h1>Приёмка</h1>
            </div>
            <div
              v-if="(user.role === 'ADMIN' && user.username !== 'Светлана') || user.role === 'ADMINISTRATOR' || user.role === 'PVZ'"
              role="button" @click="router.push('/balance')" tabindex="0"
              class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none">
              <div class="grid place-items-center mr-4">
                <Icon name="mdi:wallet-bifold" size="20" />
              </div>
              <h1>Баланс</h1>
            </div>
            <div class="px-3 pt-3 mb-2 font-bold" v-if="user.role !== 'USER'">
              <h1>Настройки доступа</h1>
            </div>
            <div v-if="user.username !== 'Светлана' && user.role !== 'ADMINISTRATOR'" role="button"
              @click="router.push('/admin/users')" tabindex="0"
              class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none">
              <div class="grid place-items-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
                  class="h-5 w-5">
                  <path fill-rule="evenodd"
                    d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                    clip-rule="evenodd"></path>
                </svg>
              </div>
              <h1>Пользователи</h1>
            </div>
            <div v-if="user.username !== 'Светлана' && user.role !== 'ADMINISTRATOR'" role="button"
              @click="router.push('/admin/marketplaces')" tabindex="0"
              class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none">
              <div class="grid place-items-center mr-4">
                <Icon name="icon-park-outline:market-analysis" size="20" />
              </div>
              <h1>Маркетплейсы</h1>
            </div>
            <div v-if="user.username !== 'Светлана' && user.role !== 'ADMINISTRATOR'" role="button"
              @click="router.push('/admin/cells')" tabindex="0"
              class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none">
              <div class="grid place-items-center mr-4">
                <Icon name="material-symbols:cell-merge-rounded" size="20" />
              </div>
              <h1>Ячейки</h1>
            </div>
            <div v-if="user.username !== 'Светлана' && user.role !== 'ADMINISTRATOR'" role="button"
              @click="router.push('/admin/pvz')" tabindex="0"
              class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none">
              <div class="grid place-items-center mr-4">
                <Icon name="tabler:reorder" size="20" />
              </div>
              <h1>Пункты выдачи заказов</h1>
            </div>
            <div v-if="user.username !== 'Светлана' && user.role !== 'ADMINISTRATOR'" role="button"
              @click="router.push('/admin/sorting-centers')" tabindex="0"
              class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none">
              <div class="grid place-items-center mr-4">
                <Icon name="material-symbols-light:box-sharp" size="20" />
              </div>
              <h1>Сортировочные центры</h1>
            </div>
            <div v-if="user.username !== 'Светлана' && user.role !== 'ADMINISTRATOR'" role="button"
              @click="router.push('/admin/pvz-delivery')" tabindex="0"
              class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none">
              <div class="grid place-items-center mr-4">
                <Icon name="solar:delivery-broken" size="20" />
              </div>
              <h1>Пункты выдачи заказов (Доставка)</h1>
            </div>
            <div v-if="user.username !== 'Светлана' && user.role !== 'ADMINISTRATOR'" role="button"
              @click="router.push('/admin/sorting-centers-delivery')" tabindex="0"
              class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none">
              <div class="grid place-items-center mr-4">
                <Icon name="streamline:shipping-box-2-box-package-label-delivery-shipment-shipping-3d" size="20" />
              </div>
              <h1>Сортировочные центры (Доставка)</h1>
            </div>
            <div v-if="user.username !== 'Светлана' && user.role !== 'ADMINISTRATOR'" role="button"
              @click="router.push('/admin/order-accounts')" tabindex="0"
              class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none">
              <div class="grid place-items-center mr-4">
                <Icon name="material-symbols:deployed-code-account-outline-rounded" size="20" />
              </div>
              <h1>Аккаунты заказа</h1>
            </div>
          </div>
          <div role="button" tabindex="0" @click="signOut()"
            class="flex items-center w-full p-3 rounded-lg text-start leading-tight transition-all hover:bg-orange-50 hover:bg-opacity-80 focus:bg-orange-50 focus:bg-opacity-80 active:bg-gray-50 active:bg-opacity-80 hover:text-orange-900 focus:text-orange-900 active:text-orange-900 outline-none">
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
        </div>
      </NuxtLayout>
    </div>
    <div v-else-if="user.role === 'USER'">
      <NuxtLayout name="user">
        <h1>
          У вас недостаточно прав на просмотр этой информации. Обратитесь к администратору
        </h1>
      </NuxtLayout>
    </div>
  </div>
  <div v-else>
    <UISpinner />
  </div>
</template>
