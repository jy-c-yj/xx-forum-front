<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <search ref="searchComponent"></search>
      </el-header>
      <el-main>
        <!-- 搜索结果区域 -->
        <div v-if="loading">加载中...</div>
        <div v-else-if="error">{{ error }}</div>
        <div v-else>
          <h3>搜索关键词: "{{ searchKeyword }}"</h3>          
          <!-- 帖子搜索结果 -->
            <div v-if="results_Post.length === 0" class="no-results">未找到相关帖子</div>
            <div v-else class="results-container">
              <div v-for="item in results_Post" :key="item.id" class="result-item">
                <div class="post-header">
                  <span class="section-tag" @click.stop="pushSecDetail(item.sectionId)" >{{ item.sectionName }}</span>
                  <h4 class="post-title" @click="pushPostDetail(item.id)" >{{ item.title }}</h4>
                </div>
                <p class="post-content">{{ truncateContent(item.content) }}</p>
                <div class="post-footer">
                  <span class="post-time">{{ formatTime(item.createdTime) }}</span>
                </div>
              </div>
            </div>
            <!-- 帖子加载更多 -->
            <div class="load-more-container">
              <el-button 
                v-if="hasMorePost"
                @click="handleLoadMorePost"
                :disabled="isLoading"
                :loading="isLoading"
                class="load-more-btn"
              >
                加载更多
              </el-button>
              <p v-else-if="results_Post.length > 0" class="no-more-text">
                没有更多内容了
              </p>
            </div>
          </div>
      </el-main>
    </el-container>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute,useRouter } from 'vue-router';
import axios from 'axios';
import type { AxiosError } from 'axios';
import Search from '@/components/search.vue'  // 确保路径正确
import dayjs from 'dayjs';
import format from '@/hooks/format';

import { ElMessage } from 'element-plus';

const route = useRoute();
const isLoading = ref(false)
const hasMorePost = ref(true)
const hasMoreSection = ref(true)

// 定义搜索组件实例类型
interface SearchComponentInstance {
  searchText: string;
}

// 使用类型注解声明 ref
const searchComponent = ref<SearchComponentInstance | null>(null);



// 类型定义
type SearchResult_Post = {
  id: number;
  title: string;
  content: string;
  sectionId: number;
  sectionName: string;
  createdTime: string;
}



const router = useRouter()
const searchKeyword = ref('');
const sectionId = ref(0)
const results_Post = ref<SearchResult_Post[]>([]);

const loading = ref(false);
const error = ref('');
const pageNum_Post = ref(1) 
const pageSize_Post = ref(5) 

const {formatTime,truncateContent} = format()


const fetchSearchResults = async (keyword: string, sectionId: number , loadMore = false ) => {
  try {
    if (!loadMore) {
      // 如果是新搜索，重置分页
      pageNum_Post.value = 1;

      hasMorePost.value = true;

      results_Post.value = [];

    }
    
    loading.value = !loadMore; // 加载更多时不显示全局加载
    error.value = '';
    isLoading.value = loadMore;
    
    // 获取帖子结果
    const postsResponse = await axios.get(`http://localhost:8080/user/post/searchInSec?q=${encodeURIComponent(keyword)}`, {
      params: {
        id: sectionId,
        pageNum: pageNum_Post.value,
        pageSize: pageSize_Post.value    
      }
    });

    
    // 处理帖子结果
    const newPosts = postsResponse.data.data.records || [];
    if (loadMore) {
      results_Post.value = [...results_Post.value, ...newPosts];
    } else {
      results_Post.value = newPosts;
    }
    
    // 更新帖子分页状态
    hasMorePost.value = newPosts.length >= pageSize_Post.value;

    
  } catch (err) {
    const axiosError = err as AxiosError;
    if (axiosError.response?.status === 401) {
      error.value = '请登录后查看搜索结果';
    } else {
      error.value = '搜索失败，请稍后重试';
    }
    console.error('搜索错误:', err);
  } finally {
    loading.value = false;
    isLoading.value = false;
  }
};



