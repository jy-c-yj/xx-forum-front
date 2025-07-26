
<template>
    <!-- 弹窗组件 -->
  <el-dialog v-model="dialogVisible" title="回复评论" width="40%">
    <div class="dialog-content">
      <textarea v-model="newReplyContent" placeholder="写下你的回复..." class="reply-textarea"></textarea>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <button class="cancel-btn" @click="dialogVisible = false">取消</button>
        <button class="confirm-btn" @click="addReply">提交</button>
      </span>
    </template>
  </el-dialog>
<div>
    <div class="container">
      <div class="reply-container">
        <div class="reply-stats">
          <h2 class="reply-count">共 {{ replyCount }} 条回复</h2>
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
                  <button class="like-btn" :class="{liked: reply.liked}" @click="toggleLike(reply)">
                    <i class="fas fa-heart"></i>
                    <span class="like-count">{{ reply.likeCount }}</span>
                  </button>

                  <button class="reply-btn" @click="openReplyDialog(reply)">回复</button>
                
                </div>
              </div>
              <div class="reply-text">{{ reply.content }}</div>

              <div v-if="reply.children && reply.children.length > 0" class="children-section">
                <button class="toggle-children-btn" @click="toggleShowChildren(reply)">
                  {{ reply.showChildren ? '收起回复' : `展开回复 (${reply.children.length})` }}
                </button>
                <ul v-if="reply.showChildren" class="children-list">
                  <li v-for="child in reply.children" :key="child.id" class="child-item">
                    <img :src="child.image" class="avatar" alt="用户头像">
                    <div class="reply-content">
                      <div class="reply-header">
                        <div class="user-info">
                          <div class="username">{{ child.username }}</div>
                          <div class="reply-time">{{ formatTime(child.createdTime) }}</div>
                        </div>
                        <div class="reply-actions">
                          <button class="like-btn" :class="{liked: child.liked}" @click="toggleLike(child)">
                            <i class="fas fa-heart"></i>
                            <span class="like-count">{{ child.likeCount }}</span>
                          </button>
                          <button class="reply-btn" @click="openReplyDialog(child)">回复</button>
                        </div>
                      </div>
                      <div class="reply-text">{{ child.content }}</div>
                    </div>
                  </li>
                </ul>
              </div>

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
import { ref, onMounted, defineProps } from 'vue';
import axios from 'axios'
import formatDateTime from '@/hooks/format'
import { ElMessage } from 'element-plus';


// 日期时间格式化函数
let {formatTime} = formatDateTime()


// 定义props
const props = defineProps({
  postId: {
    type: Number,
    required: true
  },
    replyCount: {
    type: Number,
    required: true
  }
})

const replyCount = ref(props.replyCount)

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
  parentId: number,
  liked: boolean,
  children: Reply[] | null, // 添加children属性
  showChildren?: boolean // 添加本地状态控制子回复显示
}

// 使用类型Replies[]初始化
const Replies = ref<Reply[]>([])
const currentPage = ref(1)
const pageSize = ref(5)
const loading = ref(false)
const noMoreData = ref(false)
const newReplyContent = ref('') // 新回复内容
const parentId = ref(0) // 父回复ID，默认为0（回复主贴）
const dialogVisible = ref(false) // 控制回复弹窗显示
const currentReply = ref<Reply | null>(null) // 当前操作的回复项
const u = JSON.parse(localStorage.getItem('user') as string)
const uImage =ref('')
if(!u){
   uImage.value = 'https://web-cyj-sky.oss-cn-beijing.aliyuncs.com/d9480ea4-86db-43af-9008-3196b3c89ae2.jpg'
}else{
   uImage.value = u.image
}
const userAvatar = uImage.value // 用户头像
const likingStates = ref<{[key: number]: boolean}>({});


// 打开回复弹窗
const openReplyDialog = (reply: Reply) => {
  currentReply.value = reply;
  if(reply.parentId === 0){
    parentId.value = reply.id; // 设置父回复ID
  }else{
    parentId.value = reply.parentId; // 设置父回复ID
  }
  console.log("父回复 ====>",reply)
  dialogVisible.value = true; // 显示弹窗
};

