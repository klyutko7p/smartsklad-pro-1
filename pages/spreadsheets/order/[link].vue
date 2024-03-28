<script setup lang="ts">
import Cookies from "js-cookie";
const storeUsers = useUsersStore();
const storeRansom = useRansomStore();
const route = useRoute();
let link = route.params.link;
link = link.toString();

let isLoading = ref(false);

let user = ref({} as User);
let rows = ref<Array<IOurRansom | IClientRansom | IDelivery>>();
let copyRows = ref<Array<IOurRansom | IClientRansom | IDelivery>>();

function getAmountToBePaid(flag: string) {
  let amountToPaid = 0;
  if (link.startsWith("1")) {
    if (rows.value && flag === "NONE") {
      amountToPaid = rows.value
        .filter((value) => !value.issued)
        .reduce((acc, value) => acc + value.amountFromClient1, 0);
    } else if (rows.value && flag === "PVZ") {
      amountToPaid = rows.value
        .filter((value) => value.deliveredPVZ && !value.issued)
        .reduce((acc, value) => acc + value.amountFromClient1, 0);
    }
  } else if (link.startsWith("2")) {
    if (rows.value && flag === "NONE") {
      amountToPaid = rows.value
        .filter((value) => !value.issued)
        .reduce((acc, value) => acc + value.amountFromClient2, 0);
    } else if (rows.value && flag === "PVZ") {
      amountToPaid = rows.value
        .filter((value) => value.deliveredPVZ && !value.issued)
        .reduce((acc, value) => acc + value.amountFromClient2, 0);
    }
  } else if (link.startsWith("3")) {
    if (rows.value && flag === "NONE") {
      amountToPaid = rows.value
        .filter((value) => !value.paid)
        .reduce((acc, value) => acc + value.amountFromClient3, 0);
    }
  }
  return amountToPaid;
}
let showReceivedItems = ref(true);

function disableReceivedItems() {
  showReceivedItems.value = false;
  copyRows.value = rows.value?.filter((value) => !value.issued);
}

function enableReceivedItems() {
  showReceivedItems.value = true;
  copyRows.value = rows.value;
}

let phoneNumber = ref("");

onMounted(async () => {
  isLoading.value = true;
  user.value = await storeUsers.getUser();

  if (link.startsWith("1")) {
    rows.value = await storeRansom.getRansomRowsByLink(link, "OurRansom");
  } else if (link.startsWith("2")) {
    rows.value = await storeRansom.getRansomRowsByLink(link, "ClientRansom");
  } else if (link.startsWith("3")) {
    rows.value = await storeRansom.getRansomRowsByLink(link, "Delivery");
  }

  if (rows.value) {
    copyRows.value = [...rows.value];
    phoneNumber.value = copyRows.value[0].fromName;
  }
  disableReceivedItems();
  isLoading.value = false;
});

function getNumber(phoneNumberData: string) {
  return phoneNumberData.slice(-4);
}
</script>

<template>
  <Head>
    <Title>Заказ - {{ route.params.link }}</Title>
  </Head>
  <div v-if="!isLoading">
    <div class="mt-5">
      <div class="max-lg:p-3">
        <h1 class="text-2xl overflow-auto">
          Информация о заказе:
          <span class="uppercase">{{ route.params.link }}</span>
        </h1>
        <div class="mb-5 flex items-center gap-3">
          <h1 class="text-xl">
            Телефон: <span class="italic"> {{ getNumber(phoneNumber) }} </span>
          </h1>
          <Icon name="material-symbols:contact-phone-rounded" size="24" />
        </div>
        <h1 class="text-xl" v-if="!link.startsWith('3')">
          Оставшаяся сумма к оплате:
          <span class="font-bold"> {{ getAmountToBePaid("NONE") }} руб.</span>
        </h1>
        <h1 class="text-xl" v-if="link.startsWith('3')">
          Оставшаяся сумма к оплате: <span class="font-bold">{{ getAmountToBePaid("NONE") }} руб.</span>
        </h1>
        <h1 class="text-xl" v-if="!link.startsWith('3')">
          Сумма к оплате на выдачу: <span class="font-bold">{{ getAmountToBePaid("PVZ") }} руб.</span>
        </h1>
        <UIMainButton
          v-if="showReceivedItems && !link.startsWith('3')"
          class="mt-5"
          @click="disableReceivedItems"
          >Скрыть полученные товары</UIMainButton
        >
        <UIMainButton
          v-if="!showReceivedItems && !link.startsWith('3')"
          class="mt-5"
          @click="enableReceivedItems"
        >
          Показать полученные товары</UIMainButton
        >
      </div>
      <SpreadsheetsOrderTable :link="link" :rows="copyRows" :user="user" />
    </div>
  </div>
  <div v-else>
    <UISpinner />
  </div>
</template>
