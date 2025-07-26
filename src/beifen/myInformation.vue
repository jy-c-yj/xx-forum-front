<template>
  <div class="my-information-container">
    <!-- 用户信息头部 -->
    <div class="user-header">
      <div class="avatar-container">
        <img :src="user.image || 'https://via.placeholder.com/80?text=Avatar'" alt="用户头像" class="avatar" />
      </div>
      <div class="user-info">
        <h2 class="username">{{ user.name }}</h2>
        <div class="stats">
          <div class="stat-item">
            <span class="stat-value">{{ user.likeCount }}</span>
            <span class="stat-label">获赞</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ user.postCount }}</span>
            <span class="stat-label">发帖</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 选项卡导航 -->
    <div class="tabs">
      <button 
        v-for="(tab, index) in tabs" 
        :key="index"
        :class="['tab-button', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.title }}
      </button>
    </div>

    <!-- 动态内容区域 -->
    <div class="content-area">
      <div v-if="activeTab === 'home'">
        <h3>主页内容</h3>
        <p>{{ str }}</p>
      </div>
      
      <div v-if="activeTab === 'follow'">
        <h3>我的关注</h3>
        <p>{{ str1 }}</p>
      </div>
      
      <div v-if="activeTab === 'reply'">
        <h3>我的回复</h3>
        <p>{{ str2 }}</p>
      </div>
      
      <div v-if="activeTab === 'collection'">
        <h3>我的收藏</h3>
        <p>{{ str3 }}</p>
      </div>
      
      <div v-if="activeTab === 'section'">
        <h3>我的板块</h3>
        <p>{{ str4 }}</p>
        <ul>
          <li v-for="(sec, index) in userSec" :key="index">{{ sec.name }}</li>
        </ul>
      </div>
      
      <div v-if="activeTab === 'manage'">
        <h3>我的管理</h3>
        <p>{{ str5 }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const user = ref({
  name: 'jyc',
  image: '',
  likeCount: 10,
  postCount: 100,
});

const userSec = ref([
  { name: 'sec1' },
  { name: 'sec2' },
  { name: 'sec3' },
  { name: 'sec4' }
]);

const str = ref('这是默认');
const str1 = ref('这是我的关注');
const str2 = ref('这是我的回复');
const str3 = ref('这是我的收藏');
const str4 = ref('这是我创建的板块');
const str5 = ref('这是我管理的板块');

const tabs = ref([
  { key: 'home', title: '主页' },
  { key: 'follow', title: '我的关注' },
  { key: 'reply', title: '我的回复' },
  { key: 'collection', title: '我的收藏' },
  { key: 'section', title: '我的板块' },
  { key: 'manage', title: '我的管理' }
]);

const activeTab = ref('home');
</script>

<style scoped>
.my-information-container {
  width: 70%;
  max-width: 1000px;
  margin: 40px auto;
  padding: 30px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
  font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
  color: #333;
}

.user-header {
  display: flex;
  align-items: center;
  padding: 20px 0;
  margin-bottom: 25px;
  border-bottom: 1px solid #eaeaea;
}

.avatar-container {
  margin-right: 25px;
}

.avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #e0e0e0;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.user-info {
  flex: 1;
}

.username {
  margin: 0 0 12px 0;
  font-size: 26px;
  font-weight: 600;
  color: #2c3e50;
}

.stats {
  display: flex;
}

.stat-item {
  margin-right: 30px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
  margin-top: 4px;
}

.tabs {
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.tab-button {
  flex: 1;
  padding: 14px 0;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  color: #7f8c8d;
  transition: all 0.25s ease;
}

.tab-button:hover {
  background-color: #f5f7fa;
  color: #3498db;
}

.tab-button.active {
  border-bottom-color: #3498db;
  color: #3498db;
  background-color: #f5f7fa;
}

.content-area {
  padding: 25px;
  min-height: 350px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.content-area h3 {
  margin-top: 0;
  margin-bottom: 20px;
  padding-bottom: 15px;
  font-size: 20px;
  font-weight: 500;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
}

.content-area p {
  font-size: 16px;
  line-height: 1.6;
  color: #555;
}

.content-area ul {
  padding-left: 25px;
  margin-top: 15px;
}

.content-area li {
  margin-bottom: 10px;
  padding: 8px 0;
  font-size: 16px;
  border-bottom: 1px solid #f0f0f0;
  list-style-type: disc;
  color: #555;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .my-information-container {
    width: 85%;
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .my-information-container {
    width: 95%;
    margin: 20px auto;
    padding: 15px;
  }
  
  .tabs {
    flex-wrap: wrap;
  }
  
  .tab-button {
    flex: 0 0 50%;
    padding: 12px 0;
    font-size: 14px;
  }
  
  .user-header {
    flex-direction: column;
    text-align: center;
  }
  
  .avatar-container {
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .stats {
    justify-content: center;
  }
}
</style>