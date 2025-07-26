<template>
  <div id="app">
    <div class="post-detail-container" v-if="postdata">
      <!-- 帖子头部 -->
      <div class="post-header">
        <h1 class="post-title">{{ postdata.title }}</h1>
        
        <div class="post-meta">
          <img :src="postdata.image || 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg'" 
               class="author-avatar"
               alt="作者头像">
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
      </div>
      
      <!-- 帖子内容 -->
      <div class="post-content" v-html="postdata.content"></div>
      
      <!-- 操作按钮 -->
      <div class="actions">
        <el-button 
        type="primary" 
        plain 
        @click="like"
        :class="{ 'liked': postdata?.liked }"
      >
        <i class="el-icon-thumb"></i> 
        {{ postdata?.liked ? '已点赞' : '点赞' }} 
        ({{ postdata?.likeCount }})
      </el-button>
        <el-button type="success" plain>
          <i class="el-icon-star-off"></i> 收藏{{ postdata.collectCount }}
        </el-button>
        <el-button type="info" plain>
          <i class="el-icon-share"></i> 分享
        </el-button>
      </div>
      
      <!-- 回复区域 -->
      <div class="replies-section">
        <!-- <h2 class="reply-count">共 {{ replyCount }} 条回复</h2> -->
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
import { useRoute } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import Reply from '@/components/reply.vue'

// 定义帖子详情数据类型
interface PostDetail {
  id: number;
  title: string;
  content: string;
  username: string;
  userId: number;
  image: string;
  viewCount: number;
  replyCount: number;
  collectCount: number;
  likeCount : number,
  createdTime: string;
  lastReplyTime: string | null;
  liked : boolean //记录点赞状态
}

const route = useRoute()
const postdata = ref<PostDetail | null>(null)
const postId = ref<number>(0)
const replyCount = ref<number>(0)

 //从路由参数获取帖子ID和回复数量
postId.value = parseInt(route.params.id as string)
// viewCount.value = parseInt(route.params.replyCount as string) || 0

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
     console.log(postdata)
    console.log()
    // 如果详情中包含回复数，更新replyCount
    if (postdata.value?.replyCount) {
      replyCount.value = postdata.value.replyCount;
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

//帖子点赞功能
const likingStates = ref<{[key: number]: boolean}>({});
const like = async  () => {


  const token = localStorage.getItem('token');
  if (!token) {
    ElMessage.warning('请先登录后再点赞');
    return;
  }

  // 确保帖子数据存在
  if (!postdata.value) {
    ElMessage.warning('帖子数据未加载完成');
    return;
  }
    if (likingStates.value[postdata.value.id]) return;
  likingStates.value[postdata.value.id] = true;

  try{
      const response = await axios.post(
        'http://localhost:8080/user/likePost', 
      {
        postId :postdata.value.id,
        username :postdata.value.username,
        likeCount :postdata.value.likeCount,
        liked :postdata.value.liked
      },{
      headers: {
        token: localStorage.getItem('token') || ''
        }
      }
    )
      console.log("response===>",response.data)

    if(response.data.code === 1){
      console.log(response.data)
      postdata.value.liked = response.data.data.liked
      postdata.value.likeCount = response.data.data.likeCount
      console.log("执行点赞操作后",postdata)
      ElMessage.success(response.data.data.liked ? '点赞成功' : '已取消点赞');
    }else{
      ElMessage.error(response.data.msg || '操作失败');
    }
    
  }catch(error){
          console.error('点赞操作失败:',error );
          ElMessage.error('操作失败，请重试');
  }finally {
    likingStates.value[postdata.value.id] = false;
  }

}



// 组件挂载时获取数据
onMounted(() => {
  if (postId.value) {
    fetchPostDetail(postId.value)
  }
});
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

  </style>