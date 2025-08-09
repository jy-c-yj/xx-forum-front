<template>
  <div class="chat-container">
    <!-- 用户列表（显示头像、姓名和最后一条消息） -->
    <div class="user-list">
      <div 
        v-for="contact in contacts" 
        :key="contact.senderId" 
        class="user-item"
        :class="{ active: activeContactId === contact.senderId }"
        @click="setActiveContact(contact)"
      >
        <div class="avatar-container">
          <img 
            :src="contact.avatar" 
            class="avatar"
            alt="avatar"
          />
          <!-- 未读消息红点 -->
          <span v-if="contact.unreadCount > 0" class="unread-badge">
            {{ contact.unreadCount > 9 ? '9+' : contact.unreadCount }}
          </span>
        </div>
        <div class="user-info">
          <div class="user-name">{{ contact.name }}</div>
          <div class="last-message">{{ truncateContent(contact.lastMessage) }}</div>
        </div>
        <div class="message-time">{{ formatTime(contact.lastMessageTime) }}</div>
      </div>
    </div>
    
    <!-- 聊天区域 -->
    <div class="chat-area" v-if="currentContact">
      <div class="chat-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <img 
            :src="currentContact.avatar" 
            class="avatar"
            alt="avatar"
          />
          <div>{{ currentContact.name }}</div>
        </div>
      </div>
      
      <div class="chat-content" ref="chatContent">
        <div 
          v-for="msg in conversation" 
          :key="msg.id" 
          class="message-bubble"
          :class="msg.type === 1 ? 'message-sent' : 'message-received'"
        >
          <div>{{ msg.message }}</div>
          <div class="message-info">
            <div>{{ formatTime(msg.createTime) }}</div>
          </div>
        </div>
      </div>
      
      <div class="chat-input">
        <textarea 
          class="message-input" 
          v-model="newMessage" 
          placeholder="输入消息..." 
          @keyup.enter="sendMessage"
        ></textarea>
        <button class="send-button" @click="sendMessage">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
    
    <!-- 没有选中用户时的提示 -->
    <div class="empty-chat" v-if="!currentContact">
      <div class="empty-content">
        <i class="fas fa-comments"></i>
        <p>请从左侧列表中选择一个聊天</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="PrivateMessageChat">
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue'
import webSocket from '@/hooks/webSocket'

const {connect,sendsMessage,disconnect} = webSocket()
// 定义联系人类型
interface Contact {
  senderId: number // 联系人用户ID
  name: string      // 联系人姓名
  avatar: string    // 联系人头像URL
  lastMessage: string // 最后一条消息内容
  lastMessageTime: string // 最后一条消息时间
  unreadCount : number //未读消息数
}
// 定义消息类型
interface Message_ {
  from: number
  to: number
  message: string
  createTime: string
}


// 定义消息类型
interface Message {
  id: number
  senderId: number
  receiverId: number
  message: string
  createTime: string
  type: number // 1=自己发送，2=接收
}
const user = JSON.parse(localStorage.getItem('user') as string)
const currentUserId = user.id;
const currentUserName = user.username; // 根据实际情况获取
const token = ref(localStorage.getItem('token') || '')
// 联系人列表
const contacts = ref<Contact[]>([]);

// 当前选中的联系人ID
const activeContactId = ref<number | null>(null);

// 当前对话联系人
const currentContact = ref<Contact | null>(null);
const chatContent = ref<HTMLDivElement | null>(null);
const newMessage = ref('');

// 对话内容
const conversation = ref<Message[]>([]);

// 获取时间格式化
const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// 内容截取函数
const truncateContent = (text: string): string => {
  return text.length > 30 ? text.substring(0, 30) + '...' : text;
}

onMounted(async () => {
  contacts.value = await fetchContacts();

  if (contacts.value.length > 0) {
    await setActiveContact(contacts.value[0]);
  }
  
  // 连接 WebSocket 时传递 token
  if (token.value) {

    connect(String(currentUserId), token.value, handleIncomingMessage);
  } else {
    console.error('No token found for WebSocket connection');
  }
});

// 组件卸载时断开连接
onBeforeUnmount(() => {
  disconnect();
});

