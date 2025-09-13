<template>
  <div id="app">
    <div class="post-detail-container" v-if="postdata">
      
      <!-- 帖子头部 -->
      <div class="post-header">
        <h1 class="post-title">{{ postdata.title }}</h1>
        
        <div class="post-meta">
          <img :src="postdata.image || 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg'" 
               class="author-avatar"
               alt="作者头像" 
               plain @click="dialogBottonVisible = true"
               >
          <div class="author-info">
            <div class="author-name">{{ postdata.username }}</div>
            <div class="post-time">
              发布于 {{ formatDateTime(postdata.createdTime) }} 
              <span v-if="postdata.lastReplyTime">
                · 更新于 {{ formatDateTime(postdata.lastReplyTime) }}
              </span>
            </div>
          </div>
          
          <div class="stats">
            <div class="stat-item">
              <i class="el-icon-view"></i> 观看:{{ postdata.viewCount }}
            </div>                 
          </div>
        </div>
        <!-- 新增：版主操作按钮 -->
        <div class="moderator-actions" v-if="isModerator">
            <el-dropdown @command="handleModeratorCommand">
              <el-button type="warning">
                版主操作<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="banPost">封禁帖子</el-dropdown-item>
                  <el-dropdown-item command="pinPost">置顶帖子</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
        </div>
      </div>
     

      <!-- 新增：封禁帖子对话框 -->
      <el-dialog v-model="banDialogVisible" title="封禁帖子" width="500px">
        <el-form :model="banForm">
          <el-form-item label="封禁原因">
            <el-input 
              v-model="banForm.reason" 
              type="textarea" 
              :rows="4"
              placeholder="请输入封禁原因"
            ></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="banDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmBanPost(postId)">确认封禁</el-button>
          </span>
        </template>
      </el-dialog>


      <el-dialog v-model="dialogBottonVisible"  width="800">
        <el-button class="!ml-0" >
            个人信息
        </el-button>   
        <el-button class="!ml-1" v-if="isUser" @click="send(postdata.userId)">
            私聊
        </el-button>
        <el-button class="!ml-0" v-if="isModerator && isUser" @click="confirmBanUser(postdata.userId,postdata.sectionId)">
            封禁
        </el-button>     
      </el-dialog>   
     
      
      <!-- 帖子内容 -->
      <div class="post-content" v-html="postdata.content"></div>
      
      <!-- 操作按钮 -->
      <div class="actions">
        <!-- 点赞按钮 -->
        <el-button 
          type="primary" 
          plain 
          @click="handleLike"
          :class="{ 'liked': postdata.liked }"
          :disabled="likeLoading"
        >
          <i class="el-icon-thumb"></i> 
          {{ getLikeButtonText() }} 
          ({{ postdata.likeCount }})
        </el-button>
        
        <!-- 收藏按钮 -->
        <el-button 
          type="success" 
          plain 
          @click="handleCollect"
          :class="{ 'collected': postdata.collected }"
          :disabled="collectLoading"
        >
          <i class="el-icon-star-off"></i> 
          {{ getCollectButtonText() }} 
          ({{ postdata.collectCount }})
        </el-button>
        <el-button type="info" plain>
          <i class="el-icon-share"></i> 分享
        </el-button>
      </div>
      
      <!-- 回复区域 -->
      <div class="replies-section">
        <div>
          <reply :post-id="postId" :reply-count="replyCount"></reply>
        </div>
      </div>
    </div>
    
    <div v-else class="loading-container">
      <el-skeleton :rows="6" animated />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute,useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import Reply from '@/components/reply.vue'
import ChatMessage from './chatMessage.vue'
import ModeratorCommand from '@/hooks/ModeratorCommand'

// 定义帖子详情数据类型
interface PostDetail {
  id: number;
  title: string;
  content: string;
  username: string;
  userId: number;
  image: string;
  sectionId : number;
  viewCount: number;
  replyCount: number;
  collectCount: number;
  likeCount : number;
  createdTime: string;
  lastReplyTime: string | null;
  liked : boolean; // 记录点赞状态
  collected : boolean; //记录收藏状态
}

