<template>
  <!-- 回复列表容器 -->
  <div class="replies-container">
    <!-- 单个回复项 -->
    <div 
      v-for="reply in replies" 
      :key="reply.id"
      class="reply-item"
      @click="pushPostDetail(reply.postId)"
    >
      <!-- 内容区 -->
      <div class="content-section">
        <p class="content-text">{{ truncateContent(reply.content) }}</p>
        <div class="meta-info">
          <span class="timestamp">{{ formatTime(reply.createdTime) }}</span>
          <span>回复了</span>
        </div>
      </div>
      
      <!-- 帖子信息区 -->
      <div class="post-info">
        <p class="post-title">{{ reply.title }}</p>
        <div class="section-info">
          <span>来自</span>
          <span 
            class="section-link"
            @click.stop="pushSecDetail(reply.sectionId)"
          >
            {{ reply.sectionName }}
          </span>
        </div>
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
      <p v-else-if="!hasMore && replies.length > 0" class="no-more-text">
        没有更多内容了
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute ,useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import type { AxiosError } from 'axios'
import format from '@/hooks/format'

interface Reply{
  id : number,
  content : string,
  createdTime : string,
  postId : number,
  title : string,
  replyCount : string,
  sectionId :number,
  sectionName : string

}

const replies = ref<Reply[]>([])
const pageNum = ref(1)
const pageSize = ref(5)
const error = ref<string | null>(null);
const router = useRouter()
const isLoading = ref(false)
const hasMore = ref(true)
const {formatTime,truncateContent} = format()



onMounted(()=>{
  refashRepliesData()
})

const refashRepliesData = async()=>{
  if(!localStorage.getItem('token')){
      ElMessage.error('请登陆')
      return
    }
    try{

      const response =await axios.get('http://localhost:8080/user/myInformation/myReply',{
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
          replies.value = response.data.data.records
        } else {
          
          replies.value.push(...response.data.data.records)

        }
        hasMore.value = response.data.data.total > replies.value.length

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
    refashRepliesData()
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
.replies-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 15px;
}

/* 单个回复项样式 */
.reply-item {
  padding: 16px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background 0.3s;
}

.reply-item:hover {
  background-color: #f9f9f9;
}

/* 内容区域 */
.content-section {
  margin-bottom: 12px;
}

.content-text {
  font-size: 15px;
  line-height: 1.5;
  color: #333;
  margin-bottom: 8px;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #888;
}

/* 帖子信息 */
.post-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-title {
  font-weight: 600;
  color: #1a0dab;
  margin: 0;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 70%;
}

.post-title:hover {
  text-decoration: underline;
}

.section-info {
  font-size: 13px;
  color: #666;
}

.section-link {
  color: #06c;
  cursor: pointer;
  margin-left: 4px;
}

.section-link:hover {
  text-decoration: underline;
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