const handleIncomingMessage = (messageBody: string) => {
  console.log("Received message body:", messageBody);
  
  try {
    const message = JSON.parse(messageBody);
    console.log("Parsed message:", message);
    
    // 确保消息格式正确
    if (!message.from || !message.content) {
      console.warn('Received invalid message:', message);
      return;
    }
    
    // 创建统一的消息对象
    const newMsg: Message = {
      id: message.id || Date.now(),
      senderId: message.from,
      receiverId: currentUserId,
      message: message.content,
      createTime: message.timestamp || new Date().toISOString(),
      type: 2 // 接收的消息
    };
    
    console.log("Processed message:", newMsg);
    
    // 如果消息来自当前正在聊天的联系人
    if (currentContact.value && currentContact.value.senderId === newMsg.senderId) {
      conversation.value.push(newMsg);
      
      // 滚动到底部
      nextTick(() => {
        if (chatContent.value) {
          chatContent.value.scrollTop = chatContent.value.scrollHeight;
        }
      });
    } else {
      // 更新联系人列表
      const contactIndex = contacts.value.findIndex(c => c.senderId === newMsg.senderId);
      if (contactIndex !== -1) {
        contacts.value[contactIndex].lastMessage = newMsg.message;
        contacts.value[contactIndex].lastMessageTime = newMsg.createTime;

      // 增加未读计数（如果用户不是当前聊天对象）
      contacts.value[contactIndex].unreadCount++;
        
        // 将更新的联系人移到顶部
        const updatedContact = contacts.value.splice(contactIndex, 1)[0];
        contacts.value.unshift(updatedContact);
      }else {
      // 如果是新联系人，添加到列表顶部
      contacts.value.unshift({
        senderId: newMsg.senderId,
        name: '新联系人', // 需要从后端获取实际名称
        avatar: 'default_avatar.png',
        lastMessage: newMsg.message,
        lastMessageTime: newMsg.createTime,
        unreadCount: 1
      });
    }
    }
  } catch (e) {
    console.error('Failed to process message:', e);
  }
};


// 发送消息
const sendMessage = async () => {
  if (!newMessage.value.trim() || !currentContact.value) return;
  if (!currentContact.value) return;
  
  // 与后端一致的格式
  const messageToSend = {
    to: String(currentContact.value.senderId),
    content: newMessage.value,
    timestamp: new Date().toISOString()
  };
  
  // 本地消息格式
  const localMsg: Message = {
    id: Date.now(),
    senderId: currentUserId,
    receiverId: currentContact.value.senderId,
    message: newMessage.value,
    createTime: new Date().toISOString(),
    type: 1 // 自己发送
  };
  
  // 发送到WebSocket
  const sendSuccess = sendsMessage(messageToSend);
  
  if (sendSuccess) {
    // 添加到对话
    conversation.value.push(localMsg);
    
    // 更新联系人最后一条消息
    const contactIndex = contacts.value.findIndex(c => c.senderId === currentContact.value?.senderId);
    if (contactIndex !== -1) {
      contacts.value[contactIndex].lastMessage = newMessage.value;
      contacts.value[contactIndex].lastMessageTime = localMsg.createTime;
      
      // 将更新的联系人移到顶部
      const updatedContact = contacts.value.splice(contactIndex, 1)[0];
      contacts.value.unshift(updatedContact);
    }
    
    // 清空输入框
    newMessage.value = '';
    
    // 滚动到底部
      nextTick(() => {
        chatContent.value?.scrollTo({
          top: chatContent.value.scrollHeight,
          behavior: 'smooth'
        });
      });
  } else {
    ElMessage.error('消息发送失败，请检查网络连接');
  }
};
// 获取联系人列表
const fetchContacts = async () => {
    const response = await axios.get('http://localhost:8080/user/chat/private/Contacts',{
      headers : {
        token: localStorage.getItem('token') || ''
      }
    })

    if(response.data.code === 1){
      console.log('===================',response.data.data)
      return response.data.data
    }
    else {
      ElMessage.error('搜索联系人出错')
    }
}

// 获取对话历史
const fetchConversation = async (contactId: number) => {
      try{
          const response = await axios.get('http://localhost:8080/user/chat/private/Message',{
            params : {
              contactId : contactId
            },
            headers : {
              token: localStorage.getItem('token') || ''
            }
          })

        if(response.data.code === 1){
          return response.data.data
        }
        else {
          ElMessage.error('聊天信息出错')
        }

      }catch{
        ElMessage.error('聊天信息出错')
      }
}
//设置消息可读
const markMessagesAsRead = async (senderId: number) => {
  try {
    await axios.post('http://localhost:8080/user/chat/private/markAsRead', {
      senderId: senderId,
      receiverId: currentUserId
    }, {
      headers: {
        token: localStorage.getItem('token') || ''
      }
    });
  } catch (error) {
    console.error('标记消息为已读失败:', error);
  }
};
// 设置当前联系人
const setActiveContact = async (contact: Contact) => {
  
    // 如果该联系人有未读消息，标记为已读
  if (contact.unreadCount > 0) {
    await markMessagesAsRead(contact.senderId);
    
    // 更新本地未读计数
    const contactIndex = contacts.value.findIndex(c => c.senderId === contact.senderId);
    if (contactIndex !== -1) {
      contacts.value[contactIndex].unreadCount = 0;
    }
  }
  currentContact.value = contact;
  activeContactId.value = contact.senderId;
  
  // 加载对话历史
  conversation.value = await fetchConversation(contact.senderId);
  
  // 滚动到底部
  nextTick(() => {
    if (chatContent.value) {
      chatContent.value.scrollTop = chatContent.value.scrollHeight;
    }
  });
};

