<script setup lang="ts">
import type { PropType } from "vue";
import { read, utils, writeFile } from "xlsx";

const storeUsers = useUsersStore();

const emit = defineEmits([
  "openModal",
  "updateDeliveryRow",
]);

function updateDeliveryRow(row: IBalance, flag: string) {
  emit("updateDeliveryRow", { row: row, flag: flag });
}

function openModal(row: IBalance) {
  emit("openModal", row);
}

defineProps({
  user: { type: Object as PropType<User>, required: true },
  rows: { type: Array as PropType<IBalance[]> },
});

const showDeletedRows = ref(false);

const toggleShowDeletedRows = () => {
  showDeletedRows.value = !showDeletedRows.value;
};

onMounted(() => {
})


</script>
<template>
  <div class="relative max-h-[610px] mt-5 mb-10">
    <div id="up"></div>
    <table id="theTable" class="w-full border-x-2 border-gray-50 text-sm text-left rtl:text-right text-gray-500">
      <thead class="text-xs sticky top-0 z-30 text-gray-700 uppercase text-center bg-gray-50">
        <tr>
          <th scope="col" class="exclude-row border-2" v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'">
            изменение
          </th>
          <th scope="col" class="border-2">
            ПВЗ
          </th>
          <th scope="col" class="border-2">
            Сумма
          </th>
          <th scope="col" class="border-2">
            Выдано
          </th>
          <th scope="col" class="border-2">
            Получено
          </th>
          <th scope="col" class="border-2" v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'">
            Кем создано
          </th>
          <th scope="col" class="border-2">
            Кем выдано
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" class="text-center">
          <td class="border-2" v-if="user.role !== 'PVZ'">
            <Icon @click="openModal(row)" class="text-green-600 cursor-pointer hover:text-green-300 duration-200"
              name="material-symbols:edit" size="32"
              v-if="(user.role === 'ADMIN' || user.role === 'ADMINISTRATOR') && !row.issued && !row.received" />
          </td>
          <th scope="row" class="border-2">
            {{ row.pvz }}
          </th>
          <th scope="row" class="border-2">
            {{ row.sum }}
          </th>
          <td class="border-2 whitespace-nowrap">
            <Icon @click="updateDeliveryRow(row, 'issued')" v-if="!row.issued && user.role === 'PVZ'"
              class="text-green-500 cursor-pointer hover:text-green-300 duration-200"
              name="mdi:checkbox-multiple-marked-circle" size="32" />
            <h1 class="font-bold text-green-500">
              {{ row.issued ? storeUsers.getNormalizedDate(row.issued) : "" }}
            </h1>
          </td>
          <td class="border-2 whitespace-nowrap">
            <Icon @click="updateDeliveryRow(row, 'received')"
              v-if="!row.received && (user.role === 'ADMIN' || user.role === 'ADMINISTRATOR')"
              class="text-green-500 cursor-pointer hover:text-green-300 duration-200"
              name="mdi:checkbox-multiple-marked-circle" size="32" />
            <h1 class="font-bold text-green-500">
              {{ row.received ? storeUsers.getNormalizedDate(row.received) : "" }}
            </h1>
          </td>
          <th scope="row" class="border-2" v-if="user.role === 'ADMIN' || user.role === 'ADMINISTRATOR'">
            {{ row.createdUser }}
          </th>
          <th scope="row" class="border-2">
            {{ row.receivedUser }}
          </th>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.hidden-row {
  display: none !important;
}
</style>
