<script setup lang="ts">
import Cookies from "js-cookie";
const storeUsers = useUsersStore();
const storeRansom = useRansomStore();
const router = useRouter();

let user = ref({} as User);
let rowsClientRansom = ref<Array<IOurRansom>>();
const token = Cookies.get("token");
let isLoading = ref(false);

onBeforeMount(async () => {
  isLoading.value = true;
  user.value = await storeUsers.getUser();
  rowsClientRansom.value = await storeRansom.getRansomRows("ClientRansom");

  if (user.value.role === 'SORTIROVKA') {
    router.push('/spreadsheets/client-ransom')
  }


  isLoading.value = false;
});

onMounted(() => {
  if (!token) {
    router.push("/auth/login");
  }
});

function getCountOfItemsByPVZClientRansom(PVZ: string) {
  if (user.value.role !== "PVZ") {
    return rowsClientRansom.value?.filter((row) => row.dispatchPVZ === PVZ && row.deliveredPVZ === null).length;
  } else if (user.value.role === "PVZ") {
    let today = new Date().toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
    return rowsClientRansom.value?.filter(
      (row) =>
        row.dispatchPVZ === PVZ &&
        row.deliveredSC !== null &&
        (new Date(row.issued).toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        }) === today ||
          row.issued === null) 
    ).length;
  }
}

function getCountOfItemsByPVZClientRansomIssued(PVZ: string) {
  return rowsClientRansom.value?.filter((row) => row.dispatchPVZ === PVZ && row.deliveredSC !== null && row.deliveredPVZ !== null && row.issued === null).length;
}

definePageMeta({
  layout: false,
  name: "Выбор ПВЗ (Выкуп Клиента)"
});
</script>

<template>
  <Head>
    <Title>Главная страница</Title>
  </Head>
  <div v-if="!isLoading">
    <div v-if="token && user.role === 'ADMIN'">
      <NuxtLayout name="admin">
        <div class="py-5" v-if="!isLoading">
          <div class="flex flex-col gap-5 mt-10">
            <div class="flex items-start gap-5 max-sm:flex-col">
              <h1 class="font-bold text-xl max-sm:text-lg">Список доступных ПВЗ</h1>
              <UIActionButton v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'"
                @click="router.push('/spreadsheets/client-ransom')">Все товары</UIActionButton>
            </div>
            <div @click="router.push(`/spreadsheets/client-ransom/${pvz}`)" v-for="pvz in user.PVZ"
              class="border-2 border-secondary-color p-10 font-medium hover:bg-secondary-color hover:text-white duration-300 rounded-2xl cursor-pointer">
              <h1 class="text-xl font-bold">{{ pvz }}</h1>
              <h1 v-if="user.role !== 'PVZ' && (user.role === 'ADMIN' || user.role === 'ADMINISTRATOR')">
                Товаров на выдачу:
                <span class="font-bold">{{ getCountOfItemsByPVZClientRansom(pvz) }}</span>
              </h1>
              <h1 v-if="user.role === 'PVZ'">
                Товаров на выдачу:
                <span class="font-bold">{{ getCountOfItemsByPVZClientRansomIssued(pvz) }}</span>
              </h1>
            </div>
          </div>
        </div>
        <div v-else>
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
  
    <div v-else>
      <NuxtLayout name="user">
        <div class="py-5" v-if="!isLoading">
          <div class="flex flex-col gap-5 mt-10">
            <div class="flex items-start gap-5 max-sm:flex-col">
              <h1 class="font-bold text-xl max-sm:text-lg">Список доступных ПВЗ</h1>
              <UIActionButton v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'"
                @click="router.push('/spreadsheets/client-ransom')">Все товары</UIActionButton>
            </div>
            <div @click="router.push(`/spreadsheets/client-ransom/${pvz}`)" v-for="pvz in user.PVZ"
              class="border-2 border-secondary-color p-10 font-medium hover:bg-secondary-color hover:text-white duration-300 rounded-2xl cursor-pointer">
              <h1 class="text-xl font-bold">{{ pvz }}</h1>
              <h1 v-if="user.role !== 'PVZ' && (user.role === 'ADMIN' || user.role === 'ADMINISTRATOR')">
                Товаров на выдачу:
                <span class="font-bold">{{ getCountOfItemsByPVZClientRansom(pvz) }}</span>
              </h1>
              <h1 v-if="user.role === 'PVZ'">
                Товаров на выдачу:
                <span class="font-bold">{{ getCountOfItemsByPVZClientRansomIssued(pvz) }}</span>
              </h1>
            </div>
          </div>
        </div>
        <div v-else>
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
  </div>
  
  <div v-else>
    <UISpinner />
  </div>

</template>