const route = useRoute()
const router = useRouter()
const postdata = ref<PostDetail | null>(null)
const postId = ref<number>(0)
const replyCount = ref<number>(0)
const likeLoading = ref(false) // 点赞操作加载状态
const collectLoading = ref(false) // 收藏操作加载状态
const isUser = ref(true)



// 从路由参数获取帖子ID
postId.value = parseInt(route.params.id as string)

// 日期时间格式化函数
const formatDateTime = (dateTime: string | null) => {
  if (!dateTime) return '';
  try {
    const date = new Date(dateTime);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    console.error('日期格式化错误:', e);
    return dateTime;
  }
};

// 获取帖子详情
const fetchPostDetail = async (id: number) => {
  try {
    const response = await axios.get('http://localhost:8080/user/postdetail', {
      params: { postid: id }
    });
    
    postdata.value = response.data.data;

    //判断发帖人是否为此用户
    const u = JSON.parse(localStorage.getItem('user') as string) 
    if(response.data.data.userId === u.id ){
      isUser.value = false
    }
    console.log("u1 = {},u2 = {}",response.data.data.userId , u.id,isUser.value)

    checkUserModeratorStatus(response.data.data.sectionId)
    // 如果详情中包含回复数，更新replyCount
    if (postdata.value?.replyCount) {
      replyCount.value = postdata.value.replyCount;
    }
    
    // 检查点赞状态（如果用户已登录）
    const token = localStorage.getItem('token');
    if (token) {
      await checkLike(); // 检查点赞状态
      await checkCollect(); // 检查收藏状态
    } else {
      // 未登录用户默认未点赞
      if (postdata.value) {
        postdata.value.liked = false;
        postdata.value.collected = false;
      }
    }
  } catch (error) {
    console.error('获取帖子数据失败:', error);
    ElMessage.error('获取帖子详情失败，请稍后重试');
  }
};

// 监听路由参数变化
watch(() => route.params.id, (newId) => {
  const id = parseInt(newId as string)
  if (!isNaN(id)) {
    postId.value = id
    fetchPostDetail(id)
  }
})

// 获取点赞按钮文本
const getLikeButtonText = () => {
  if (!postdata.value) return '点赞';
  
  if (!localStorage.getItem('token')) {
    return '点赞';
  }
  
  return postdata.value.liked ? '已点赞' : '点赞';
}

// 获取收藏按钮文本
const getCollectButtonText = () => {
  if (!postdata.value) return '收藏';
  
  if (!localStorage.getItem('token')) {
    return '收藏';
  }
  
  return postdata.value.collected ? '已收藏' : '收藏';
}

// 处理点赞/取消点赞操作
const handleLike = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    ElMessage.warning('请先登录后再点赞');
    return;
  }
  
  if (!postdata.value) return;
  
  likeLoading.value = true;
  
  try {
    if (postdata.value.liked) {
      await unlike();
    } else {
      await like();
    }
  } catch (error) {
    console.error('点赞操作失败:', error);
    ElMessage.error('操作失败，请稍后重试');
  } finally {
    likeLoading.value = false;
  }
}


// 处理收藏/取消收藏操作
const handleCollect = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    ElMessage.warning('请先登录后再收藏');
    return;
  }
  
  if (!postdata.value) return;
  
  collectLoading.value = true;
  
  try {
    if (postdata.value.collected) {
      await uncollect();
    } else {
      await collect();
    }
  } catch (error) {
    console.error('收藏操作失败:', error);
    ElMessage.error('操作失败，请稍后重试');
  } finally {
    collectLoading.value = false;
  }
}


// 帖子点赞
const like = async () => {
  if (!postdata.value) return;
  
  try {
    const response = await axios.post(
      `http://localhost:8080/user/likePost/${postId.value}`,
      null,
      {
        headers: { token: localStorage.getItem('token') || '' }
      }
    );

    if (response.data.code === 1) {
      ElMessage.success('点赞成功');
      // 更新本地状态
      postdata.value.liked = true;
      postdata.value.likeCount += 1;
    } else {
      console.log(response.data.msg)
      ElMessage.error(response.data.msg || '点赞失败');
    }
  } catch (error) {
    console.error('点赞失败:', error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        ElMessage.error(`点赞失败: ${error.response.status} ${error.response.data?.msg || ''}`);
      } else {
        ElMessage.error(`网络错误: ${error.message}`);
      }
    } else {
      ElMessage.error('未知错误，请稍后重试');
    }
  }
}