handleIncomingMessage

// 组件挂载时加载联系人
onMounted(async () => {
  contacts.value = await fetchContacts();
  console.log('--------------------',contacts.value)
  if (contacts.value.length > 0) {
    await setActiveContact(contacts.value[0]);
  }
});
</script>

<style scoped>
/* 主容器样式 */
.chat-container {
  display: flex;
  height: 100%;
  max-height: 700px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background: #fff;
}

/* 用户列表样式 */
.user-list {
  width: 300px;
  border-right: 1px solid #e9ecef;
  overflow-y: auto;
  background: #f8f9fa;
  padding: 10px 0;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #eee;
  position: relative;
  transition: background-color 0.2s;
}

.user-item.active, .user-item:hover {
  background-color: #e6f7ff;
  border-left: 3px solid #2196f3;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 500;
  font-size: 15px;
  color: #333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.last-message {
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-time {
  font-size: 12px;
  color: #999;
  position: absolute;
  top: 15px;
  right: 15px;
}

/* 聊天区域样式 */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.chat-header {
  padding: 15px 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  background: #f8f9fa;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  font-weight: 500;
  font-size: 16px;
}

.chat-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f9fbfd;
  display: flex;
  flex-direction: column;
}

.message-bubble {
  max-width: 75%;
  padding: 12px 16px;
  margin-bottom: 15px;
  border-radius: 18px;
  position: relative;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-sent {
  background: #2196f3;
  color: white;
  margin-left: auto;
  border-bottom-right-radius: 4px;
}

.message-received {
  background: white;
  border: 1px solid #e0e0e0;
  margin-right: auto;
  border-bottom-left-radius: 4px;
}

.message-info {
  display: flex;
  justify-content: flex-end;
  font-size: 0.75rem;
  margin-top: 5px;
  opacity: 0.8;
}

.message-sent .message-info {
  color: rgba(255,255,255,0.85);
}

.chat-input {
  padding: 15px;
  display: flex;
  gap: 10px;
  background: white;
  border-top: 1px solid #eee;
}

.message-input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 24px;
  resize: none;
  height: 50px;
  font-size: 15px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05) inset;
}

.message-input:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.15);
}

.send-button {
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(33, 150, 243, 0.3);
}

.send-button:hover {
  background: #0b7dda;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(33, 150, 243, 0.3);
}

/* 空状态提示 */
.empty-chat {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fbfd;
}

.empty-content {
  text-align: center;
  color: #777;
}

.empty-content i {
  font-size: 48px;
  margin-bottom: 15px;
  color: #2196f3;
  opacity: 0.2;
}

.empty-content p {
  font-size: 16px;
  color: #666;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .chat-container {
    flex-direction: column;
    height: 90vh;
    max-height: none;
  }
  
  .user-list {
    width: 100%;
    height: 140px;
    border-right: none;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    flex-wrap: nowrap;
    padding: 10px 5px;
  }
  
  .user-item {
    flex-direction: column;
    min-width: 100px;
    text-align: center;
    padding: 10px;
    border-bottom: none;
    border-right: 1px solid #eee;
    border-left: none;
    height: 120px;
    position: relative;
  }
  
  .user-item.active, .user-item:hover {
    border-left: none;
    border-top: 3px solid #2196f3;
  }
  
  .avatar {
    margin-right: 0;
    width: 50px;
    height: 50px;
  }
  
  .user-info {
    margin-top: 8px;
    width: 100%;
  }
  
  .user-name {
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .last-message {
    font-size: 12px;
  }
  
  .message-time {
    position: static;
    margin-top: 5px;
    font-size: 10px;
  }
  
  .chat-header {
    padding: 10px 15px;
  }
  
  .chat-content {
    padding: 15px 10px;
  }
  
  .message-bubble {
    max-width: 85%;
  }
}
/* 添加未读消息红点样式 */
.avatar-container {
  position: relative;
  display: inline-block;
}

.unread-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background-color: #f56c6c;
  color: white;
  border-radius: 10px;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
</style>