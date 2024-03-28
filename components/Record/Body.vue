<script setup lang="ts">
import { useToast } from "vue-toastification";

const toast = useToast()
const router = useRouter();
const storeUsers = useUsersStore();
const props = defineProps({
  row: { type: Object as PropType<IOurRansom | IClientRansom>, required: true },
  user: { type: Object as PropType<User>, required: true },
  link: { type: String },
  value: { type: String },
});

const emit = defineEmits(["updateDeliveryRow"]);

function updateDeliveryRow(row: IOurRansom | IClientRansom, flag: string) {
  emit("updateDeliveryRow", { row: row, flag: flag });
}

const alreadyCalled = ref(false);

onMounted(async () => {
  if (props.user.visiblePVZ === 'ВСЕ' || props.user.username === 'ОПТ') {
    toast.success('Нужный доступ подтвержден')
  } else if (props.user.visiblePVZ !== props.row.dispatchPVZ) {
    toast.error("Это товар не Вашего ПВЗ!")
    router.push('/spreadsheets/our-ransom')
  } else {
    if (!alreadyCalled.value && props.user.role === 'PVZ') {
      if (props.row.deliveredPVZ === null && props.row.deliveredSC !== null) {
        await updateDeliveryRow(props.row, "PVZ");
        toast.success('Товар принят на ПВЗ!');
        alreadyCalled.value = true;
      } else {
        toast.warning('Товар принят ранее или неотсортирован!');
      }
    }
  }

})

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

function printPage() {
  if (props.user.role === 'SORTIROVKA' || props.user.role === 'ADMIN') {
    window.print();
  } else {
    toast.error("Доступ к печати запрещён")
  }
}
</script>

