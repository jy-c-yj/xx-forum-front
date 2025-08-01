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
                  <span class="section-tag">{{ item.sectionName }}</span>
                  <h4 class="post-title">{{ item.title }}</h4>
                </div>
                <p class="post-content">{{ truncateContent(item.content) }}</p>
                <div class="post-footer">
                  <span class="post-time">{{ formatTime(item.createdTime) }}</span>
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
              <p v-else-if="!hasMore && results_Post.length > 0" class="no-more-text">
                没有更多内容了
              </p>
            </div>
          </div>
          
          <!-- 板块搜索结果 -->
          <div v-if="searchType === 'section'">
            <div v-if="results_Section.length === 0" class="no-results">未找到相关板块</div>
            <div v-else class="section-results">
              <div v-for="item in results_Section" :key="item.id" class="section-item">
                <div class="section-info">
                  <img :src="item.image || '/default-section.png'" alt="板块图标" class="section-image" />
                  <div class="section-details">
                    <h4 class="section-name">{{ item.name }}</h4>
                    <p class="section-description">{{ item.description }}</p>
                    <div class="section-stats">
                      <span>关注: {{ item.followers_count }}</span>
                      <span>帖子: {{ item.post_count }}</span>
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
            <p v-else-if="!hasMore && results_Section.length > 0" class="no-more-text">
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
import { useRoute } from 'vue-router';
import axios from 'axios';
import type { AxiosError } from 'axios';
import Search from '@/components/search.vue'  // 确保路径正确
import dayjs from 'dayjs';
import format from '@/hooks/format';
import SectionFollow from '@/hooks/SectionFollow';
import { ElMessage } from 'element-plus';

const route = useRoute();
const isLoading = ref(false)
const hasMore = ref(true)

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
  followers_count: number;
  post_count: number;
  isFollowed?: boolean; // 添加关注状态字段
  loading?: boolean;    // 添加加载状态字段
}

const searchKeyword = ref('');
const results_Post = ref<SearchResult_Post[]>([]);
const results_Section = ref<SearchResult_Section[]>([]);
const loading = ref(false);
const error = ref('');
const pageNum_Post = ref('1')
const pageSize_Post = ref('5')
const pageNum_Section = ref('1')
const pageSize_Section = ref('5')
const {formatTime,truncateContent} = format()
// 处理搜索类型变化
const handleTypeChange = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};


// 获取搜索结果（修改版）
const fetchSearchResults = async (keyword: string) => {
  try {
    loading.value = true;
    error.value = '';
    
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
    
    results_Post.value = postsResponse.data.data.records || [];
    
    // 处理板块结果，添加关注状态
    results_Section.value = sectionsResponse.data.data.records || [];
    
    // 并行检查所有板块的关注状态
    const followStatusPromises = results_Section.value.map(section => 
      checkSectionFollowStatus(section.id)
    );
    
    const followStatuses = await Promise.all(followStatusPromises);
    
    // 将关注状态赋给对应的板块
    results_Section.value.forEach((section, index) => {
      section.isFollowed = followStatuses[index];
      section.loading = false;
    });
    
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
  }
};

// 监听路由变化
watch(
  () => route.query.q,  // 注意这里是 query.q 而不是 params.txt
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


//加载更多
const handleLoadMorePost = () => {
  if (hasMore.value && !isLoading.value) {
    pageNum_Post.value += 1
    fetchSearchResults()
  }
}
//加载更多
const handleLoadMoreSection = () => {
  if (hasMore.value && !isLoading.value) {
    pageNum_Section.value += 1
    fetchSearchResults()
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
      item.followers_count = Math.max(0, item.followers_count - 1);
      ElMessage.success('已取消关注');
    } else {
      // 关注
      await followSec(item.id);
      item.isFollowed = true;
      item.followers_count++;
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

</script>


<style scoped>
.result-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
}
.result-item h4 {
  margin: 0 0 8px 0;
  color: #1890ff;
}
</style>