// 切换子回复显示状态
const toggleShowChildren = (reply: Reply) => {
  // 切换显示状态
  reply.showChildren = !reply.showChildren;
  
  // 如果子回复列表未初始化，初始化它
  if (reply.showChildren && reply.children === null) {
    reply.children = [];
  }
};


//获取回复数据
const fetchReplies = async () => {
  if (loading.value || noMoreData.value) return
  
  loading.value = true
  try {
    const response = await axios.get('http://localhost:8080/user/reply', {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value,
        postid: props.postId
      },
      headers: {
        token: localStorage.getItem('token') || ''
      }
    })
    
    const newReplyList = response.data.data.records
    if (newReplyList.length === 0) {
      noMoreData.value = true
      return
    }
    
    // 处理回复数据，添加showChildren属性
    const processedList = newReplyList.map((reply: any) => {
      return {
        ...reply,
        liked: reply.liked || false,
        showChildren: false, // 默认不展开子回复
        // 确保children是数组或null
        children: Array.isArray(reply.children) && reply.children.length > 0 ? 
                  reply.children.map((child: any) => ({ ...child, liked: child.liked || false })) : 
                  null
      }
    })
    
    Replies.value = [...Replies.value, ...processedList]
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

// 添加新回复
const addReply = async () => {
  if (!newReplyContent.value.trim()) {
    ElMessage.warning('回复内容不能为空')
    return
  }
  
  try {
    const response = await axios.post(
      'http://localhost:8080/user/newReply',
      {
        content: newReplyContent.value,
        postId: props.postId,
        parentId: parentId.value
      },
      {
        headers: {
          token: localStorage.getItem('token') || ''
        }
      }
    )

    replyCount.value++;
    
    if (response.data.code === 1) {
      const newReply = {
        ...response.data.data,
        liked: false,
        children: null,
        showChildren: false
      }
      
      
      // 根据父ID决定添加到何处
      if (parentId.value === 0) {
        // 添加到主回复列表
        Replies.value = [newReply, ...Replies.value]
        console.log(22222223333333)
      } else {
        // 找到父回复并添加到其children中
        const parent = findParentReply(Replies.value, parentId.value)
        console.log("parent======>>>",parent)
        if (parent) {
          // 如果父回复的children不存在，初始化为空数组
          if (!parent.children) {
            parent.children = []
          }
          // 添加到子回复列表开头
          parent.children.unshift(newReply)
          // 确保父回复展开显示
          parent.showChildren = true
          console.log(22222222)
        } else {
          // 如果没找到父回复，添加到主列表
          console.log(111111111)
          Replies.value = [newReply, ...Replies.value]
        }
      }
      console.log(Replies)
      newReplyContent.value = ''
      dialogVisible.value = false
      ElMessage.success('回复成功')
    } else if(response.data.code === 0) {
      ElMessage.error(response.data.msg)
    }
  } catch (error) {
    console.error('添加回复失败:', error)
    ElMessage.error('回复失败，请重试')
  }
}

// 递归查找父回复
const findParentReply = (replies: Reply[], parentId: number): Reply | null => {
  for (const reply of replies) {
    if (reply.id === parentId) {
      return reply
    }
    if (reply.children && reply.children.length > 0) {
      const found = findParentReply(reply.children, parentId)
      if (found) {
        return found
      }
    }
  }
  return null
}

// 点赞功能 
const toggleLike = async (reply: Reply) => {
  if (likingStates.value[reply.id]) return;
  likingStates.value[reply.id] = true;

  try {
    // 简化请求数据 - 只需要回复ID和当前点赞状态
    const response = await axios.post(
      'http://localhost:8080/user/UpdataReplyLike', 
      {
        id: reply.id, // 回复ID
        likeCount: reply.likeCount,//当前点赞数
        userId : reply.userId,//点赞的对象
        liked: reply.liked // 当前点赞状态
      },
      {
        headers: {
          token: localStorage.getItem('token') || ''
        }
      }
    );
    
    if (response.data.code === 1) {
      console.log(response.data)
      if(reply.parentId === 0){
        
        console.log("父回复状态更新")
              const index = Replies.value.findIndex(r => r.id === reply.id);
              if (index !== -1) {
                // 使用后端返回的最新数据
                Replies.value[index].liked = response.data.data.liked;
                Replies.value[index].likeCount = response.data.data.likeCount;
              }
      }else{
        console.log("子回复状态更新")
        console.log("当前回复==>",reply)
        const findex = Replies.value.findIndex(r => r.id === reply.parentId);
        if (findex !== -1) {
        // 使用后端返回的最新数据
        
        const creplies = Replies.value[findex].children
        console.log("当前回复所在父回复的子回复数组==>",creplies)
              if(creplies){
                const cindex = creplies.findIndex(r => r.id === reply.id);
              
              if (cindex !== -1) {
                // 使用后端返回的最新数据
                creplies[cindex].liked = response.data.data.liked;
                creplies[cindex].likeCount = response.data.data.likeCount;
                console.log("当前回复更新后的数据==>",creplies)
              }
            }
        }
      }

      
      // 修正消息提示
      ElMessage.success(response.data.data.liked ? '点赞成功' : '已取消点赞');
    } else if(response.data.code === 0){
      ElMessage.error(response.data.msg ||'请先登陆')

    }else {
      ElMessage.error(response.data.msg || '操作失败');
    }
  } catch (error) {
    console.error('点赞操作失败:', error);
    ElMessage.error('操作失败，请重试');
  } finally {
    likingStates.value[reply.id] = false;
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
/* 点赞按钮样式 */
.like-btn {
  color: #8a8a8a; /* 未点赞时的灰色 */
  transition: color 0.3s ease;
}

.like-btn:hover {
  color: #ff6b6b; /* 悬停时的浅红色 */
}

.like-btn.liked {
  color: #ff6b6b; /* 点赞后的浅红色 */
}

/* 点赞动画效果 */
.like-btn.liked i {
  animation: pulse 0.5s;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
} 


/* 新增样式 */
.toggle-children-btn {
  background: none;
  border: none;
  color: #1890ff;
  cursor: pointer;
  font-size: 13px;
  padding: 5px 0;
  margin-top: 10px;
  display: inline-block;
}

.toggle-children-btn:hover {
  text-decoration: underline;
}

.children-section {
  margin-top: 10px;
}

.children-list {
  list-style: none;
  padding: 0;
  margin: 10px 0 0 0;
  border-left: 2px solid #e8e8e8;
  padding-left: 20px;
}

.child-item {
  padding: 15px 0;
  border-bottom: 1px solid #f0f2f5;
}

.child-item:last-child {
  border-bottom: none;
}

.reply-btn {
  background: none;
  border: none;
  color: #606266;
  cursor: pointer;
  font-size: 13px;
  margin-left: 10px;
  padding: 5px 10px;
  border-radius: 4px;
  transition: all 0.2s;
}

.reply-btn:hover {
  background-color: #f5f7fa;
  color: #1890ff;
}

/* 弹窗样式 */
.dialog-content {
  padding: 15px 0;
}

.reply-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  resize: vertical;
  font-size: 14px;
  line-height: 1.5;
}

.reply-textarea:focus {
  outline: none;
  border-color: #1890ff;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn, .confirm-btn {
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.cancel-btn {
  background-color: #f5f7fa;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.cancel-btn:hover {
  background-color: #e4e7ed;
}

.confirm-btn {
  background-color: #1890ff;
  color: white;
  border: none;
}

.confirm-btn:hover {
  background-color: #40a9ff;
}

/* 调整回复操作区域 */
.reply-actions {
  display: flex;
  align-items: center;
}

</style>
 
   