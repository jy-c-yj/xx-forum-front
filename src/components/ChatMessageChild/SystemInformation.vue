<template>
  <div class="system-information-container">
    <!-- 消息分类标签 -->
    <div class="tabs">
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'like' }"
        @click="changeTab('like')"
      >
        <span>点赞</span>
        <el-badge 
          :value="likeUnreadCount" 
          :max="99" 
          :hidden="likeUnreadCount === 0" 
          class="badge"
        />
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'reply' }"
        @click="changeTab('reply')"
      >
        <span>回复</span>
        <el-badge 
          :value="replyUnreadCount" 
          :max="99" 
          :hidden="replyUnreadCount === 0" 
          class="badge"
        />
      </div>
    </div>

    <!-- 消息内容区域 -->
    <div class="content-container">
      <!-- 点赞消息列表 -->
      <div v-show="activeTab === 'like'" class="message-list">
        <div 
          v-for="msg in likeMessages" 
          :key="msg.id" 
          class="message-item"
          :class="{ unread: !msg.isRead }"
        >
          <div class="message-content">
            <div class="message-header">
              <span class="sender-name">{{ msg.senderName }} </span>
              <span class="action-type">{{ getActionText(msg.type) }}</span>
              <span class="target-type">{{ msg.replyId ? '您的回复' : '您的帖子' }}</span>
            </div>
            
            <div v-if="msg.replyId" class="reply-content">
              {{ truncateContent(msg.content || '') }}
            </div>
            
            <div class="post-title">
              {{ truncateContent(msg.title || '') }}
            </div>
            
            <div class="message-footer">
              <span class="timestamp">{{ formatTime(msg.createTime) }}</span>
            </div>
          </div>
        </div>
        
        <div v-if="likeMessages.length === 0" class="empty-message">
          暂无点赞消息
        </div>
      </div>

      <!-- 回复消息列表 -->
      <div v-show="activeTab === 'reply'" class="message-list">
        <div 
          v-for="msg in replyMessages" 
          :key="msg.id" 
          class="message-item"
          :class="{ unread: !msg.isRead }"
        >
          <div class="message-content">
            <div class="message-header">
              <span class="sender-name">{{ msg.senderName }}</span>
              <span class="action-type">{{ getActionText(msg.type) }}</span>
              <span class="target-type">{{ msg.replyId ? '您的回复' : '您的帖子' }}</span>
            </div>
            
            <div v-if="msg.replyId" class="reply-content">
              {{ truncateContent(msg.content || '') }}
            </div>
            
            <div class="post-title">
              {{ truncateContent(msg.title || '') }}
            </div>
            
            <div class="message-footer">
              <span class="timestamp">{{ formatTime(msg.createTime) }}</span>
            </div>
          </div>
        </div>
        
        <div v-if="replyMessages.length === 0" class="empty-message">
          暂无回复消息
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="SystemInformation">
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import webSocket from '@/hooks/webSocket'
import format from '@/hooks/format'

interface Notification {
  id: number,
  type: number, // 通知类型: 1=点赞帖子, 2=点赞回复, 3=回复帖子, 4=回复评论
  senderId: number, // 触发者用户ID
  senderName: string, // 触发者用户名
  receiverId: number, // 接收者用户ID
  postId: number, // 关联帖子ID
  title: string, // 帖子标题
  replyId: number | null, // 关联回复ID
  content: string | null, // 回复内容
  isRead: boolean,
  createTime: string
}

// 工具函数
const { formatTime, truncateContent } = format()
const { connect, disconnect } = webSocket()

// 用户信息
const user = JSON.parse(localStorage.getItem('user') as string)
const currentUserId = user.id;
const token = ref(localStorage.getItem('token') || '')

// 状态管理
const activeTab = ref<'like' | 'reply'>('like')
const allNotifications = ref<Notification[]>([])
const isMarkingAsRead = ref(false) // 防止重复点击

// 计算属性
const likeMessages = computed(() => 
  allNotifications.value.filter(msg => [1, 2].includes(msg.type))
)

const replyMessages = computed(() => 
  allNotifications.value.filter(msg => [3, 4].includes(msg.type))
)