<template>
  <h1 class="text-4xl">
    Запись: <span class="text-secondary-color">{{ row.id }} </span>
  </h1>
  <div class="mt-5 text-lg grid grid-cols-2 max-lg:flex max-lg:flex-col gap-5">
    <div class="grid grid-cols-2 border-2 max-lg:order-1 border-black p-3 border-dashed text-center">
      <h1>Телефон:</h1>
      <h1 v-if="link?.includes('1') || link?.includes('old') && row.fromName"
        class="cursor-pointer underline text-secondary-color duration-200 hover:opacity-50"
        @click="router.push(`/spreadsheets/order/${row.clientLink1}`)">
        {{ formatPhoneNumber(row.fromName) }}
      </h1>
      <h1 v-if="link?.includes(2) && row.fromName"
        class="cursor-pointer underline text-secondary-color duration-200 hover:opacity-50"
        @click="router.push(`/spreadsheets/order/${row.clientLink2}`)">
        {{ row.fromName }}
      </h1>
    </div>

    <div v-if="link?.includes('1') || link?.includes('old')"
      class="grid grid-cols-2 border-2 border-black p-3 border-dashed text-center max-lg:order-4">
      <h1>Доставлено на СЦ:</h1>
      <Icon @click="updateDeliveryRow(row, 'SC')" v-if="!row.deliveredSC &&
        user.dataOurRansom === 'WRITE' &&
        user.deliveredSC1 === 'WRITE'
        " class="text-green-500 mx-auto cursor-pointer hover:text-green-300 duration-200"
        name="mdi:checkbox-multiple-marked-circle" size="32" />
      <h1 class="font-bold text-green-500">
        {{ row.deliveredSC ? storeUsers.getNormalizedDate(row.deliveredSC) : "" }}
      </h1>
    </div>

    <div v-if="link?.includes(2)" class="grid grid-cols-2 border-2 border-black p-3 border-dashed text-center">
      <h1>Доставлено на СЦ:</h1>
      <Icon @click="updateDeliveryRow(row, 'SC'), printPage()" v-if="!row.deliveredSC &&
        user.dataClientRansom === 'WRITE' &&
        user.deliveredSC2 === 'WRITE'
        " class="text-green-500 mx-auto cursor-pointer hover:text-green-300 duration-200"
        name="mdi:checkbox-multiple-marked-circle" size="32" />
      <h1 class="font-bold text-green-500">
        {{ row.deliveredSC ? storeUsers.getNormalizedDate(row.deliveredSC) : "" }}
      </h1>
    </div>


    <div v-if="row.cell" class="grid grid-cols-2 border-2 border-black p-3 border-dashed text-center max-lg:order-2">
      <h1>Ячейка:</h1>
      <h1>{{ row.cell }}</h1>
    </div>

    <div v-if="link?.includes('1') || link?.includes('old')"
      class="grid grid-cols-2 border-2 border-black p-3 border-dashed text-center max-lg:order-5">
      <h1>Доставлено на ПВЗ:</h1>
      <Icon @click="updateDeliveryRow(row, 'PVZ')" v-if="!row.deliveredPVZ &&
        user.dataOurRansom === 'WRITE' &&
        user.deliveredPVZ1 === 'WRITE'
        " class="text-green-500 mx-auto cursor-pointer hover:text-green-300 duration-200"
        name="mdi:checkbox-multiple-marked-circle" size="32" />
      <h1 class="font-bold text-green-500">
        {{ row.deliveredPVZ ? storeUsers.getNormalizedDate(row.deliveredPVZ) : "" }}
      </h1>
    </div>

    <div v-if="link?.includes(2)" class="grid grid-cols-2 border-2 border-black p-3 border-dashed text-center">
      <h1>Доставлено на ПВЗ:</h1>
      <Icon @click="updateDeliveryRow(row, 'PVZ')" v-if="!row.deliveredPVZ &&
        user.dataClientRansom === 'WRITE' &&
        user.deliveredPVZ2 === 'WRITE'
        " class="text-green-500 mx-auto cursor-pointer hover:text-green-300 duration-200"
        name="mdi:checkbox-multiple-marked-circle" size="32" />
      <h1 class="font-bold text-green-500">
        {{ row.deliveredPVZ ? storeUsers.getNormalizedDate(row.deliveredPVZ) : "" }}
      </h1>
    </div>

    <div v-if="row.productName"
      class="grid grid-cols-2 border-2 border-black p-3 border-dashed text-center max-lg:order-3">
      <h1>Название товара:</h1>
      <h1>{{ row.productName }}</h1>
    </div>


    <div v-if="link?.includes('1') || link?.includes('old')"
      class="grid grid-cols-2 border-2 border-black p-3 border-dashed text-center max-lg:order-6">
      <h1>Выдан клиенту:</h1>
      <Icon @click="updateDeliveryRow(row, 'issued')"
        v-if="!row.issued && user.dataOurRansom === 'WRITE' && user.issued1 === 'WRITE'"
        class="text-green-500 mx-auto cursor-pointer hover:text-green-300 duration-200"
        name="mdi:checkbox-multiple-marked-circle" size="32" />
      <h1 class="font-bold text-green-500">
        {{ row.issued ? storeUsers.getNormalizedDate(row.issued) : "" }}
      </h1>
    </div>

    <div v-if="link?.includes(2)" class="grid grid-cols-2 border-2 border-black p-3 border-dashed text-center">
      <h1>Выдан клиенту:</h1>
      <Icon @click="updateDeliveryRow(row, 'issued')"
        v-if="!row.issued && user.dataClientRansom === 'WRITE' && user.issued2 === 'WRITE'"
        class="text-green-500 mx-auto cursor-pointer hover:text-green-300 duration-200"
        name="mdi:checkbox-multiple-marked-circle" size="32" />
      <h1 class="font-bold text-green-500">
        {{ row.issued ? storeUsers.getNormalizedDate(row.issued) : "" }}
      </h1>
    </div>
  </div>

  <div v-if="user.role === 'SORTIROVKA' || user.role === 'ADMIN'">
    <div class="flex items-center gap-5 mt-10">
      <h1 class="text-2xl">Распечатка Штрих кода</h1>
      <UIMainButton :disabled="row.deliveredSC === null" @click="printPage">РАСПЕЧАТАТЬ ЭТИКЕТКУ</UIMainButton>
    </div>
    <div class="flex flex-col print-content">
      <div class="gap-0 flex flex-col absolute mr-10">
        <CodeQR :value="value" class="mt-10" />
        <h1 class="text-base"> {{ row.id }} </h1>
        <h1 class="text-[140px] leading-[100px] max-w-[500px] text-center relative mb-3" v-if="row.cell">{{ row.cell }}</h1>
        <h1 class="text-8xl mt-2 text-center max-w-[500px] relative">{{ row.dispatchPVZ }}</h1>
      </div>
    </div>
  </div>
</template>


<style>
/* Стили для печати */
@media print {
  body * {
    visibility: hidden;
  }

  .print-content,
  .print-content * {
    visibility: visible;
  }

  .print-content {
    position: absolute;
    left: 15%;
    top: 10%;
  }
}
</style>
