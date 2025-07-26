<template>
    <div class="user-card-container">
        <el-card class="user-card">
            <template #header>
                <div class="card-header">
                    <div class="user-profile">
                        <el-avatar 
                            shape="square" 
                            :size="120" 
                            fit="cover" 
                            :src="url" 
                            class="user-avatar"
                            @click="myInformation(userstore.user.id)"
                        />
                        <div class="user-info">
                            <h3 class="username">{{ fits[0] }}</h3>
                            <p class="user-status">在线 · 活跃用户</p>
                        </div>
                    </div>
                </div>
            </template>
            
            <div class="user-details">
                <div class="detail-item">
                    <span class="detail-label">帖子数:</span>
                    <span class="detail-value">{{ fits[3] }}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">获赞数:</span>
                    <span class="detail-value">{{ fits[4] }}</span>
                </div>
            </div>
            <!-- 我的板块部分 -->
            <div class="my-sec-section">
                <h3 class="section-title">我的关注  {{  msg  }}</h3>
                <div class="section-grid">
                    <div v-for="section in sections" :key="section.id" class="section-item"
                     @click="handleSectionClick(section.id)">
                            <el-button class="section-btn" round>
                                <div class="section-content">
                                    <el-avatar :size="40" :src="getImageUrl(section.image)" class="section-avatar" />
                                    <span class="section-name">{{ section.name }}</span>
                                </div>
                            </el-button>
                    </div>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, toRefs, reactive, onMounted } from 'vue'
import { userStore } from '@/stores/user'
import { ElMessage, ElMessageBox, linkEmits, type FormInstance, type FormRules } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import formatDateTime from '@/hooks/format'

const userstore = userStore()
const router = useRouter()

// 日期时间格式化函数
let {formatTime,getImageUrl} = formatDateTime()

// 板块数据结构
interface mySection{
  id : number,
  name : string,
  image : string
}



// 板块数据
const sections = ref<mySection[]>([])
const msg = ref(" ")



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


if(localStorage.getItem('user')){
    const u = JSON.parse(localStorage.getItem('user') as string)
    userstore.setuserp(u)


}

onMounted(async ()=>{

  try{
    const response = await axios.get('http://localhost:8080/user/personal', {
    params: {  // 使用params选项传递查询参数
    username: userstore.user.username
  },
    headers: { 
    token: localStorage.getItem('token')
  }

})      
console.log('asdasdasdas',response.data.data)
        userstore.setuserp(response.data.data)
        localStorage.setItem('user',JSON.stringify(userstore.user))
        console.log('u===',response.data.data)

  
      const response_ = await axios.get('http://localhost:8080/user/sections/mySection',{
      params: {  
      id: userstore.user.id
    },
      headers: { 
      token: localStorage.getItem('token')
    }

})

      console.log("my=====>",response_.data)
      if(response_.data.code === 1){

        if(!response_.data.data){
          msg.value = "还未关注任意板块"
        }

        sections.value = response_.data.data

      }
      else{
        msg.value = response_.data.msg
        ElMessage.error(response_.data.msg)
      }

    }catch (error) {
      console.error('请求出错:', error)
      ElMessage.error('请求错误，请检查登陆')
    }
})

const state = reactive({
    fits: [userstore.user.username,userstore.user.email,userstore.user.createtime,userstore.user.postCount,userstore.user.likeCount ]as string[],
    url: userstore.user.image,

})
const { fits, url } = toRefs(state)
  



const myInformation = (id : number) => {

  router.push({
    name: 'myInformation',
    params: { 
      id: id
    }
  })

}



</script>

<style scoped>
.user-card-container {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.user-card {
  width: 100%;
  max-width: 480px;
  background-color: #f8f9fa; /* 浅灰色背景 */
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: none;
}

.card-header {
  padding: 16px 0;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-avatar {
  border: 3px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.user-info {
  text-align: left;
}

.username {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
  font-weight: 600;
}

.user-status {
  margin: 4px 0 0;
  font-size: 0.9rem;
  color: #5a6268;
}

.user-details {
  padding: 16px 0;
  border-top: 1px solid #eaeaea;
  border-bottom: 1px solid #eaeaea;
  margin: 16px 0;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
}

.detail-label {
  color: #6c757d;
  font-weight: 500;
}

.detail-value {
  color: #343a40;
  font-weight: 500;
}


.example-showcase .el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}


/* 我的板块部分样式 - 修复版 */
.my-sec-section {
  margin-top: 20px;
}

.section-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  padding-bottom: 6px;
  border-bottom: 1px dashed #eaeaea;
}

.section-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.section-item {
  display: flex;
  position: relative; /* 为徽章定位提供上下文 */
}

.badge-item {
  width: 100%;
  position: relative; /* 徽章定位容器 */
}

.section-btn {
  width: 100%;
  height: 30px;
  padding: 0 12px;
  border: 1px solid #eaeaea;
  background-color: #f8fafc;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative; /* 确保按钮在层级中的位置 */
}

.section-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  border-color: #c5d9f1;
  background-color: #f0f7ff;
}

.section-content {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.section-avatar {
  width: 22px;
  height: 22px;
  font-size: 10px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
}

.section-name {
  font-weight: 500;
  color: #2c3e50;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
  text-align: left;
}


/* :deep(.el-badge__content) {
  position: absolute;
  top: -7px !important; 
  right: -7px !important; 
  height: 16px;
  min-width: 16px;
  line-height: 16px;
  padding: 0 4px;
  font-size: 10px;
  font-weight: bold;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  border: 2px solid #fff; 
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  z-index: 10;
} */

@media (max-width: 480px) {
  .section-grid {
    grid-template-columns: 1fr;
  }
  
  .section-btn {
    max-width: 120px;
    margin: 0 auto;
  }
  
  :deep(.el-badge__content) {
    top: -5px !important;
    right: -5px !important;
  }
}
</style>
