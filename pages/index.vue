<script lang="ts" setup>
import { YandexMap } from "vue-yandex-maps";

const router = useRouter();

const coordinates = ref([47.98958366983051, 37.8955255423278]);
const controls = [];

let selectedAddress = ref([47.98958366983051, 37.8955255423278]);
function changeAddress() {
  coordinates.value = selectedAddress.value;
}

definePageMeta({
  layout: false,
});

onBeforeMount(() => {
  router.push('/auth/login')
})
</script>

<template>
  <Head>
    <Title>SMARTSKLAD</Title>
  </Head>
  <NuxtLayout name="main-page">
    <div class="bg-main-page">
      <div class="py-5 max-md:px-5" v-cloak>
        <UIMainButton @click="router.push('/auth/login')">Войти</UIMainButton>
        <div class="flex items-center justify-center flex-col">
          <h1 class="text-secondary-color font-bold text-8xl max-lg:text-6xl mt-3">
            SMARTSKLAD
          </h1>
          <h1 class="text-secondary-color font-bold uppercase mt-3 max-md:text-center">
            Доставка из маркетплейсов WILDBERRIES, OZON, ЯНДЕКС МАРКЕТ И ДР.
          </h1>
          <h1 class="text-xl mt-5 max-md:text-center">
            по всем вопросам и для оформления заказа звоните:
          </h1>
          <h1 class="text-xl max-[500px]:mt-3 text-center">
            <a class="underline text-secondary-color hover:opacity-50 duration-200 mr-2" href="tel:+79496124760">
              +7(949)612-47-60
            </a>
            <br class="hidden max-[500px]:block" />
            Telegram, WhatsApp
          </h1>
        </div>
        <div class="flex items-center justify-between mt-24 max-xl:flex-col-reverse max-xl:gap-10 max-xl:mt-10">
          <div class="mb-24">
            <h1 class="text-center text-xl">Мы в Вконтакте и Telegram!</h1>
            <h1 class="text-center text-xl max-[500px]:hidden">
              Сканируй и присоединяйся к нам!
            </h1>
            <h1 class="text-center text-xl hidden max-[500px]:block">
              Кликай и присоединяйся к нам!
            </h1>
            <div class="flex items-center gap-10 mt-6 max-[500px]:justify-center">
              <div class="flex flex-col items-center">
                <img class="max-w-[160px] max-[500px]:hidden" src="../assets/images/qr_vk.png" alt="" />
                <a href="https://vk.com/daromproforyou" target="_blank">
                  <Icon name="mdi:vk" class="text-blue-500 hover:text-secondary-color duration-200" size="40" />
                </a>
              </div>
              <div class="flex flex-col items-center">
                <img class="max-w-[160px] max-[500px]:hidden" src="../assets/images/qr_tg.png" alt="" />
                <a href="https://t.me/DaromProForYou" target="_blank">
                  <Icon name="ic:baseline-telegram" class="mt-1 text-blue-500 hover:text-secondary-color duration-200"
                    size="40" />
                </a>
              </div>
            </div>
          </div>
          <div class="max-md:w-full">
            <h1 class="text-xl mb-3">Выберите адрес</h1>
            <select name="" id="" class="bg-transparent text-white border-2 border-secondary-color p-5 rounded-lg w-full"
              @change="changeAddress" v-model="selectedAddress">
              <option class="text-black" selected :value="[47.98958366983051, 37.8955255423278]">
                г. Донецк, Буденовский р-н, Заперевальная, ул. Антропова 16 (вход "ремонт
                обуви")
              </option>
              <option class="text-black" :value="[47.945142, 37.960908]">
                г. Донецк, ул. Нартова, 1. Возле магазина "Добрый"
              </option>
              <option class="text-black" :value="[47.955462, 37.964951]">
                г. Донецк, ул. Палладина, 20.
              </option>
            </select>
            <ClientOnly>
              <YandexMap style="width: 100%; height: 300px; margin-top: 20px" v-if="true" :coordinates="coordinates"
                :controls="controls" :zoom="18">
              </YandexMap>
            </ClientOnly>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
