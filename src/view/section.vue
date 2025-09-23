<template>
  <div id="Sec" style="height: 100%;">
    <div class="common-layout" style="height: 100%;">
      <div class="edit-icon">
        <el-icon @click="pushPost"><EditPen /></el-icon>
      </div>
      <div v-if = "userSigIn">
        <div class="edit-icon-1" v-if="signInStatus === true">
          <el-icon ><Calendar /></el-icon>
        </div>
        <div class="edit-icon-1" v-else>
          <el-icon @click="sign(userSigIn.id)"><Ship /></el-icon>
        </div>        
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
              <!-- 根据关注状态显示不同按钮 -->
              <button 
                v-if="isFollowed === false" 
                class="follow-btn" 
                @click="followSec(section.id)"
              >
                <span>+</span> 关注板块
              </button>
              <button 
                v-else 
                class="unfollow-btn" 
                @click="unfollowSec(section.id)"
              >
                <span>✓</span> 已关注
              </button>
            </div>
          </div>
          
          <!-- 添加加载状态 -->
          <div v-else class="loading-section">
            <el-icon class="loading-icon"><Loading /></el-icon>
            加载板块信息中...
          </div>
          
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
          
          <!-- 新增排序按钮区域 -->
          <div class="sort-controls">
            <el-radio-group v-model="sortType" size="large">
              <el-radio-button label="1">最新排序</el-radio-button>
              <el-radio-button label="2">热门排序</el-radio-button>
            </el-radio-group>
          </div>
          
          <!-- 帖子内容区域 -->
          <div class="posts-container">
            <posts 
              v-if="sectionId > 0" 
              :key="sectionId + '-' + sortType" 
              :sectionId="sectionId"
              :sortType="sortType"
            ></posts>
          </div>
        </el-main>
        <el-aside width="200px"></el-aside>
      </el-container>
    </div>

    <el-dialog 
      v-model="postDialogVisible" 
      title="发表新帖子" 
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="postForm" label-width="80px" :rules="postRules" ref="postFormRef">
        <el-form-item label="帖子标题" prop="title">
          <el-input 
            v-model="postForm.title" 
            placeholder="请输入帖子标题（最多50字）"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="帖子内容" prop="content">
          <el-input 
            v-model="postForm.content" 
            type="textarea" 
            :rows="8"
            placeholder="请输入帖子内容（最多1000字）"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="postDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPost">发表</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts" name="section">
import { ref, onMounted, watch } from 'vue'
import { useRoute,useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Loading, EditPen } from '@element-plus/icons-vue'
import search from '@/components/search.vue'
import posts from '@/components/posts.vue'
// 添加表单验证规则
import type { FormInstance, FormRules } from 'element-plus'
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

interface pushPost_{
    sectionId : number,
    postTitle : string,
    postContent : string
}

interface PostForm {
  title: string
  content: string
}


interface UsesrSignIn {
  id : number
  status : boolean
  continuousDays : number
  lastSignDate : string

}


// 新增排序变量 - 1:最新排序（默认），2:热门排序
const sortType = ref(1)

const route = useRoute()
const section = ref<Section | null>(null)
const sectionId = ref(0)
const isFollowed = ref<boolean | null>(null) // 关注状态：true=已关注, false=未关注, null=未知

//发帖相关变量
const postDialogVisible = ref(false) // 控制弹窗显示
const postForm = ref<PostForm>({ title: '', content: '' }) // 发帖表单数据
const postFormRef = ref<FormInstance>() // 表单引用

const fetchSectionData = async (id: number) => {
  try {
    const response = await axios.get('http://localhost:8080/user/sections/sectionDetail', {
      params: { id },
      headers: { token: localStorage.getItem('token') || '' }
    })

    if (response.data.code === 1) {
      section.value = response.data.data
      // 获取板块信息后检查关注状态
      checkFollowStatus(id)
      // 获取板块信息后检查签到状态
      getSignStatus(id)
    } else {
      ElMessage.error(response.data.msg || '获取板块信息失败')
    }
  } catch (error) {
    console.error('请求失败:', error)
    ElMessage.error('网络请求失败，请稍后重试')
  }
}

