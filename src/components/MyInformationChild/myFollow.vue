<template>
  <el-table :data="tableData" border style="width: 100%">
    <el-table-column prop="sectionName" label="板块名" width="180" />
    <el-table-column prop="xp" label="经验值" width="180" />
    <el-table-column prop="grade" label="等级" />
    <el-table-column prop="id" fixed="right" label="取消关注" min-width="120">
      <template #default="{row}">
        <el-button link type="primary" size="small" @click="handleClick(row.id)">
          <el-icon><Close /></el-icon>
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'

interface Follow{
    id : number,
    sectionName : string,
    grade : number,
    xp : number
}

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
    const response = await axios.get('http://localhost:8080/user/myInformation/myFollow',{
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
  unfollowSec(id)

}

// 取消关注
const unfollowSec = async (sectionId: number) => {
  try {
    const response = await axios.delete(
      'http://localhost:8080/user/sections/unfollowSec',
      {
        params: { sectionId },
        headers: { token: localStorage.getItem('token') || '' }
      }
    )

    if (response.data.code === 1) {
      ElMessage.success('取消关注成功')
      //删除tableData中对应的板块
      tableData.value = tableData.value.filter(item => item.id !== sectionId)
      
    } else {
      ElMessage.error(response.data.msg || '取消关注失败')
    }
  } catch  {
      ElMessage.error('出现未知错误')
  }
}
</script>