<script setup lang="ts">
import Cookies from "js-cookie";
const storeUsers = useUsersStore();
const storeRansom = useRansomStore();
const router = useRouter();
const route = useRoute();
const id = +route.params.id;
const link = route.name?.toString()

let isLoading = ref(false);

let user = ref({} as User);
let row = ref({} as IClientRansom);

async function updateDeliveryRow(obj: any) {
  await storeRansom.updateDeliveryStatus(obj.row, obj.flag, "ClientRansom", user.value.username);
  row.value = await storeRansom.getRansomRow(id, "ClientRansom");
}

onMounted(async () => {
  isLoading.value = true;
  user.value = await storeUsers.getUser();
  row.value = await storeRansom.getRansomRow(id, "ClientRansom");
  isLoading.value = false;
});

definePageMeta({
  layout: false,
});

onMounted(() => {
  if (!token) {
    router.push("/auth/login");
  }
});

const token = Cookies.get("token");
</script>

<template>
  <Head>
    <Title>Запись - {{ id }}</Title>
  </Head>
  <div>
    <div v-if="user.role === 'ADMIN'">
      <NuxtLayout name="admin">
        <div class="mt-5" v-if="!isLoading">
          <RecordBody :link="link" :user="user" :row="row"
            :value="`https://smartsklad-pro-2.netlify.app/spreadsheets/record/2/${row.id}`"
            @update-delivery-row="updateDeliveryRow" />
        </div>
        <div v-else>
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
    <div v-else>
      <NuxtLayout name="user">
        <div class="mt-5" v-if="!isLoading">
          <RecordBody :link="link" :user="user" :row="row"
            :value="`https://smartsklad-pro-2.netlify.app/spreadsheets/record/2/${row.id}`"
            @update-delivery-row="updateDeliveryRow" />
        </div>
        <div v-else>
          <UISpinner />
        </div>
      </NuxtLayout>
    </div>
  </div>
</template>
