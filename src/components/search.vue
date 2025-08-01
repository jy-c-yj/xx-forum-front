<template>
  <div class="common-layout">
    <div class="content-header">
      <div class="search-section">
        <div class="search-container">
          <div class="search-box">
            <el-input 
              v-model="searchText"  
              placeholder="搜索帖子、用户或话题..."
              class="custom-search-input"
              @keyup.enter="handleSearch" 
            >
              <template #prefix>
                <el-icon class="search-icon"><Search /></el-icon>
              </template>
            </el-input>
            <el-button 
              type="primary" 
              class="search-button"
              @click="handleSearch" 
            >
              搜索
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="search">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const searchText = ref('');  // 修改变量名为 searchText
const router = useRouter();

const handleSearch = () => {
  const keyword = searchText.value.trim();
  if (keyword) {
    router.push({
      name: 'searchdetail',
      query: { q: keyword }  // 使用query参数传递搜索词
    });
  } else {
    ElMessage.warning('请输入搜索内容');
  }
};

// 暴露searchText给父组件
defineExpose({
  searchText
});
</script>
<style scoped>
/* 内容区域头部 */
.content-header {
  margin-bottom: 30px;
  padding: 20px 0;
  border-bottom: 1px solid #f0f2f5;
}

.search-section {
  max-width: 900px;
  margin: 0 auto;
}

/* 搜索容器 */
.search-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.search-box {
  display: flex;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.search-box:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

/* 自定义输入框样式 */
.custom-search-input {
  flex: 1;
}

:deep(.custom-search-input .el-input__wrapper) {
  height: 48px;
  padding: 0 20px;
  border-radius: 8px 0 0 8px;
  border: none;
  box-shadow: none !important;
  background-color: #f8f9fa;
  font-size: 16px;
}

:deep(.custom-search-input .el-input__wrapper:hover) {
  background-color: #f1f3f5;
}

.search-icon {
  font-size: 18px;
  color: #909399;
  margin-right: 10px;
}

/* 搜索按钮样式 */
.search-button {
  height: 48px;
  border-radius: 0 8px 8px 0;
  padding: 0 30px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #409EFF, #337ecc);
  border: none;
  transition: all 0.3s ease;
}

.search-button:hover {
  background: linear-gradient(135deg, #66b1ff, #409EFF);
  transform: translateY(-1px);
}

.search-button:active {
  transform: translateY(1px);
}

/* 搜索选项 */
.search-options {
  display: flex;
  justify-content: center;
}

/* 搜索提示标签 */
.search-tips {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
  padding: 0 10px;
  justify-content: center;
}

.search-tips .el-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.search-tips .el-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
</style>