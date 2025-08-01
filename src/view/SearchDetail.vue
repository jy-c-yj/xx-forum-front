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
          <div class="my-2 ml-4">
            <el-radio-group v-model="searchType" @change="handleTypeChange">
              <el-radio label="post">帖子</el-radio>
              <el-radio label="section">板块</el-radio>
            </el-radio-group>
          </div>
          
          <!-- 帖子搜索结果 -->
          <div v-if="searchType === 'post'">
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
          
          <!-- 板块搜索结果 -->
          <div v-if="searchType === 'section'">
            <div v-if="results_Section.length === 0" class="no-results">未找到相关板块</div>
            <div v-else class="section-results">
              <div v-for="item in results_Section" :key="item.id" class="section-item">
                <div class="section-info" >
                  <img :src="item.image || '/default-section.png'" alt="板块图标" class="section-image" @click.stop="pushSecDetail(item.id)" />
                  <div class="section-details">
                    <h4 class="section-name" @click.stop="pushSecDetail(item.id)" >{{ item.name }}</h4>
                    <p class="section-description">{{ item.description }}</p>
                    <div class="section-stats">
                      <span>关注: {{ item.followersCount }}</span>
                      <span>帖子: {{ item.postCount }}</span>
                    </div>
                  </div>
                </div>
                <el-button 
                  type="primary" 
                  class="follow-button" 
                  @click="handleFollow(item)"
                  :loading="item.loading"
                >
                  {{ item.isFollowed ? '已关注' : '关注' }}
                </el-button>
              </div>
            </div>
            <!-- 板块加载更多 -->
            <div class="load-more-container">
              <el-button 
                v-if="hasMoreSection"
                @click="handleLoadMoreSection"
                :disabled="isLoading"
                :loading="isLoading"
                class="load-more-btn"
              >
                加载更多
              </el-button>
              <p v-else-if="results_Section.length > 0" class="no-more-text">
                没有更多内容了
              </p>
            </div>
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
import SectionFollow from '@/hooks/SectionFollow';
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

// 搜索类型控制
const searchType = ref<'post' | 'section'>('post');

// 类型定义
type SearchResult_Post = {
  id: number;
  title: string;
  content: string;
  sectionId: number;
  sectionName: string;
  createdTime: string;
}

type SearchResult_Section = {
  id: number;
  name: string;
  description: string;
  image: string;
  followersCount: number;
  postCount: number;
  isFollowed?: boolean; // 添加关注状态字段
  loading?: boolean;    // 添加加载状态字段
}


const router = useRouter()
const searchKeyword = ref('');
const results_Post = ref<SearchResult_Post[]>([]);
const results_Section = ref<SearchResult_Section[]>([]);
const loading = ref(false);
const error = ref('');
const pageNum_Post = ref(1) // 改为数字类型
const pageSize_Post = ref(5) // 改为数字类型
const pageNum_Section = ref(1) // 改为数字类型
const pageSize_Section = ref(5) // 改为数字类型
const {formatTime,truncateContent} = format()
// 处理搜索类型变化
const handleTypeChange = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};


