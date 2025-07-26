<template>

    <div id="Sec">
    <div class="common-layout" style="height: 100%;">
      <el-container style="height: 100%;">
        <el-aside width="300px"></el-aside>
        <el-main>
         <search></search>
          
          <!-- 板块头部：背景和头像信息 -->
          <div class="section-header">
            <img :src="url" class="background-image">
            <div class="section-info">
              <img :src="squareUrl" class="section-avatar">
              <div class="section-details">
                <h1 class="section-name">{{ sectionName }}</h1>
                <p style="opacity: 0.9;">{{ sectionDescription }}</p>
                <div class="section-stats">
                  <div class="stat-item">
                    <span>👥</span>
                    <span>{{ followersCount }} 关注</span>
                  </div>
                  <div class="stat-item">
                    <span>📝</span>
                    <span>{{ postsCount }} 帖子</span>
                  </div>
                </div>
              </div>
              <button class="follow-btn">
                <span>+</span> 关注板块
              </button>
            </div>
          </div>
          
          <!-- 帖子内容区域 -->
          <div class="posts-container">
            <posts></posts>
            
          </div>
        </el-main>
        <el-aside width="300px"></el-aside>
      </el-container>
    </div>
  </div>
</template>


<script setup lang="ts" name="section">
    import { reactive, toRefs ,ref } from 'vue'
    import search from '@/components/search.vue'
 
    import posts from '@/components/posts.vue'

    const fits = 'fill'

    const url =
    'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg'

    //===================================================

    const state = reactive({
    circleUrl:
        'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    squareUrl:
        'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
    sizeList: ['small', '', 'large'] as const,
    })

    const { circleUrl, squareUrl, sizeList } = toRefs(state)
    //================================



        
        const sectionName = ref('编程技术')
        const sectionDescription = ref('分享各类编程语言学习心得与技术交流，涵盖前端、后端、移动端等开发领域')
        const followersCount = ref(12540)
        const postsCount = ref(8920)
</script>

<style scoped>
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

</style>
