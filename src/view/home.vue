
<template>

  <div class="common-layout">

      <el-container >
        <el-aside width="300px">
          
          <Personal></Personal>
        </el-aside>
        <el-main>
             <search></search>
         
          <posts ></posts>
        </el-main>
        <el-aside width="300px">
          <hotSection></hotSection>
        </el-aside>
      </el-container>

  </div>


</template>



<script lang="ts" setup name="home">
import { ref } from 'vue'
import posts from '@/components/posts.vue'
import Personal from '@/components/personal.vue'
import meau from '@/components/meau.vue'
import search from '@/components/search.vue'
import hotSection from '@/components/hotSection.vue'


const input = ref('')



</script>

<style scoped>



.demo-type {
  display: flex;
}
.demo-type > div {
  flex: 1;
  text-align: center;
}

.demo-type > div:not(:last-child) {
  border-right: 1px solid var(--el-border-color);
}
</style>
 


