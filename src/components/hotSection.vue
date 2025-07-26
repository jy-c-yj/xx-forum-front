<template>
<div class="hot-section-container">
  <el-card class="hot-section-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <h3>热门板块</h3>
      </div>
    </template>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="5" animated />
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <el-alert :title="error" type="error" show-icon />
    </div>
    
    <!-- 数据列表 -->
    <div v-else class="section-list">
      <div 
        v-for="section in hotSections" 
        :key="section.id" 
        class="section-item"
        @click="handleSectionClick(section.id)"
      >
        <div class="section-avatar">
          <el-avatar :size="48" :src="getImageUrl(section.image)" />
        </div>
        
        <div class="section-info">
          <div class="section-name">{{ section.name }}</div>
          <div class="section-stats">
            <div class="stat-item">
              <el-icon><User /></el-icon>
              <span>{{ formatCount(section.followersCount) }}</span>
            </div>
            <div class="stat-item">
              <el-icon><Document /></el-icon>
              <span>{{ formatCount(section.postCount) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { User, Document } from '@element-plus/icons-vue'
import axios from 'axios'
import type { AxiosError } from 'axios'
import format from '@/hooks/format'
import{ useRouter } from 'vue-router'

const {getImageUrl,formatCount} = format()

interface Section {
  id: number;
  name: string;
  image: string | null;
  followersCount: number;
  postCount: number;
}


interface ApiResponse<T> {
  code: number;
  msg: string | null; 
  data: T;
}

const hotSections = ref<Section[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const router = useRouter()



// 处理板块点击事件
const handleSectionClick = (sectionId: number) => {
  console.log('跳转到板块:', sectionId);
  router.push({
    name: 'section',
    params: { 
      id: sectionId,
    }
  })
};

onMounted(async () => {
  try {
    loading.value = true;
    // 使用正确的接口路径（根据您的响应数据）
    const response = await axios.get<ApiResponse<Section[]>>(
      'http://localhost:8080/user/sections/hot' // 修改为实际路径
    );
    
    console.log('API响应:', response.data); // 添加调试日志
    
    
    if (response.data.code === 1) {
      hotSections.value = response.data.data;
    } else {
      
      error.value = `获取数据失败: ${response.data.msg || '未知错误'}`;
    }
  } catch (err) {
    const axiosError = err as AxiosError;
    error.value = `网络请求失败: ${axiosError.message}`;
    console.error('API请求错误:', axiosError);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.hot-section-container {
  margin-bottom: 20px;
}

.hot-section-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.loading-state {
  padding: 20px;
}

.error-state {
  padding: 20px;
}

.section-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.section-item:hover {
  background-color: #f5f7fa;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-avatar {
  margin-right: 12px;
}

.section-info {
  flex: 1;
}

.section-name {
  font-weight: 500;
  margin-bottom: 4px;
  color: #303133;
}

.section-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-item .el-icon {
  font-size: 14px;
}
</style>