// 获取搜索结果（修改版）
const fetchSearchResults = async (keyword: string, loadMore = false ) => {
  try {
    if (!loadMore) {
      // 如果是新搜索，重置分页
      pageNum_Post.value = 1;
      pageNum_Section.value = 1;
      hasMorePost.value = true;
      hasMoreSection.value = true;
      results_Post.value = [];
      results_Section.value = [];
    }
    
    loading.value = !loadMore; // 加载更多时不显示全局加载
    error.value = '';
    isLoading.value = loadMore;
    
    // 获取帖子结果
    const postsResponse = await axios.get(`http://localhost:8080/user/post/search?q=${encodeURIComponent(keyword)}`, {
      params: {
        pageNum: pageNum_Post.value,
        pageSize: pageSize_Post.value    
      }
    });

    // 获取板块结果
    const sectionsResponse = await axios.get(`http://localhost:8080/user/sections/section/search?q=${encodeURIComponent(keyword)}`, {
      params: {
        pageNum: pageNum_Section.value,
        pageSize: pageSize_Section.value    
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
    
    // 处理板块结果
    const newSections = sectionsResponse.data.data.records || [];
    console.log("newPosts==",newPosts)
    if (loadMore) {
      results_Section.value = [...results_Section.value, ...newSections];
    } else {
      results_Section.value = newSections;
    }
    
    // 更新板块分页状态
    hasMoreSection.value = newSections.length >= pageSize_Section.value;
    
    // 并行检查所有板块的关注状态
    if (newSections.length > 0) {
      const followStatusPromises = newSections.map((section:any) => 
        checkSectionFollowStatus(section.id)
      );
      
      const followStatuses = await Promise.all(followStatusPromises);
      
      // 将关注状态赋给对应的板块
      newSections.forEach((section:any, index:any) => {
        section.isFollowed = followStatuses[index];
        section.loading = false;
      });
    }
    
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

// 监听路由变化
watch(
  () => route.query.q,  
  (newKeyword) => {
    if (newKeyword) {
      searchKeyword.value = newKeyword as string;
      
      // 更新搜索框内容
      if (searchComponent.value) {
        searchComponent.value.searchText = newKeyword as string;
      }
      
      fetchSearchResults(newKeyword as string);
    }
  },
  { immediate: true }
);

// 初始化时执行搜索
onMounted(() => {
  if (route.query.q) {
    searchKeyword.value = route.query.q as string;
    fetchSearchResults(route.query.q as string);
  }
  
});


//加载更多帖子
const handleLoadMorePost = () => {
  if (hasMorePost.value && !isLoading.value) {
    pageNum_Post.value += 1;
    fetchSearchResults(searchKeyword.value, true);
  }
}

//加载更多板块
const handleLoadMoreSection = () => {
  if (hasMoreSection.value && !isLoading.value) {
    pageNum_Section.value += 1;
    fetchSearchResults(searchKeyword.value, true);
  }
}


// 处理关注/取消关注
const handleFollow = async (item: SearchResult_Section) => {
  // 检查登录状态
  if (!localStorage.getItem('token')) {
    ElMessage.warning('请先登录');
    return;
  }
  
  try {
    item.loading = true;
    
    if (item.isFollowed) {
      // 取消关注
      await unfollowSec(item.id);
      item.isFollowed = false;
      item.followersCount = Math.max(0, item.followersCount - 1);
      ElMessage.success('已取消关注');
    } else {
      // 关注
      await followSec(item.id);
      item.isFollowed = true;
      item.followersCount++;
      ElMessage.success('关注成功');
    }
  } catch (error) {
    ElMessage.error('操作失败，请重试');
  } finally {
    item.loading = false;
  }
};

// 关注板块函数
const followSec = async (sectionId: number): Promise<void> => {
  try {
    const response = await axios.post(
      `http://localhost:8080/user/sections/followSec/${sectionId}`,
      null,
      {
        headers: { token: localStorage.getItem('token') || '' }
      }
    );

    if (response.data.code !== 1) {
      throw new Error(response.data.msg || '关注失败');
    }
  } catch (error) {
    console.error('关注失败:', error);
    throw error;
  }
};

// 取消关注函数
const unfollowSec = async (sectionId: number): Promise<void> => {
  try {
    const response = await axios.delete(
      'http://localhost:8080/user/sections/unfollowSec',
      {
        params: { sectionId },
        headers: { token: localStorage.getItem('token') || '' }
      }
    );

    if (response.data.code !== 1) {
      throw new Error(response.data.msg || '取消关注失败');
    }
  } catch (error) {
    console.error('取消关注失败:', error);
    throw error;
  }
};

// 检查单个板块的关注状态
const checkSectionFollowStatus = async (sectionId: number): Promise<boolean> => {
  if (!localStorage.getItem('token')) return false;
  
  try {
    const response = await axios.get('http://localhost:8080/user/sections/isFollowSec', {
      params: { sectionId },
      headers: { token: localStorage.getItem('token') || '' }
    });

    return response.data.code === 1 && response.data.data;
  } catch (error) {
    console.error('检查关注状态失败:', error);
    return false;
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

    /* 板块样式 */
    .section-item {
      display: flex;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid #f0f2f5;
      transition: background-color 0.2s;
    }

    .section-item:hover {
      background-color: #fafbfc;
    }

    .section-info {
      display: flex;
      gap: 16px;
      flex: 1;
    }

    .section-image {
      width: 48px;
      height: 48px;
      border-radius: 4px;
      object-fit: cover;
      cursor: pointer;
    }

    .section-details {
      flex: 1;
    }

    .section-name {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      cursor: pointer;
      margin-bottom: 4px;
      transition: color 0.2s;
    }

    .section-name:hover {
      color: #409eff;
    }

    .section-description {
      color: #666;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .section-stats {
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: #999;
    }

    .follow-button {
      min-width: 80px;
      height: 32px;
      align-self: center;
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

    /* 响应式调整 */
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
    }
  </style>