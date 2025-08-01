<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <search></search>
        
      </el-header>
      <el-main>
        <!-- 搜索结果区域 -->
        <div v-if="loading">加载中...</div>
        <div v-else-if="error">{{ error }}</div>
        <div v-else>
          <h3>搜索关键词: "{{ searchKeyword }}"</h3>
            <div class="my-2 ml-4">
            <el-radio-group v-model="radio2">
              <el-radio value="1">帖子</el-radio>
              <el-radio value="2">板块</el-radio>
            </el-radio-group>
          </div>
          <div v-if="results.length === 0">未找到相关结果</div>
          <div v-else>
            <!-- 搜索结果列表 -->
            <div v-for="item in results" :key="item.id" class="result-item">
              <!-- 根据实际数据结构渲染 -->
              <h4>{{ item.title }}</h4>
              <p>{{ item.content }}</p>
            </div>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import search from '@/components/search.vue';
import axios from 'axios';

const radio2 = ref('1')
// 类型定义 (根据实际API调整)
type SearchResult_Post = {
  id: number;
  title: string;
  content: string;
  sectionId : number,
  sectionName :string,
  createdTime : string
}
type SearchResult_Section = {
  id : number,
  name : string,
  description : string,
  image : string,
  followers_count : number,
  post_count : number,
}
const route = useRoute();
const searchKeyword = ref('');
const results_Post = ref<SearchResult_Post[]>([]);
const results_Section = ref<SearchResult_Section[]>([]);
const loading = ref(false);
const error = ref('');

// 获取搜索结果
const fetchSearchResults = async (keyword: string) => {
  try {
    loading.value = true;
    error.value = '';
    
    // 查询相关帖子
    const response1 = await axios.get(`http://localhost:8080/user/post/search?q=${keyword}`,{
      headers : {
        token : localStorage.getItem('token')
      }
    });
     results_Post.value = response1.data;

    //查询相关板块
    const response2 = await axios.get(`http://localhost:8080/user/section/search?q=${keyword}`,{
      headers : {
        token : localStorage.getItem('token')
      }
    });
     results_Post.value = response1.data;
    
    
  } catch (err) {
    error.value = '搜索失败，请稍后重试';
    console.error('搜索错误:', err);
  } finally {
    loading.value = false;
  }
};

// 监听路由变化
watch(
  () => route.query.q,
  (newKeyword) => {
    if (newKeyword) {
      searchKeyword.value = newKeyword as string;
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