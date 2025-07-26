
<template>
<div>
    <div class="container">
      <div class="reply-container">
        <div class="reply-stats">
          <div class="sort-options">
            <div class="sort-btn active">最新</div>
            <div class="sort-btn">最热</div>
            <div class="sort-btn">最早</div>
          </div>
        </div>
        
        <ul v-infinite-scroll="loadMore" class="reply-list" :infinite-scroll-disabled="loading" infinite-scroll-distance="50">
          <li v-for="(reply, index) in Replies" :key="reply.id" class="reply-item">
            <img :src="reply.image" class="avatar" alt="用户头像">
            <div class="reply-content">
              <div class="reply-header">
                <div class="user-info">
                  <div class="username">{{ reply.username }}</div>
                  <div class="reply-time">{{ formatTime(reply.createdTime) }}</div>
                </div>
                <div class="reply-actions">
                  <button class="like-btn" :class="{liked: reply.likeCount}" @click="">
                    <i class="fas fa-heart"></i>
                    <span class="like-count">{{ reply.likeCount }}</span>
                  </button>
                </div>
              </div>
              <div class="reply-text">{{ reply.content }}</div>
            </div>
          </li>
          
          <div v-if="loading" class="loading-indicator">
            <i class="fas fa-spinner"></i> 加载中...
          </div>
          
          <div v-if="noMoreData" class="no-more">没有更多回复了</div>
        </ul>
        
        <div class="reply-input">
          <div class="input-title">发表你的回复</div>
          <div class="input-container">
            <img :src="userAvatar" class="user-avatar" alt="我的头像">
            <div class="input-box">
              <textarea placeholder="写下你的想法..." v-model="newReplyContent"></textarea>
              <button class="submit-btn" @click="addReply">提交</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="reply">
import { ref, onMounted } from 'vue';
import axios from 'axios'
import formatDateTime from '@/hooks/format'

// 日期时间格式化函数
let {formatTime} = formatDateTime()

// 定义回复对象类型
interface Reply {
  username: string,
  image: string,
  id: number,
  content: string,
  userId: number,
  postId: number,
  likeCount: number,
  createdTime: string,
  parentId: number
}

// 使用类型Replies[]初始化
const Replies = ref<Reply[]>([])
const postid = ref(2); // 实际项目中可能从路由参数获取
const currentPage = ref(1)
const pageSize = ref(5)
const loading = ref(false)
const noMoreData = ref(false)
const newReplyContent = ref('') // 新回复内容
const parentId = ref(0) // 父回复，默认为0，即回复帖子
const u = JSON.parse(localStorage.getItem('user') as string)
const userAvatar = u.image // 用户头像

// 获取当前用户信息（简化版）
const getCurrentUser = () => {
  // 实际项目中应从localStorage或状态管理获取
  return {
    username: '当前用户',
    image: userAvatar.value
  }
}

const fetchReplies = async () => {
  if (loading.value || noMoreData.value) return
  
  loading.value = true
  try {
    const response = await axios.get('http://localhost:8080/user/reply', {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value,
        postid: postid.value
      }
    })
    
    const newReplyList = response.data.data.records
    if (newReplyList.length === 0) {
      noMoreData.value = true
      return
    }
    
    Replies.value = [...Replies.value, ...newReplyList]
    currentPage.value++
    
    if (newReplyList.length < pageSize.value) {
      noMoreData.value = true
    }
  } catch (error) {
    console.error('获取回复数据失败:', error)
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (!loading.value && !noMoreData.value) {
    fetchReplies()
  }
}

onMounted(() => {
  fetchReplies()
})

// addReply方法
const addReply = async () => {
  // 1. 验证输入
  if (!newReplyContent.value.trim()) {
    console.log('回复内容不能为空')
    return
  }
  
  try {
    // 2. 发送请求
    const response = await axios.post(
      'http://localhost:8080/user/newReply',
      {
        content: newReplyContent.value, // 使用明确的字段名
        postId: postid.value,
        parentId: parentId.value
      },
      {
        headers: {
          token: localStorage.getItem('token') || '' // 添加空值处理
        }
      }
    )
    
    // 3. 处理成功响应
    if (response.data.code === 1) {
      // 从响应中获取新回复数据
      const newReplyData = response.data.data
      
      // 4. 将新回复添加到列表顶部
      Replies.value = [
        {
          ...newReplyData,
          username: getCurrentUser().username,
          image: getCurrentUser().image
        },
        ...Replies.value
      ]
      
      // 5. 重置输入框
      newReplyContent.value = ''
    } else {
      console.error('添加回复失败:', response.data.message)
    }
  } catch (error) {
    console.error('添加回复请求失败:', error)
  }
}
</script>

<style scoped>
/* 回复组件容器 */
.reply-container {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  padding: 20px;
  margin-top: 25px;
}

/* 回复统计和排序 */
.reply-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f2f5;
}

.sort-options {
  display: flex;
  gap: 15px;
}

.sort-btn {
  padding: 6px 15px;
  border-radius: 16px;
  font-size: 14px;
  color: #606266;
  background-color: #f5f7fa;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sort-btn.active {
  background-color: #e6f7ff;
  color: #1890ff;
  font-weight: 500;
}

.sort-btn:hover {
  background-color: #e4e7ed;
}

/* 回复列表 */
.reply-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 10px;
}

/* 滚动条样式 */
.reply-list::-webkit-scrollbar {
  width: 6px;
}

.reply-list::-webkit-scrollbar-track {
  background: #f5f7fa;
  border-radius: 3px;
}

.reply-list::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.reply-list::-webkit-scrollbar-thumb:hover {
  background: #a0a4ad;
}

/* 单个回复项 */
.reply-item {
  display: flex;
  padding: 20px 0;
  border-bottom: 1px solid #f0f2f5;
}

.reply-item:last-child {
  border-bottom: none;
}

/* 头像 */
.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  margin-right: 15px;
  object-fit: cover;
}

/* 回复内容区域 */
.reply-content {
  flex: 1;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 600;
  color: #2c3e50;
  font-size: 15px;
}

.reply-time {
  font-size: 13px;
  color: #909399;
}

/* 回复操作按钮 */
.reply-actions {
  display: flex;
  align-items: center;
}

.like-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 16px;
  background-color: #f5f7fa;
  color: #606266;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.like-btn:hover {
  background-color: #f0f2f5;
}

.like-btn.liked {
  background-color: #fff0f6;
  color: #f759ab;
}

.like-btn i {
  font-size: 14px;
}

.like-count {
  font-size: 14px;
}

/* 回复文本 */
.reply-text {
  font-size: 15px;
  line-height: 1.6;
  color: #34495e;
  margin-bottom: 10px;
}

/* 加载指示器 */
.loading-indicator, .no-more {
  text-align: center;
  padding: 20px 0;
  color: #909399;
  font-size: 14px;
}

.loading-indicator i {
  margin-right: 8px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 回复输入区域 */
.reply-input {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f0f2f5;
}

.input-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 15px;
}

.input-container {
  display: flex;
  gap: 15px;
}

.user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
}

.input-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-box textarea {
  width: 100%;
  min-height: 100px;
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  resize: vertical;
  font-size: 14px;
  color: #606266;
  transition: border-color 0.2s;
}

.input-box textarea:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.submit-btn {
  align-self: flex-end;
  padding: 8px 20px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.submit-btn:hover {
  background-color: #40a9ff;
}
</style>
 
   