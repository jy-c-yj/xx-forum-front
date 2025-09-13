<template>
asdasdasd {{ sectionId }}

</template>

<script setup lang="ts">
import { useRoute,useRouter } from 'vue-router';
import { ref,reactive } from 'vue';
import { defineProps } from 'vue';

const sectionId = defineProps(['sectionId'])

type Section = {
  id:number
  name:string
  description:string
  background_image:string  //板块背景
  followers_count:string
  created_time:string
  post_count:number
  image:string //板块头像
}
console.log(sectionId)

const section = ref<Section>()
</script>

<style scoped></style>