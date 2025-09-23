<template>
  <el-table :data="tableData" border style="width: 100%"  >
    <el-table-column label="板块名" width="480">
      <template #default="scope">
        <span class="post-title" @click="pushSecDetail(scope.row.id)">
          {{ scope.row.sectionName}}
        </span>
      </template>
    </el-table-column>

    <el-table-column prop="id" fixed="right" label="管理" min-width="120">
      <template #default="{row}">
        <el-button link type="primary" size="small" @click="handleClick(row.id)">
          <el-icon><Setting /></el-icon>
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter , useRoute } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'

interface Follow{
    id : number,
    sectionName : string,
}
const router = useRouter()
const tableData = ref<Follow[]>([])

onMounted(()=>{
  if(!localStorage.getItem('token')){
    ElMessage.error('还未登陆')
    return
  }

  refashtableDate()
})



const refashtableDate = async ()=>{

  try{
    const response = await axios.get('http://localhost:8080/user/myInformation/manageSections',{
    headers :{
      token : localStorage.getItem('token')
    } 
  })

  if(response.data.code === 1){

    tableData.value = response.data.data

  }else{
    ElMessage.error(response.data.msg || '出现未知错误')
  }


  }catch{
    ElMessage.error('出现未知错误')
  }
}


const handleClick = (id : number) => {
  console.log('click')
  setSections(id)

}

// 管理板块
const setSections = async (sectionId: number) => {

  const route = router.resolve({
    name: 'setSections',
    params: {
      sectionId : sectionId
    }
  });
  window.open(route.href, '_blank')

}

//跳转板块详情
const pushSecDetail = (sectionId: number) => {
  router.push({
    name: 'section',
    params: { id: sectionId },
  })
}
</script>

<style scoped>
  /* 为标题添加可点击样式 */
.post-title {
  cursor: pointer;
  color: #409EFF;
  transition: all 0.3s;
}

.post-title:hover {
  color: #66b1ff;
  text-decoration: underline;
  transform: translateX(2px);
}


</style>