// 初始化时执行搜索
onMounted(() => {
  if (route.query.q) {
    searchKeyword.value = route.query.q as string;

    const rawSectionId = route.query.s;
    let parsedSectionId = 0; // 默认值
    
    if (typeof rawSectionId === 'string') {
      const num = parseInt(rawSectionId, 10);
      if (!isNaN(num)) {
        parsedSectionId = num;
      }
    } else if (Array.isArray(rawSectionId)) {
      const firstItem = rawSectionId[0];
      if (typeof firstItem === 'string') {
        const num = parseInt(firstItem, 10);
        if (!isNaN(num)) {
          parsedSectionId = num;
        }
      }
    }
    
    sectionId.value = parsedSectionId;
    fetchSearchResults(route.query.q as string,sectionId.value);
  }
  
});


// 加载更多帖子
const handleLoadMorePost = () => {
    if (hasMorePost.value && !isLoading.value) {
    isLoading.value = true;
    pageNum_Post.value += 1;
    fetchSearchResults(searchKeyword.value, sectionId.value, true);
    }
};


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
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }

    body {
      background-color: #f5f7fa;
      color: #333;
      line-height: 1.6;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
    }

    /* 搜索头部 */
    .search-header {
      background-color: #fff;
      padding: 16px 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .search-box {
      display: flex;
      gap: 12px;
      align-items: center;
      max-width: 800px;
      margin: 0 auto;
      padding: 0 16px;
    }

    .search-input {
      flex: 1;
      padding: 10px 16px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      font-size: 14px;
      transition: border-color 0.3s;
    }

    .search-input:focus {
      outline: none;
      border-color: #409eff;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
    }

    .search-btn {
      background-color: #409eff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s;
    }

    .search-btn:hover {
      background-color: #66b1ff;
    }

    /* 内容区域 */
    .main-content {
      padding: 24px 0;
    }

    /* 搜索信息 */
    .search-info {
      margin-bottom: 24px;
      padding: 0 16px;
    }

    .search-keyword {
      font-size: 20px;
      font-weight: 500;
      margin-bottom: 16px;
    }

    .type-toggle {
      margin-bottom: 20px;
    }

    /* 结果列表 */
    .results-container {
      background-color: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .result-item {
      padding: 16px;
      border-bottom: 1px solid #f0f2f5;
      transition: background-color 0.2s;
    }

    .result-item:hover {
      background-color: #fafbfc;
    }

    .post-header {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }

    .section-tag {
      font-size: 12px;
      color: #409eff;
      background-color: #ecf5ff;
      padding: 2px 8px;
      border-radius: 4px;
      margin-right: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .section-tag:hover {
      background-color: #d9ecff;
    }

    .post-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      cursor: pointer;
      transition: color 0.2s;
    }

    .post-title:hover {
      color: #409eff;
    }

    .post-content {
      color: #666;
      font-size: 14px;
      margin-bottom: 8px;
      line-height: 1.5;
    }

    .post-footer {
      font-size: 12px;
      color: #999;
    }

    /* 加载更多 */
    .load-more-container {
      padding: 24px 0;
      text-align: center;
    }

    .load-more-btn {
      width: 100%;
      max-width: 300px;
      background-color: #f5f7fa;
      color: #606266;
      border: 1px solid #dcdfe6;
    }

    .load-more-btn:hover {
      background-color: #ecf5ff;
      color: #409eff;
      border-color: #c6e2ff;
    }

    .no-more-text {
      color: #999;
      font-size: 14px;
    }

    /* 无结果 */
    .no-results {
      text-align: center;
      padding: 40px 0;
      color: #999;
      font-size: 14px;
    }

    /* 加载和错误状态 */
    .loading-state {
      text-align: center;
      padding: 40px 0;
      color: #409eff;
      font-size: 16px;
    }

    .error-state {
      text-align: center;
      padding: 40px 0;
      color: #f56c6c;
      font-size: 16px;
    }

    /* 响应式调整
    @media (max-width: 768px) {
      .search-box {
        flex-direction: column;
        gap: 8px;
      }
      
      .search-input {
        width: 100%;
      }
      
      .search-btn {
        width: 100%;
      }
      
      .section-item {
        flex-direction: column;
        gap: 16px;
      }
      
      .follow-button {
        align-self: flex-start;
      }
    } */
  </style>