<template>
     <el-container>
      <el-header>
        <meau></meau>
        
      </el-header>
     <RouterView></RouterView>
      </el-container>
   


</template>
<script setup name="App" lang="ts" >
import { RouterLink, RouterView } from 'vue-router'
import meau from '@/components/meau.vue'
import search from '@/components/search.vue'
     
document.title="xx-forum"
</script>




<style scoped>

</style>
