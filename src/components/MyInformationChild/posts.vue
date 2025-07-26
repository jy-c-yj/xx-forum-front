<template>
  <!-- 发帖列表容器 -->
  <div class="posts-container">
    <!-- 单个发帖项 -->
    <div 
      v-for="post in posts" 
      :key="post.id"
      class="post-item"
    >
      <!-- 板块信息 -->
      <div class="section-info">
        <span>在</span>
        <span 
          class="section-link"
          @click.stop="pushSecDetail(post.sectionId)"
        >
          {{ post.sectionName }}板块
        </span>
        <span>发帖</span>
      </div>
      
      <!-- 帖子标题 -->
      <h3 
        class="post-title"
        @click="pushPostDetail(post.id)"
      >
        {{ post.title }}
      </h3>
      
      <!-- 元信息 -->
      <div class="meta-info">
        <span class="replies-count">回复({{ post.replyCount }})</span>
        <span class="divider">•</span>
        <span class="timestamp">{{ formatTime(post.createdTime) }}</span>
      </div>
    </div>
    
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
      <p v-else-if="!hasMore && posts.length > 0" class="no-more-text">
        没有更多内容了
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute ,useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import type { AxiosError } from 'axios'
import format from '@/hooks/format'

interface Posts{
  id :number,
  title :string,
  replyCount : number,
  createdTime : string,
  sectionId :number,
  sectionName : string
}


const posts = ref<Posts[]>([])
const pageNum = ref(1)
const pageSize = ref(5)
const error = ref<string | null>(null);
const router = useRouter()
const isLoading = ref(false)
const hasMore = ref(true)
const {formatTime,truncateContent} = format()



onMounted(()=>{
  refashPostsData()
})

const refashPostsData = async()=>{
  if(!localStorage.getItem('token')){
      ElMessage.error('请登陆')
      return
    }
    try{

      const response =await axios.get('http://localhost:8080/user/myInformation/myPost',{
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
          posts.value = response.data.data.records
        } else {
          
          posts.value.push(...response.data.data.records)

        }
        hasMore.value = response.data.data.total > posts.value.length

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
    refashPostsData()
  }
}

//跳转板块详情
const pushSecDetail = (sectionId: number) => {
  router.push({
    name: 'section',
    params: { id: sectionId },
  })
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
.load-more-container {
  text-align: center;
  padding: 20px 0 10px;
}

.load-more-btn {
  width: 200px;
  background-color: transparent;
  border: 1px solid #dcdfe6;
  color: #606266;
}

.load-more-btn:hover {
  border-color: #c6e2ff;
  color: #409eff;
}

.no-more-text {
  color: #c0c4cc; /* 更柔和的提示文字 */
  text-align: center;
  padding: 15px 0;
  font-size: 13px;
}
/* 整体容器 */
.posts-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 15px;
}

/* 单个发帖项样式 */
.post-item {
  padding: 16px 0;
  border-bottom: 1px solid #eee;
}

/* 板块信息 */
.section-info {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.section-link {
  color: #06c;
  cursor: pointer;
  font-weight: 500;
  margin: 0 4px;
}

.section-link:hover {
  text-decoration: underline;
}

/* 帖子标题 */
.post-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px;
  color: #1a0dab;
  cursor: pointer;
  line-height: 1.4;
}

.post-title:hover {
  text-decoration: underline;
}

/* 元信息 */
.meta-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
}

.replies-count {
  color: #666;
}

.divider {
  color: #bbb;
}

.timestamp {
  color: #888;
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