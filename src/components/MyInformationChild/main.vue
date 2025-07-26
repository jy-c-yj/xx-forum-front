<template>
  <div class="home-container">
    <!-- 常看板块区域 -->
    <section class="section-container">
      <h3>常看的板块</h3>
      <div class="sections-grid">
        <el-button 
          v-for="section in sections" 
          :key="section.id"
          @click="pushSection(section.id)"
          class="section-btn"
        >
          {{ section.sectionName }}
        </el-button>
      </div>
    </section>

    <!-- 热门动态区域 -->
    <section class="posts-container">
      <h3>热门动态</h3>
      
      <!-- 帖子卡片 -->
      <div 
        v-for="post in posts" 
        :key="post.id"
        class="post-card"
      >
        <div class="post-header" @click="pushSection(post.sectionId)">
          <img 
            v-if="post.sectionImage" 
            :src="post.sectionImage" 
            alt="板块图片" 
            class="section-img"
          />
          <span class="section-name">{{ post.sectionName }}</span>
          <span class="post-time">{{ formatTime(post.createdTime) }}</span>
        </div>
        
        <h4 class="post-title" @click="pushPostdetail(post.id)">
          {{ post.title }}
        </h4>
        
        <p class="post-content">
          {{ truncateContent(post.content) }}
        </p>
        
        <div class="post-footer">
          <span class="post-author">{{ post.userName }}</span>
          <span class="post-replies">
            <i class="el-icon-chat-dot-round"></i>
            {{ post.replyCount }}
          </span>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-container">
        <i class="el-icon-loading"></i>
        <span>加载中...</span>
      </div>
      
      <!-- 加载更多按钮 -->
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
    </section>
  </div>
</template>

<script setup lang="ts" name="Main">
import axios from 'axios';
import type { AxiosError } from 'axios'
import { ElMessage } from 'element-plus';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import format from '@/hooks/format';

interface Secs {
  id: number
  sectionName: string
}

interface Posts {
  id: number
  title: string           // 帖子标题
  content: string         // 帖子内容
  userId: number
  userName: string
  createdTime: string
  replyCount: number
  sectionId: number
  sectionName: string
  sectionImage: string
}

const { formatTime, truncateContent } = format()
const router = useRouter()
const error = ref<string | null>(null);
const page = ref(1)
const pageSize = ref(5)
const sections = ref<Secs[]>([])
const posts = ref<Posts[]>([])
const isLoading = ref(false)
const hasMore = ref(true)

onMounted(() => {
  if (!localStorage.getItem('token')) {
    ElMessage.error('请登陆')
    return
  }
  refreshPostsData()
  refreshSecsData()
})

const refreshPostsData = async () => {
  try {
    isLoading.value = true
    const response = await axios.get('http://localhost:8080/user/myInformation/main/posts', {
      params: {
        page: page.value,
        pageSize: pageSize.value
      },
      headers: {
        token: localStorage.getItem('token')
      }
    })

    if (response.data.code === 1) {
      if (page.value === 1) {
        posts.value = response.data.data.records
      } else {
        
        posts.value.push(...response.data.data.records)
      }
      hasMore.value = response.data.data.total > posts.value.length
    } else {
      ElMessage.error(response.data.msg)
      error.value = `获取数据失败: ${response.data.msg || '未知错误'}`;
    }
  } catch (err) {
    const axiosError = err as AxiosError;
    error.value = `网络请求失败: ${axiosError.message}`;
    console.error('API请求错误:', axiosError);
  } finally {
    isLoading.value = false
  }
}

const refreshSecsData = async () => {
  try {
    const response = await axios.get('http://localhost:8080/user/myInformation/main/sections', {
      headers: {
        token: localStorage.getItem('token')
      }
    })

    if (response.data.code === 1) {
      sections.value = response.data.data
    } else {
      ElMessage.error(response.data.msg)
      error.value = `获取数据失败: ${response.data.msg || '未知错误'}`;
    }
  } catch (err) {
    const axiosError = err as AxiosError;
    error.value = `网络请求失败: ${axiosError.message}`;
    console.error('API请求错误:', axiosError);
  }
}

const pushSection = (sectionId: number) => {
  router.push({
    name: 'section',
    params: { id: sectionId },
  })
}

const pushPostdetail = (postId: number) => {
  axios.get('http://localhost:8080/user/addPostView', {
    params: { id: postId, viewCount: -1 },
    headers: { token: localStorage.getItem('token') || '' }
  })

  router.push({
    name: 'postdetail',
    params: { id: postId },
  })
}

const handleLoadMore = () => {
  if (hasMore.value && !isLoading.value) {
    page.value += 1
    refreshPostsData()
  }
}
</script>

<style scoped>
.home-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

/* 移除常看板块的阴影和背景 */
.section-container {
  margin-bottom: 30px;
  padding: 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
}

.sections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.section-btn {
  width: 100%;
  background-color: transparent;
  border: 1px solid #e4e7ed;
  color: #606266;
  transition: all 0.3s;
}

.section-btn:hover {
  border-color: #c6e2ff;
  background-color: #ecf5ff;
  color: #409eff;
}

/* 移除热门动态区域的阴影 */
.posts-container {
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
}

/* 优化帖子卡片的分割线 */
.post-card {
  padding: 16px 0;
  border-bottom: 1px solid #f0f2f5; /* 更浅的分割线 */
  transition: background 0.3s;
}

.post-card:hover {
  background: #fafafa; /* 更浅的悬停背景 */
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: #909399; /* 更柔和的文字颜色 */
  font-size: 13px;
}

.section-img {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  margin-right: 8px;
  object-fit: cover;
}

.section-name {
  font-weight: 500;
  margin-right: 12px;
  color: #409EFF;
}

.post-time {
  margin-left: auto;
  color: #c0c4cc; /* 更浅的时间文字 */
}

.post-title {
  font-size: 16px;
  font-weight: 600;
  margin: 8px 0 10px;
  color: #303133;
  line-height: 1.4;
  transition: color 0.2s;
}

.post-title:hover {
  color: #409EFF;
}

.post-content {
  color: #606266; /* 更柔和的正文颜色 */
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  color: #909399; /* 更柔和的页脚颜色 */
  font-size: 13px;
}

.post-author {
  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-replies {
  display: flex;
  align-items: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
  color: #c0c4cc; /* 更柔和的加载文字 */
}

.el-icon-loading {
  font-size: 24px;
  margin-bottom: 10px;
  color: #c0c4cc;
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

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

/* 移除标题的边框感 */
h3 {
  font-weight: 500;
  color: #303133;
  margin-bottom: 15px;
  padding-bottom: 8px;
  position: relative;
}

h3::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 2px;
  background: #409eff;
  border-radius: 1px;
}
</style>