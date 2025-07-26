
<template>
  <div class="post-container">
    <el-scrollbar height="600px" @end-reached="loadMore">
      <div v-for="post in posts" :key="post.id" class="post-card">
        <div class="post-header">
          <el-avatar :size="36" :src="post.image" />
          <div class="user-info">
            <span class="username">{{ post.username }}</span>
            <span class="post-time">{{ formatTime(post.lastReplyTime) }}</span>
          </div>
        </div>
        <div class="post-content">
          <h3 class="post-title">{{ post.title }}</h3>
          <!-- 修改这里：只显示前20个字符 -->
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

<script setup lang="ts" name="posts">
import { ref, onMounted } from 'vue'
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
}

// 使用类型Post[]初始化
const posts = ref<Post[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const noMoreData = ref(false)

// 内容截取函数
const truncateContent = (content: string | null | undefined) => {
  if (!content) return '';
  
  // 移除可能存在的HTML标签
  const plainText = content.replace(/<[^>]*>/g, '');
  
  // 截取前20个字符
  if (plainText.length > 20) {
    return plainText.slice(0, 20) + '...';
  }
  return plainText;
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

const fetchPosts = async () => {
  if (loading.value || noMoreData.value) return
  
  loading.value = true
  try {
    const response = await axios.get('http://localhost:8080/user/posts', {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value
      }
    })
    
    const newPosts = response.data.data.records
    console.log(newPosts)
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
    // 实际项目中这里应该添加用户提示
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (!loading.value && !noMoreData.value) {
    fetchPosts()
  }
}

onMounted(() => {
  fetchPosts()
})

//跳转帖子详情
//===========
</script>

<style scoped>
/* 添加样式使省略号更美观 */
.post-text {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 限制为两行 */
  -webkit-box-orient: vertical;
  max-height: 3em; /* 大约两行的高度 */
}

.post-container {
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 8px;
    max-width: 800px;
    margin: 0 auto;
}

.post-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    margin-bottom: 16px;
    padding: 16px;
    transition: all 0.3s ease;
    border-left: 3px solid #3498db;
}

.post-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.post-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
}

.user-info {
    margin-left: 12px;
    display: flex;
    flex-direction: column;
}

.username {
    font-weight: 600;
    font-size: 14px;
}

.post-time {
    font-size: 12px;
    color: #6c757d;
}

.post-content {
    margin-bottom: 12px;
}

.post-title {
    margin: 0 0 8px 0;
    font-size: 16px;
    color: #2c3e50;
}

.post-text {
    margin: 0;
    font-size: 14px;
    color: #495057;
    line-height: 1.5;
}

.post-stats {
    display: flex;
    border-top: 1px solid #e9ecef;
    padding-top: 12px;
    font-size: 13px;
    color: #6c757d;
}

.stat-item {
    display: flex;
    align-items: center;
    margin-right: 16px;
}

.stat-item .el-icon {
    margin-right: 4px;
}
.loading-indicator, .no-more-data {
  text-align: center;
  padding: 15px;
  color: #999;
}

.is-loading {
  animation: rotating 2s linear infinite;
  margin-right: 5px;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>