<template>
  <div class="my-information-container">
    <!-- 用户信息头部 -->
     <el-icon @click="toHome"><home-filled /></el-icon>
    <div class="user-header">
      <div class="avatar-container">
        <img :src="user.image || 'https://via.placeholder.com/80?text=Avatar'" alt="用户头像" class="avatar" />
      </div>
      <div class="user-info">
        <h2 class="username">{{ user.username }}</h2>
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
      <router-link 
        v-for="(tab, index) in tabs" 
        :key="index"
        :to="{ name: tab.routeName, params: { id: $route.params.id } }"
        custom
        v-slot="{ isActive, navigate }"
      >
        <button 
          :class="['tab-button', { active: isActive }]"
          @click="navigate"
        >
          {{ tab.title }}
        </button>
      </router-link  :key="$route.fullPath">
    </div>


    <div class="content-area">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts" name="myInformation">
import axios from 'axios';
import type { AxiosError } from 'axios'
import { ElMessage } from 'element-plus';
import { ref, computed, onMounted } from 'vue';
import { useRoute , useRouter} from 'vue-router';


interface User{
  id : number,
  username : string,
  image : string,
  likeCount : number,
  postCount : number
}

const error = ref<string | null>(null);
const user = ref<User>({
    id : 0,
    username : ' ',
    image : ' ',
    likeCount : 0,
    postCount : 0
})

onMounted(()=>{
    refreshData()
})

const refreshData = async ()=>{

    if(!localStorage.getItem('token')){
      ElMessage.error('请登陆')
      user.value.id = -1
      return
    }
    try{

      const response =await axios.get('http://localhost:8080/user/myInformation',{
        headers : {
          token : localStorage.getItem('token')
        }
      })

      if(response.data.code === 1){
        user.value = response.data.data
      }else{
        ElMessage.error(response.data.msg)
        error.value = `获取数据失败: ${response.data.msg || '未知错误'}`;
      }

    }catch (err) {
    const axiosError = err as AxiosError;
    error.value = `网络请求失败: ${axiosError.message}`;
    console.error('API请求错误:', axiosError);
  }


}


const userSec = ref([
  { name: 'sec1' },
  { name: 'sec2' },
  { name: 'sec3' },
  { name: 'sec4' }
]);

// 选项卡配置 - 添加对应的路由名称
const tabs = ref([
  { key: 'home', title: '主页', routeName: 'main' },
  { key: 'follow', title: '我的关注', routeName: 'myFollow' },
  { key: 'reply', title: '我的回复', routeName: 'myReply' },
  { key: 'collection', title: '我的收藏', routeName: 'myCollection' },
  { key: 'posts', title: '我的发帖', routeName: 'myPosts' },
  { key: 'manage', title: '我的管理', routeName: 'myManage' }
]);

// 使用路由信息确定当前激活的选项卡
const route = useRoute();
const router = useRouter();
const activeTab = computed(() => {
  return tabs.value.find(tab => tab.routeName === route.name)?.key || 'home';
});

//返回主页
const toHome = ()=>{
    router.push('/Home')
}
</script>

<style scoped>
/* 保持之前的样式不变 */
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