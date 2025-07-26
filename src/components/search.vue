<template>
  <div class="common-layout">

          <!-- 优化后的搜索区域 -->
          <div class="content-header">
            <div class="search-section">
              <div class="search-container">
                <div class="search-box">
                  <el-input 
                    v-model="input" 
                    placeholder="搜索帖子、用户或话题..."
                    class="custom-search-input"
                  >
                    <template #prefix>
                      <el-icon class="search-icon"><Search /></el-icon>
                    </template>
                  </el-input>
                  <el-button 
                    type="primary" 
                    class="search-button"
                  >
                    搜索
                  </el-button>
                </div>
                
                <!-- <div class="search-options">
                  <el-radio-group v-model="searchType" size="large">
                    <el-radio-button label="全部" />
                    <el-radio-button label="帖子" />
                    <el-radio-button label="用户" />
                    <el-radio-button label="话题" />
                  </el-radio-group>
                </div>
              </div>
              
              <div class="search-tips">
                <el-tag type="info" size="small">热门: </el-tag>
                <el-tag type="info" size="small" effect="plain">前端开发</el-tag>
                <el-tag type="info" size="small" effect="plain">Vue3</el-tag>
                <el-tag type="info" size="small" effect="plain">TypeScript</el-tag>
                <el-tag type="info" size="small" effect="plain">Element Plus</el-tag>
                <el-tag type="info" size="small" effect="plain">后端技术</el-tag> -->
              </div>
            </div>
          </div>
        
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Search } from '@element-plus/icons-vue';

const input = ref('');
const searchType = ref('全部');

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