// 检查用户是否关注该板块
const checkFollowStatus = async (sectionId: number) => {
  try {
    const response = await axios.get('http://localhost:8080/user/sections/isFollowSec', {
      params: { sectionId : sectionId },
      headers: { token: localStorage.getItem('token') || '' }
    })

    if (response.data.code === 1) {
      // 设置关注状态
      isFollowed.value = response.data.data
      console.log(isFollowed.value ? '已关注此板块' : '未关注此板块')
    } else {
      ElMessage.error(response.data.msg || '检查关注状态失败')
      isFollowed.value = false // 默认设为未关注
    }
  } catch (error) {
    console.error('检查关注状态失败:', error)
    ElMessage.error('网络请求失败，请稍后重试')
    isFollowed.value = false // 默认设为未关注
  }
}

// 使用 watch 响应路由变化
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      const id = Number(newId)
      sectionId.value = id
      fetchSectionData(id)
    }
  },
  { immediate: true } // 立即执行一次
)

// 关注板块
const followSec = async (sectionId: number) => {
  try {
    const response = await axios.post(
      `http://localhost:8080/user/sections/followSec/${sectionId}`,
      null,
      {
        headers: { token: localStorage.getItem('token') || '' }
      }
    )

    if (response.data.code === 1) {
      ElMessage.success('关注成功')
      // 更新关注状态
      isFollowed.value = true
      // 更新关注数量
      if (section.value) {
        section.value.followersCount += 1
      }
    } else {
      ElMessage.error(response.data.msg || '关注失败')
    }
  } catch {
      ElMessage.error('出现未知错误')
  }
}

// 取消关注
const unfollowSec = async (sectionId: number) => {
  try {
    const response = await axios.delete(
      'http://localhost:8080/user/sections/unfollowSec',
      {
        params: { sectionId },
        headers: { token: localStorage.getItem('token') || '' }
      }
    )

    if (response.data.code === 1) {
      ElMessage.success('取消关注成功')
      // 更新关注状态
      isFollowed.value = false
      // 更新关注数量
      if (section.value) {
        section.value.followersCount = Math.max(0, section.value.followersCount - 1)
      }
    } else {
      ElMessage.error(response.data.msg || '取消关注失败')
    }
  } catch  {
      ElMessage.error('出现未知错误')
  }
}

const postRules = ref<FormRules<PostForm>>({
  title: [
    { required: true, message: '请输入帖子标题', trigger: 'blur' },
    { min: 3, message: '标题至少需要3个字符', trigger: 'blur' },
    { max: 50, message: '标题不能超过50个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入帖子内容', trigger: 'blur' },
    { min: 10, message: '内容至少需要10个字符', trigger: 'blur' },
    { max: 1000, message: '内容不能超过1000个字符', trigger: 'blur' }
  ]
})

// 发帖
const pushPost = () => {
  if (!localStorage.getItem('token')) {
    ElMessage.error('登录后即可发帖')
    return
  }
  
  // 重置表单
  postForm.value = { title: '', content: '' }
  // 打开弹窗
  postDialogVisible.value = true
}


// 新增提交帖子函数
const submitPost = async () => {
  // 表单验证
  if (!postFormRef.value) return
  const valid = await postFormRef.value.validate()
  if (!valid) return
  
  try {
    if (section.value === null) {
      ElMessage.error('无法获取板块信息')
      return
    }
    
    // 调用发帖API
    const response = await axios.post('http://localhost:8080/user/pushPost', {
      SectionId: section.value.id,
      title: postForm.value.title,
      content: postForm.value.content
    }, {
      headers: { token: localStorage.getItem('token') || '' }
    })
    
    if (response.data.code === 1) {
      ElMessage.success('发帖成功！')
      // 关闭弹窗
      postDialogVisible.value = false
      // 更新帖子数量
      if (section.value) {
        section.value.postCount += 1
      }

      sectionId.value = section.value.id // 这会触发posts组件重新加载
    } else {
      ElMessage.error(response.data.msg || '发帖失败')
      console.log(response.data.msg)
    }
  } catch (error) {
    console.error('发帖请求失败:', error)
    ElMessage.error('发帖失败，请稍后重试')
  }
}

const searchText = ref('');  // 修改变量名为 searchText
const router = useRouter();

const handleSearch = () => {
  const keyword = searchText.value.trim();
  if (keyword && section.value) {
    router.push({
      name: 'searchdetailinSec',
      query: { q: keyword ,s: section.value.id }  // 使用query参数传递搜索词
    });
  } else {
    ElMessage.warning('请输入搜索内容');
  }
};


