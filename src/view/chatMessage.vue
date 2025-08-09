<template>
  <div class="message-center"> 
    <div class="content-container">
      <div class="sidebar">
        <h3>Message</h3>
        <div 
          class="tab-item"
          :class="{'active': activeTab === 'private'}"
          @click="navigateTo('private')"
        >
          <i class="fas fa-comments"></i>
          <span>私信聊天</span>
        </div>
        <div 
          class="tab-item"
          :class="{'active': activeTab === 'system'}"
          @click="navigateTo('system')"
        >
          <i class="fas fa-bell"></i>
          <span>系统通知</span>
        </div>
      </div>
      
      <!-- 子路由显示区域 -->
      <div class="main-content">
        <router-view></router-view>
      </div>
    </div>
    
    <div class="footer">
      <p>© 2023 论坛消息中心 | 随时保持联系</p>
    </div>
  </div>
</template>

<script setup lang="ts" name="chatMessage">
import { ref, watch } from 'vue' 
import { useRoute, useRouter } from 'vue-router'

const route = useRoute();
const router = useRouter();

// 使用 ref 管理 activeTab 状态
const activeTab = ref('private');

// 监听路由变化并更新 activeTab
watch(
  () => route.name,
  (routeName) => {
    if (routeName === 'PrivateMessageChat') {
      activeTab.value = 'private';
    } else if (routeName === 'SystemInformation') {
      activeTab.value = 'system';
    }
  },
  { immediate: true } // 立即执行一次以初始化状态
);

// 导航函数
const navigateTo = (tabType: string) => {
  if (tabType === 'private') {
    router.push({ name: 'PrivateMessageChat' });
  } else {
    router.push({ name: 'SystemInformation' });
  }
};

// 初始加载时重定向到默认子路由
if (route.name === 'chatMessage') {
  router.replace({ name: 'PrivateMessageChat' });
}
</script>

<style scoped>
.message-center {
  width: 100%;
  max-width: 1200px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 85vh;
  margin: 0 auto;
  border-radius: 12px;
}

.content-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 220px;
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 0;
  overflow-y: auto;
  background: #f9fbfd;
}

.tab-item {
  padding: 16px 25px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  font-size: 1.1rem;
  color: #495057;
}

.tab-item i {
  margin-right: 15px;
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
  color: #2196f3;
}

.tab-item:hover {
  background: #e6f7ff;
}

.tab-item.active {
  background: #e6f7ff;
  border-left: 4px solid #2196f3;
  color: #2196f3;
  font-weight: 600;
}

.footer {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .tab-item {
    padding: 15px 20px;
    white-space: nowrap;
    border-left: none;
    border-bottom: 3px solid transparent;
  }
  
  .tab-item.active {
    border-left: none;
    border-bottom: 3px solid #2196f3;
  }
  
  /* 移动端调整布局 */
  .content-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    flex-direction: row;
    border-right: none;
    border-bottom: 1px solid #e9ecef;
    padding: 0;
  }
  
  .tab-item {
    flex: 1;
    justify-content: center;
    border-bottom: 3px solid transparent;
    padding: 15px 10px;
    font-size: 0.9rem;
  }
  
  .tab-item i {
    margin-right: 8px;
  }
  
  .footer {
    padding: 10px;
    font-size: 0.8rem;
  }
}
</style>