const likeUnreadCount = computed(() => 
  likeMessages.value.filter(msg => !msg.isRead).length
)

const replyUnreadCount = computed(() => 
  replyMessages.value.filter(msg => !msg.isRead).length
)

// 获取动作类型文本
const getActionText = (type: number): string => {
  switch (type) {
    case 1:
    case 2:
      return '点赞了';
    case 3:
    case 4:
      return '回复了';
    default:
      return '操作了';
  }
}

// 切换标签并标记该类别所有未读消息为已读
const changeTab = async (tab: 'like' | 'reply') => {
  // 切换标签
  activeTab.value = tab;
  
  // 获取当前类别的未读消息
  const unreadMessages = tab === 'like' 
    ? likeMessages.value.filter(msg => !msg.isRead)
    : replyMessages.value.filter(msg => !msg.isRead);
  
  // 如果没有未读消息，直接返回
  if (unreadMessages.length === 0 || isMarkingAsRead.value) return;
  
  isMarkingAsRead.value = true;
  
  try {
    // 获取需要标记为已读的消息ID列表
    const messageIds = unreadMessages.map(msg => msg.id);
    
    // 调用后端API批量标记为已读
    await axios.patch(
      `http://localhost:8080/user/chat/system/mark-read-batch`, 
      {  messageIds: unreadMessages.map(msg => msg.id) },
      { headers: { token: localStorage.getItem('token') || '' } }
    );
    
    // 更新前端状态
    unreadMessages.forEach(msg => {
      msg.isRead = true;
    });
    
  } catch (error) {
    console.error('批量标记已读失败:', error);
    ElMessage.error('批量标记已读失败');
  } finally {
    isMarkingAsRead.value = false;
  }
}

// 加载通知数据
const loadNotifications = async () => {
  try {
    const response = await axios.get('http://localhost:8080/user/chat/system/Notifications', {
      headers: { token: localStorage.getItem('token') || '' }
    });
    
    allNotifications.value = response.data.data;
    console.log("加载通知数据:", response.data.data);
  } catch (error) {
    console.error('加载通知失败:', error);
    ElMessage.error('加载通知失败');
  }
}

// WebSocket 消息处理
const handleWebSocketMessage = (rawMessage: string) => {
  try {
    const message = JSON.parse(rawMessage) as Notification;
    
    // 只处理当前用户的通知
    if (message.receiverId === currentUserId) {
      // 添加到通知列表开头
      allNotifications.value.unshift(message);
    }
  } catch (e) {
    console.error('解析WebSocket消息失败:', e);
  }
}

onMounted(async () => {
  // 加载初始通知数据
  await loadNotifications();
  
  // 连接WebSocket
  if (token.value) {
    connect(String(currentUserId), token.value, handleWebSocketMessage);
  } else {
    console.error('No token found for WebSocket connection');
  }
});

onBeforeUnmount(() => {
  disconnect();
});
</script>

<style scoped>
.system-information-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  background-color: #f8f8f8;
}

.tab-item {
  position: relative;
  flex: 1;
  text-align: center;
  padding: 15px 0;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.tab-item:hover {
  background-color: #f0f0f0;
}

.tab-item.active {
  color: #409eff;
  border-bottom: 2px solid #409eff;
}

.badge {
  position: absolute;
  top: 8px;
  right: 20px;
}

.content-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 15px;
}

.message-list {
  padding: 10px 0;
}

.message-item {
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.message-item.unread {
  background-color: #f5fbff;
}

.message-item:hover {
  background-color: #f9f9f9;
}

.message-content {
  flex: 1;
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.sender-name {
  font-weight: 600;
  color: #333;
  margin-right: 5px;
}

.action-type {
  color: #409eff;
  margin-right: 5px;
}

.target-type {
  color: #666;
}

.reply-content {
  background-color: #f8f8f8;
  border-left: 3px solid #e0e0e0;
  padding: 8px 12px;
  margin: 8px 0;
  border-radius: 0 4px 4px 0;
  color: #555;
  font-size: 14px;
}

.post-title {
  font-weight: 500;
  color: #333;
  margin: 8px 0;
  font-size: 15px;
}

.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
}

.timestamp {
  font-size: 12px;
  color: #999;
}

.empty-message {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
}
</style>