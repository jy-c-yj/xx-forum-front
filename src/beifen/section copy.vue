<template>
  <div id="Sec" style="height: 100%;">
    <div class="common-layout" style="height: 100%;">

        <div class="edit-icon">
          <el-icon><EditPen /></el-icon>
        </div>

      <el-container style="height: 100%;">

        <el-aside width="200px"></el-aside>
        <el-main>
          <search></search>
          
          <div v-if="section" class="section-header">
            <img :src="section.backgroundImage" class="background-image">
            <div class="section-info">
              <img :src="section.image" class="section-avatar">
              <div class="section-details">
                <h1 class="section-name">{{ section.name }}</h1>
                <p style="opacity: 0.9;">{{ section.description }}</p>
                <div class="section-stats">
                  <div class="stat-item">
                    <span>👥</span>
                    <span>{{ section.followersCount }} 关注</span>
                  </div>
                  <div class="stat-item">
                    <span>📝</span>
                    <span>{{ section.postCount }} 帖子</span>
                  </div>
                </div>
              </div>
              <button class="follow-btn" @click="followSec(section.id)">
                <span>+</span> 关注板块
              </button>
            </div>
          </div>
          
          <!-- 添加加载状态 -->
          <div v-else class="loading-section">
            <el-icon class="loading-icon"><Loading /></el-icon>
            加载板块信息中...
          </div>
          
          <!-- 帖子内容区域 -->
          <div class="posts-container">
            <posts 
              v-if="sectionId > 0" 
              :key="sectionId" 
              :sectionId="sectionId"
            ></posts>
          </div>
        </el-main>
        <el-aside width="200px"></el-aside>
      </el-container>
    </div>
  </div>
</template>

<script setup lang="ts" name="section">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Loading, EditPen } from '@element-plus/icons-vue'
import search from '@/components/search.vue'
import posts from '@/components/posts.vue'
import { Header } from 'element-plus/es/components/table-v2/src/components/index.mjs'
import { el } from 'element-plus/es/locales.mjs'

interface Section {
  id: number
  name: string
  description: string
  backgroundImage: string
  image: string
  followersCount: number
  postCount: number
  createdTime: number
  adminId: number
}

const route = useRoute()
const section = ref<Section | null>(null)
const sectionId = ref(0)
const loading = ref(false)




const routeId = (() => {
  const id = route.params.id
  // 确保是有效的数字
  if (id && !isNaN(Number(id))) {
    return Number(id)
  }
  return 0
})
const fetchSectionData = async (id: number) => {
  try {
    const response = await axios.get('http://localhost:8080/user/sections/sectionDetail', {
      params: { id },
      headers: { token: localStorage.getItem('token') || '' }
    })

    if (response.data.code === 1) {
      section.value = response.data.data
    } else {
      ElMessage.error(response.data.msg || '获取板块信息失败')
    }
  } catch (error) {
    console.error('请求失败:', error)
    ElMessage.error('网络请求失败，请稍后重试')
  }
}

// 使用 watch 响应路由变化
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      sectionId.value = Number(newId)
      fetchSectionData(sectionId.value)
    }
  },
  { immediate: true } // 立即执行一次
)


const isFollowSec =async(SectionId :number)=> {
      try{
      const response = await axios.get('http://localhost:8080/user/sections/isFollowSec',{
        params : {
          sectionId : SectionId
        },
        headers :  { token: localStorage.getItem('token') || '' }
      })

      if(response.data.code === 1){
          if(response.data){
            console.log('已关注此板块')
          }
          else{
            console.log('未关注此板块')
          }
      }else{
          ElMessage.error(response.data.msg)
          return
      }
    }catch{
      ElMessage.error('出现未知错误')
    }
}




const followSec = async(SectionId :number) => {
    try{
      const response = await axios.post(`http://localhost:8080/user/sections/followSec/${SectionId}`,
      null,
      {
        headers: { token: localStorage.getItem('token') || '' }
      })

      if(response.data.code === 1){
          ElMessage.success('关注成功')
      }else{
          ElMessage.error(response.data.msg)
          return
      }
    }catch{
      ElMessage.error('出现未知错误')
    }

}

const unfollowSec = async(SectionId :number) => {
    try{
      const response = await axios.delete('http://localhost:8080/user/sections/unfollowSec',
      {
        params : {
          sectionId : SectionId
        },
        headers: { token: localStorage.getItem('token') || '' }
      })

      if(response.data.code === 1){
          ElMessage.success('取消关注成功')
      }else{
          ElMessage.error(response.data.msg)
          return
      }
    }catch{
      ElMessage.error('出现未知错误')
    }

}


</script>

<style scoped>
.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #666;
  font-size: 16px;
}

.loading-icon {
  font-size: 36px;
  margin-bottom: 15px;
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.demo-image .block {
  padding: 30px 0;
  text-align: center;
  border-right: solid 1px var(--el-border-color);
  display: inline-block;
  width: 20%;
  box-sizing: border-box;
  vertical-align: top;
}
.demo-image .block:last-child {
  border-right: none;
}
.demo-image .demonstration {
  display: block;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin-bottom: 20px;
}


/* //==================================== */

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    }

    body {
      background-color: #f5f7fa;
      color: #333;
      line-height: 1.6;
      padding: 20px;
    } 
    
    .common-layout {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
    
    .el-container {
      display: flex;
    }
    
    .el-aside {
      background: #f9fafc;
      padding: 20px;
    }
    
    .el-main {
      padding: 0;
      background: white;
    }
    
    /* 顶部背景和头像区域 */
    .section-header {
      position: relative;
      height: 280px;
      overflow: hidden;
    }
    
    .background-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: brightness(0.85);
    }
    
    .section-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 30px;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
      display: flex;
      align-items: flex-end;
      gap: 30px;
    }
    
    .section-avatar {
      width: 120px;
      height: 120px;
      border-radius: 8px;
      border: 3px solid white;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
    
    .section-details {
      flex: 1;
      color: white;
    }
    
    .section-name {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 10px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }
    
    .section-stats {
      display: flex;
      gap: 30px;
      margin-top: 15px;
    }
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
    }
    
    .follow-btn {
      background: #409eff;
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 30px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
    }
    
    .follow-btn:hover {
      background: #337ecc;
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(64, 158, 255, 0.5);
    }
    

    
    /* 响应式设计 */
    @media (max-width: 768px) {
      .section-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
      }
      
      .section-stats {
        flex-wrap: wrap;
        gap: 15px;
      }
      
      .section-name {
        font-size: 26px;
      }
      
      .posts-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
      }
      
      .el-aside {
        display: none;
      }
    }


/* 图标样式 */
.edit-icon {
  position: fixed;
  top: 600px; /* 距离顶部距离，根据需要调整 */
  right: calc(50% - 750px + 20px); /* 关键计算：居中定位+右偏移 */
  z-index: 1000; /* 确保在最上层 */
  background: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-icon:hover {
  background: #f5f7fa;
  transform: scale(1.05);
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .edit-icon {
    right: 20px; /* 小屏幕时固定在右侧 */
  }
}
</style>