// 取消帖子点赞
const unlike = async () => {
  if (!postdata.value) return;
  
  try {
    const response = await axios.delete(
      'http://localhost:8080/user/unlikePost',
      {
        params: { postId: postId.value },
        headers: { token: localStorage.getItem('token') || '' }
      }
    );

    if (response.data.code === 1) {
      ElMessage.success('取消点赞成功');
      // 更新本地状态
      postdata.value.liked = false;
      postdata.value.likeCount = Math.max(0, postdata.value.likeCount - 1);
    } else {
      ElMessage.error(response.data.msg || '取消点赞失败');
    }
  } catch (error) {
    console.error('取消点赞失败:', error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        ElMessage.error(`取消点赞失败: ${error.response.status} ${error.response.data?.msg || ''}`);
      } else {
        ElMessage.error(`网络错误: ${error.message}`);
      }
    } else {
      ElMessage.error('未知错误，请稍后重试');
    }
  }
}

// 检查帖子是否已被点赞
const checkLike = async () => {
  if (!postdata.value) return;
  
  try {
    const response = await axios.get(
      'http://localhost:8080/user/checkLike',
      {
        params: { postId: postId.value },
        headers: { token: localStorage.getItem('token') || '' }
      }
    );

    if (response.data.code === 1) {
      // 更新本地点赞状态
      postdata.value.liked = response.data.data;
    } else {
      ElMessage.error(response.data.msg || '检查点赞状态失败');
      // 默认未点赞
      postdata.value.liked = false;
    }
  } catch (error) {
    console.error('检查点赞状态失败:', error);
    ElMessage.error('网络请求失败，请稍后重试');
    // 默认未点赞
    if (postdata.value) {
      postdata.value.liked = false;
    }
  }
}


// 收藏帖子
const collect = async () => {
  if (!postdata.value) return;
  
  try {
    const response = await axios.post(
      `http://localhost:8080/user/collectPost/${postId.value}`,
      null,
      {
        headers: { token: localStorage.getItem('token') || '' }
      }
    );

    if (response.data.code === 1) {
      ElMessage.success('收藏成功');
      // 更新本地状态
      postdata.value.collected = true;
      postdata.value.collectCount += 1;
    } else {
      console.log(response.data.msg)
      ElMessage.error(response.data.msg || '收藏失败');
    }
  } catch (error) {
    console.error('收藏失败:', error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        ElMessage.error(`收藏失败: ${error.response.status} ${error.response.data?.msg || ''}`);
      } else {
        ElMessage.error(`网络错误: ${error.message}`);
      }
    } else {
      ElMessage.error('未知错误，请稍后重试');
    }
  }
}

// 取消收藏帖子
const uncollect = async () => {
  if (!postdata.value) return;
  
  try {
    const response = await axios.delete(
      'http://localhost:8080/user/uncollectPost',
      {
        params: { postId: postId.value },
        headers: { token: localStorage.getItem('token') || '' }
      }
    );

    if (response.data.code === 1) {
      ElMessage.success('取消收藏成功');
      // 更新本地状态
      postdata.value.collected = false;
      postdata.value.collectCount = Math.max(0, postdata.value.collectCount - 1);
    } else {
      ElMessage.error(response.data.msg || '取消收藏失败');
    }
  } catch (error) {
    console.error('取消收藏失败:', error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        ElMessage.error(`取消收藏失败: ${error.response.status} ${error.response.data?.msg || ''}`);
      } else {
        ElMessage.error(`网络错误: ${error.message}`);
      }
    } else {
      ElMessage.error('未知错误，请稍后重试');
    }
  }
}


// 检查帖子是否已被收藏
const checkCollect = async () => {
  if (!postdata.value) return;
  
  try {
    const response = await axios.get(
      'http://localhost:8080/user/checkCollect',
      {
        params: { postId: postId.value },
        headers: { token: localStorage.getItem('token') || '' }
      }
    );

    if (response.data.code === 1) {
      // 更新本地收藏状态
      postdata.value.collected = response.data.data;
    } else {
      ElMessage.error(response.data.msg || '检查收藏状态失败');
      // 默认未收藏
      postdata.value.collected = false;
    }
  } catch (error) {
    console.error('检查收藏状态失败:', error);
    ElMessage.error('网络请求失败，请稍后重试');
    // 默认未收藏
    if (postdata.value) {
      postdata.value.collected = false;
    }
  }
}





