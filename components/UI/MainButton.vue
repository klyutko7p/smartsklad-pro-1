<script lang="ts" setup>

defineProps({
  disabled: {type: Boolean}
})

</script>


<template>
  <button :disabled="disabled" class="button-87 disabled:opacity-50 disabled:cursor-not-allowed" role="button">
    <slot/>
  </button>
</template>

<style scoped>
.button-87 {
  padding: 5px 10px;
  text-align: center;
  text-transform: uppercase;
  font-size: 14px;
  transition: 0.5s;
  background-size: 200% auto;
  color: white;
  border-radius: 10px;
  display: block;
  border: 0px;
  font-weight: 700;
  box-shadow: 0px 0px 14px -7px #f09819;
  background-image: linear-gradient(45deg, #FF512F 0%, #F09819  51%, #FF512F  100%);
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.button-87:hover {
  background-position: right center;
  /* change the direction of the change here */
  color: #fff;
  text-decoration: none;
}

.button-87:active {
  transform: scale(0.95);
}
</style>
