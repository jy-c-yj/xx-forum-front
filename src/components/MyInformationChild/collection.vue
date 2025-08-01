<template>
  <el-table :data="tableData" style="width: 100%">
    <el-table-column label="收藏时间" width="180">

      <template #default="scope">
        <span class="collect-time" >
          {{ formatTime(scope.row.createdTime) }}
        </span>
      </template>
    </el-table-column>

    <el-table-column prop="userName" label="作者" width="180" />
    <el-table-column label="标题">
      <template #default="scope">
        <span class="post-title" @click="pushPostDetail(scope.row.id)">
          {{ scope.row.title }}
        </span>
      </template>
    </el-table-column>
  </el-table>
  <!-- 加载更多 -->
    <div class="load-more-container">
      <el-button 
        v-if="hasMore"
        @click="handleLoadMore"
        :disabled="isLoading"
        :loading="isLoading"
        class="load-more-btn"
      >
        加载更多
      </el-button>
      <p v-else-if="!hasMore && tableData.length > 0" class="no-more-text">
        没有更多内容了
      </p>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute , useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import format from '@/hooks/format'
import type { AxiosError } from 'axios'

const {formatTime} = format()

interface Collection{
  id : number
  title : string
  createdTime : string
  userId : number
  userName : string
}

const pageNum = ref(1)
const pageSize = ref(5)
const error = ref<string | null>(null);
const router = useRouter()
const isLoading = ref(false)
const hasMore = ref(true)

const tableData = ref<Collection[]>([])



onMounted(()=>{
  refashData()
})

const refashData = async()=>{
  if(!localStorage.getItem('token')){
      ElMessage.error('请登陆')
      return
    }
    try{

      const response =await axios.get('http://localhost:8080/user/myInformation/myCollection',{
        params: {
          pageNum: pageNum.value,
          pageSize: pageSize.value
        },
        headers: {
          token: localStorage.getItem('token')
        }
      })

      if(response.data.code === 1){

        if (pageNum.value === 1) {
          tableData.value = response.data.data.records
        } else {
          
          tableData.value.push(...response.data.data.records)

        }
        hasMore.value = response.data.data.total > tableData.value.length

      }else{
        ElMessage.error(response.data.msg)
        error.value = `获取数据失败: ${response.data.msg || '未知错误'}`;
      }

    }catch (err) {
    const axiosError = err as AxiosError;
    error.value = `网络请求失败: ${axiosError.message}`;
    console.error('API请求错误:', axiosError);
  }

}

//加载更多
const handleLoadMore = () => {
  if (hasMore.value && !isLoading.value) {
    pageNum.value += 1
    refashData()
  }
}

//跳转帖子详情
const pushPostDetail = (postId: number) => {
  axios.get('http://localhost:8080/user/addPostView', {
    params: { id: postId, viewCount: -1 },
    headers: { token: localStorage.getItem('token') || '' }
  })

  router.push({
    name: 'postdetail',
    params: { id: postId },
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

/* 可选：添加图标 */
.post-title::before {
  content: "📝 ";
}


/* 加载更多样式 */
.load-more-container {
  text-align: center;
  padding: 25px 0 15px;
}

.load-more-btn {
  width: 200px;
  background-color: transparent;
  border: 1px solid #dcdfe6;
  color: #606266;
  transition: all 0.3s;
}

.load-more-btn:hover {
  border-color: #c6e2ff;
  color: #409eff;
  background-color: #f5f9ff;
}

.no-more-text {
  color: #999;
  font-size: 13px;
  padding: 10px 0;
}
</style>