// 组件挂载时获取数据
onMounted(() => {
  if (postId.value) {
    fetchPostDetail(postId.value);
  }
});

import cM from '@/hooks/chatMessage'
const {dialogBottonVisible,chatMessage} = cM()
const send = (id : number)=>{
    chatMessage(id)
    const r = router.resolve({
      name: 'chatMessage' // 使用路由名称
    })
    window.open(r.href, '_blank')
    
}

//==========================================================

const handleModeratorCommand = async (command:any)=>{
  if (command === 'banPost') {
          banDialogVisible.value = true
          console.log("asdasdsadasdsa")
        } else if (command === 'pinPost') {
          pinPost();
        }

}

const {pinPost,confirmBanPost,checkUserModeratorStatus,confirmBanUser,isModerator,banDialogVisible,banForm} = ModeratorCommand()  

//==========================================================
</script>

<style scoped>

          .loading-container {
            padding: 20px;
          }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Helvetica Neue', Arial, sans-serif;
        }
        
        body {
            background-color: #f5f7fa;
            color: #333;
            line-height: 1.6;
            padding: 20px;
        }
        
        .post-detail-container {
            max-width: 750px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            overflow: hidden;
        }
        
        .post-header {
            padding: 30px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-bottom: 1px solid #eaeaea;
        }
        
        .post-title {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #2c3e50;
            line-height: 1.3;
        }
        
        .post-meta {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .author-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            margin-right: 15px;
            border: 2px solid #eaeaea;
        }
        
        .author-info {
            flex: 1;
        }
        
        .author-name {
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 4px;
        }
        
        .post-time {
            color: #7f8c8d;
            font-size: 14px;
        }
        
        .stats {
            display: flex;
            gap: 20px;
        }
        
        .stat-item {
            display: flex;
            align-items: center;
            color: #7f8c8d;
            font-size: 14px;
        }
        
        .stat-item i {
            margin-right: 5px;
            font-size: 16px;
        }
        
        .post-content {
            padding: 30px;
            font-size: 16px;
            line-height: 1.8;
            color: #34495e;
            border-bottom: 1px solid #eee;
        }
        
        .post-content p {
            margin-bottom: 20px;
        }
        
        .post-image-container {
            margin: 30px 0;
            text-align: center;
        }
        
        .post-image-title {
            font-size: 14px;
            color: #7f8c8d;
            margin-bottom: 10px;
            text-align: center;
        }
        
        .post-image {
            max-width: 100%;
            border-radius: 8px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
        }
        
        .actions {
            padding: 20px 30px;
            display: flex;
            justify-content: center;
            gap: 15px;
            background: #f8f9fa;
            border-bottom: 1px solid #eee;
        }
        
        .replies-section {
            padding: 30px;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
            color: #2c3e50;
        }
  
        
        .reply-content {
            flex: 1;
        }

        
        .form-title {
            font-size: 16px;
            margin-bottom: 15px;
            font-weight: 600;
            color: #2c3e50;
        }
        
        .submit-area {
            display: flex;
            justify-content: flex-end;
            margin-top: 15px;
        }
        
        @media (max-width: 768px) {
            .post-header, .post-content, .replies-section {
                padding: 20px;
            }
            
            .post-title {
                font-size: 22px;
            }
            
            .stats {
                flex-wrap: wrap;
                gap: 10px;
            }
        }
        /*================================================*/
          /* 响应式调整 */
        @media (max-width: 768px) {
          .moderator-actions {
            margin-left: 0;
            margin-top: 10px;
            width: 100%;
          }
          
          .moderator-actions .el-dropdown {
            width: 100%;
          }
          
          .moderator-actions .el-button {
            width: 100%;
          }
        }

          /* 新增：版主操作按钮样式 */
        .moderator-actions {
          margin-left: 20px;
        }

  </style>