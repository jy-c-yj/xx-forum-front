<template>
  <div class="post-container">
    <el-scrollbar height="800px" @scroll="loadMore">
      <!-- 置顶帖子区域 -->
      <div v-if="pinnedPosts.length > 0" class="pinned-section">
        <div 
          v-for="post in pinnedPosts" 
          :key="'pinned-' + post.id" 
          class="post-card pinned-post"
          @click="viewPostDetail(post)"
        >
          <div class="post-header">
            <el-avatar :size="36" :src="post.image" />
            <div class="user-info">
              <span class="username">{{ post.username }}</span>
              <span class="post-time">{{ formatTime(post.lastReplyTime) }}</span>
            </div>
            <div class="pinned-badge">
              <el-icon><Top /></el-icon> 置顶
            </div>
          </div>
          <div class="post-content">
            <h3 class="post-title">
              <span class="pinned-tag">[置顶]</span> {{ post.title }}
            </h3>
            <p class="post-text">{{ truncateContent(post.content) }}</p>
          </div>
          <div class="post-stats">
            <span class="stat-item"><el-icon><View /></el-icon> {{ post.viewCount }}</span>
            <span class="stat-item"><el-icon><ChatDotRound /></el-icon> {{ post.replyCount }}</span>
            <span class="stat-item"><el-icon><Star /></el-icon> {{ post.collectCount }}</span>
          </div>
        </div>
      </div>
      
      <!-- 普通帖子区域 -->
      <div 
        v-for="post in normalPosts" 
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
import { ref, onMounted, defineProps, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { 
  View, 
  ChatDotRound, 
  Star,
  Loading,
  Top // 新增置顶图标
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

const router = useRouter()
const posts = ref<Post[]>([])
const pinnedPosts = ref<Post[]>([]) // 存储置顶帖子
const normalPosts = ref<Post[]>([]) // 存储普通帖子
const currentPage = ref(1)
const pageSize = ref(5)
const loading = ref(false)
const noMoreData = ref(false)
const sectionId = ref(-1)
const sortType = ref(1)

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
  axios.get('http://localhost:8080/user/addPostView', {
    params: { id: post.id, viewCount: post.viewCount },
    headers: { token: localStorage.getItem('token') || '' }
  })
  
  router.push({
    name: 'postdetail',
    params: { id: post.id }
  })
}

// 处理帖子数据，分离置顶帖和普通帖
const processPosts = (newPosts: Post[]) => {
  const pinned: Post[] = []
  const normal: Post[] = []
  
  newPosts.forEach(post => {
    if (post.isTop === 1) {
      pinned.push(post)
    } else {
      normal.push(post)
    }
  })
  
  // 保留之前的置顶帖，只添加新的置顶帖
  pinnedPosts.value = [...pinnedPosts.value, ...pinned]
  normalPosts.value = [...normalPosts.value, ...normal]
}

// 获取帖子数据
const fetchPosts = async () => {
  if (loading.value || noMoreData.value) return
  
  loading.value = true
  try {
    let response
    if (sectionId.value === -1) {
      // 查询热门帖子
      response = await axios.get('http://localhost:8080/user/posts', {
        params: { page: currentPage.value, pageSize: pageSize.value }
      })
    } else {
      // 查询板块内帖子（包含排序类型）
      response = await axios.get('http://localhost:8080/user/Secposts', {
        params: { 
          page: currentPage.value, 
          pageSize: pageSize.value, 
          sectionId: sectionId.value, 
          sortType: sortType.value 
        }
      })
    }
    
    const newPosts = response.data.data?.records || []
    if (newPosts.length === 0) {
      noMoreData.value = true
      return
    }
    
    // 处理新帖子数据
    processPosts(newPosts)
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

const loadMore = () => {
  if (!loading.value && !noMoreData.value) {
    fetchPosts()
  }
}

// 监听 props 变化
watch(() => props.sectionId, (newId) => {
  if (newId > 0) {
    console.log('收到新的板块ID:', newId)
    // 重置状态
    sectionId.value = newId
    currentPage.value = 1
    posts.value = []
    pinnedPosts.value = [] // 重置置顶帖
    normalPosts.value = [] // 重置普通帖
    noMoreData.value = false
    // 重新加载数据
    fetchPosts()
  }
})

watch(() => props.sortType, (newSortType) => {
  if (sectionId.value > 0) {
    console.log('收到新的排序类型:', newSortType)
    sortType.value = newSortType
    // 重置状态
    currentPage.value = 1
    pinnedPosts.value = [] // 重置置顶帖
    normalPosts.value = [] // 重置普通帖
    noMoreData.value = false
    // 重新加载数据
    fetchPosts()
  }
})

// 初始化
if (props.sectionId) {
  sectionId.value = props.sectionId
}
if (props.sortType) {
  sortType.value = props.sortType
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
  position: relative; /* 为置顶徽章定位做准备 */
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




/* 置顶帖子区域样式 */
.pinned-section {
  margin-bottom: 20px;
  border-bottom: 2px dashed #f0f0f0;
  padding-bottom: 16px;
}

/* 置顶帖子卡片样式 */
.pinned-post {
  position: relative;
  border-left: 4px solid #ffc107; /* 左侧黄色边框标识 */
  background-color: #fffdf5; /* 淡黄色背景 */
  box-shadow: 0 2px 6px rgba(255, 193, 7, 0.2); /* 黄色阴影 */
}

/* 置顶徽章样式 */
.pinned-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background-color: #ffc107;
  color: #fff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  z-index: 1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.pinned-badge .el-icon {
  margin-right: 4px;
  font-size: 14px;
}

/* 置顶标签样式 */
.pinned-tag {
  display: inline-block;
  background-color: #ffc107;
  color: #fff;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 600;
  margin-right: 8px;
  vertical-align: middle;
}

</style>


