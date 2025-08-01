<template>
  <div class="post-container">

    <el-scrollbar  height="800px"  @scroll="loadMore">
      <div 
        v-for="post in posts" 
        :key="post.id" 
        class="post-card"
        @click="viewPostDetail(post)"
      >
        <div class="post-header">
          <el-avatar :size="36" :src="post.image" />
          <div class="user-info">
            <span class="username">{{ post.username }}</span>
            <span class="post-time">{{ formatTime(post.lastReplyTime) }}</span>
          </div>
        </div>
        <div class="post-content">
          <h3 class="post-title">{{ post.title }}</h3>
          <p class="post-text">{{ truncateContent(post.content) }}</p>
        </div>
        <div class="post-stats">
          <span class="stat-item"><el-icon><View /></el-icon> {{ post.viewCount }}</span>
          <span class="stat-item"><el-icon><ChatDotRound /></el-icon> {{ post.replyCount }}</span>
          <span class="stat-item"><el-icon><Star /></el-icon> {{ post.collectCount }}</span>
        </div>
      </div>
      <div v-if="loading" class="loading-indicator">
        <el-icon class="is-loading"><Loading /></el-icon>
        加载中...
      </div>
      <div v-if="noMoreData" class="no-more-data">
        没有更多数据了
      </div>
    </el-scrollbar>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { 
  View, 
  ChatDotRound, 
  Star,
  Loading
} from '@element-plus/icons-vue'

// 定义帖子数据类型
interface Post {
  id: number
  image: string
  username: string
  lastReplyTime: string
  title: string
  content: string
  viewCount: number
  replyCount: number
  collectCount: number
  isTop: number
}

// 定义 props
const props = defineProps({
  sectionId: {
    type: Number,
    default: 0
  },
  sortType: {
    type: Number,
    default: 0
  }
})

// 监听 sectionId 变化
watch(() => props.sectionId, (newId) => {
  if (newId > 0) {
    console.log('收到新的板块ID:', newId)
    // 重置状态
    currentPage.value = 1
    posts.value = []
    noMoreData.value = false
    // 重新加载数据
    fetchPosts()
  }
})
const router = useRouter()
const posts = ref<Post[]>([])
const currentPage = ref(1)
const pageSize = ref(5)
const loading = ref(false)
const noMoreData = ref(false)
const sectionId = ref(-1)
const sortType = ref(1)

console.log("props ===== >",props.sectionId)
if(props.sectionId){
  sectionId.value = props.sectionId
}
if(props.sortType){
  sortType.value = props.sortType
}

// 内容截取函数
const truncateContent = (content: string | null | undefined) => {
  if (!content) return '';
  const plainText = content.replace(/<[^>]*>/g, '');
  return plainText.length > 20 ? plainText.slice(0, 20) + '...' : plainText;
}

// 时间格式化函数
const formatTime = (time: string | null | undefined) => {
  if (!time) return '';
  try {
    const date = new Date(time);
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit'
    });
  } catch (e) {
    console.error('时间格式化错误:', e);
    return time;
  }
}

// 查看帖子详情
const viewPostDetail = (post: Post) => {



    axios.get('http://localhost:8080/user/addPostView',
      {
      params: { id : post.id ,
                viewCount : post.viewCount
      },
      headers: {
        token: localStorage.getItem('token') || ''
      }
    }
    )


    
  
  router.push({
    name: 'postdetail',
    params: { 
      id: post.id,
    }
  })
}

const fetchPosts = async () => {
  if (loading.value || noMoreData.value) return
  
  loading.value = true
  if(sectionId.value === -1){
    console.log("查询热门帖子======sectionId ===> ",sectionId)
      try {
      const response = await axios.get('http://localhost:8080/user/posts', {
        params: { page: currentPage.value, pageSize: pageSize.value }
      })
      
      const newPosts = response.data.data.records
      if (newPosts.length === 0) {
        noMoreData.value = true
        return
      }
      
      posts.value = [...posts.value, ...newPosts]
      currentPage.value++
      
      if (newPosts.length < pageSize.value) {
        noMoreData.value = true
      }
    } catch (error) {
      console.error('获取帖子数据失败:', error)
    } finally { 
      loading.value = false
    }
  }else{
    console.log("查询板块内热门帖子======sectionId ===> ",sectionId.value)
      try {
      const response = await axios.get('http://localhost:8080/user/Secposts', {
        params: { page: currentPage.value, pageSize: pageSize.value , sectionId : sectionId.value, sortType : sortType.value}
      })
      
      const newPosts = response.data.data.records
      if (newPosts.length === 0) {
        noMoreData.value = true
        return
      }
      
      posts.value = [...posts.value, ...newPosts]
      currentPage.value++
      
      if (newPosts.length < pageSize.value) {
        noMoreData.value = true
      }
    } catch (error) {
      console.error('获取帖子数据失败:', error)
    } finally { 
      loading.value = false
    }
  }
}

const loadMore = () => {
 
  if (!loading.value && !noMoreData.value) {
    console.log("继续加载")
    fetchPosts()
  }
}

onMounted(() => {
  fetchPosts()
})


</script>
<style scoped>
.post-container {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.post-card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.25s ease;
  cursor: pointer;
  border: 1px solid #f0f0f0;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-color: #e0e0e0;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  flex-direction: column;
  margin-left: 12px;
}

.username {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.post-time {
  font-size: 12px;
  color: #9a9a9a;
  margin-top: 2px;
}

.post-content {
  margin-bottom: 16px;
}

.post-title {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin: 0 0 8px 0;
}

.post-text {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

.post-stats {
  display: flex;
  align-items: center;
  border-top: 1px solid #f5f5f5;
  padding-top: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #999;
  margin-right: 20px;
}

.stat-item .el-icon {
  margin-right: 4px;
  font-size: 14px;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  color: #999;
}

.loading-indicator .el-icon {
  margin-right: 8px;
  animation: rotating 1.5s linear infinite;
}

.no-more-data {
  text-align: center;
  padding: 16px;
  color: #999;
  font-size: 14px;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>