const userSigIn = ref<UsesrSignIn | null>(null)//用户签到信息
const signInStatus = ref<boolean | undefined>(false)

//获取签到状态
const getSignStatus = async (id : number)=>{
  try{
    const response = await axios.get(`http://localhost:8080/user/SignIn/${id}`,
      {
        headers : {
          token: localStorage.getItem('token') || '' 
        }
      }
    )
    if(response.data.code === 1){
      //成功获取信息
      userSigIn.value = response.data.data
      signInStatus.value = userSigIn.value?.status
    }else{
      console.log(response.data.msg)
    }

    

  }catch{
    console.log("获取签到信息出现异常",id)
    ElMessage.error('出现异常')
  }

}


//签到
const sign = async (id : number)=>{
  try{
    const response = await axios.patch(`http://localhost:8080/user/SignIn/doSignIn/${id}`,{},
      { headers: { token: localStorage.getItem('token') || '' } }
    )
    if(response.data.code === 1){
      ElMessage.success('签到成功')
      signInStatus.value = true
    }else{
      ElMessage.error(response.data.msg)
    }

  }catch{
    ElMessage.error('签到失败')
  }
}

// 暴露searchText给父组件
defineExpose({
  searchText
});
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
    /* 关注按钮样式 */
.follow-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.3s;
}

.follow-btn:hover {
  background-color: #0069d9;
}

/* 已关注按钮样式 */
.unfollow-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.3s;
}

.unfollow-btn:hover {
  background-color: #218838;
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




/* 发帖图标样式 */
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

/* 签到图标样式 */
.edit-icon-1{
  position: fixed;
  top: 550px; /* 距离顶部距离，根据需要调整 */
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

.edit-icon-1:hover {
  background: #f5f7fa;
  transform: scale(1.05);
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .edit-icon-1 {
    right: 20px; /* 小屏幕时固定在右侧 */
  }
}


/* 发帖弹窗样式 */
:deep(.el-dialog) {
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

:deep(.el-dialog__header) {
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  padding: 20px;
  margin: 0;
  border-radius: 12px 12px 0 0;
}

:deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

:deep(.el-dialog__body) {
  padding: 25px;
}

:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-textarea__inner) {
  min-height: 150px !important;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding: 10px 20px;
}



/* 新增搜索框专属样式 */
.search-box {
  display: flex;
  margin: 15px 15px 15px auto; /* 右侧自动外边距实现右对齐 */
  max-width: 600px;
  gap: 8px;
  justify-content: flex-end; /* 确保内容右对齐 */
  align-items: center;       /* 垂直居中对齐 */
}





.search-icon {
  font-size: 16px !important;
  color: #bbb !important;
  margin-right: 8px;
}

.search-button {
  height: 36px !important; /* 与输入框同高 */
  border-radius: 0 !important; /* 完全方形按钮 */
  background: linear-gradient(135deg, #409eff, #6db0ff) !important;
  border: none !important;
  color: white !important;
  font-weight: 500 !important;
  padding: 0 20px !important;
  transition: transform 0.2s ease;
  align-self: stretch !important; /* &#9989; 确保按钮高度完全匹配 */
}

.search-button:hover {
  transform: scale(1.02);
}

/* 响应式适配 */
@media (max-width: 768px) {
  .search-box {
    flex-direction: column;
    padding: 0 10px;
    justify-content: stretch !important; /* 移动端恢复常规流 */
    margin: 15px !important; /* 重置外边距 */
  }
  
  
  .search-button {
    margin-top: 8px;
    border-radius: 0 !important;
    height: auto !important; /* 恢复自适应高度 */
    width: 100%; /* 移动端按钮占满宽度 */
  }
}


/* 新增排序控制区域样式 */
.sort-controls {
  margin: 20px 0;
  display: flex;
  justify-content: flex-end;
}

/* 可选：调整排序按钮的样式 */
.sort-controls .el-radio-group {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 4px;
}

.sort-controls .el-radio-button {
  --el-radio-button-checked-bg-color: #ffffff;
  --el-radio-button-checked-text-color: #409eff;
  --el-radio-button-checked-border-color: #409eff;
}

.sort-controls .el-radio-button:first-child .el-radio-button__inner {
  border-radius: 4px 0 0 4px;
}

.sort-controls .el-radio-button:last-child .el-radio-button__inner {
  border-radius: 0 4px 4px 0;
}


</style>
