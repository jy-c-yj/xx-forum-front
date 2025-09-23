<template>
  <div class="ban-post-container">
    <h2>封禁帖子管理 - 板块ID: {{ sectionId.sectionId }}</h2>
    
    <el-table :data="banPost" style="width: 100%" v-loading="loading">
      <el-table-column label="帖子标题" prop="title">
        <template #default="scope">
          <el-tooltip 
            v-if="scope.row.title && scope.row.title.length > 20" 
            :content="scope.row.title" 
            placement="top"
          >
            <span>{{ scope.row.title.substring(0, 20) }}...</span>
          </el-tooltip>
          <span v-else>{{ scope.row.title || '无标题' }}</span>
        </template>
      </el-table-column>

      <el-table-column label="所属板块" prop="sectionName" width="150">
      </el-table-column>

      <el-table-column label="封禁原因" prop="banReason">
        <template #default="scope">
          <el-tooltip 
            v-if="scope.row.banReason && scope.row.banReason.length > 20" 
            :content="scope.row.banReason" 
            placement="top"
          >
            <span>{{ scope.row.banReason.substring(0, 20) }}...</span>
          </el-tooltip>
          <span v-else>{{ scope.row.banReason || '无' }}</span>
        </template>
      </el-table-column>

      <el-table-column label="封禁时间" width="180">
        <template #default="scope">
          {{ formatTime(scope.row.createdAt) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="100" fixed="right">
        <template #default="scope">
          <el-button 
            type="danger" 
            size="small" 
            @click="handleUnbanPost(scope.row)"
            :loading="unbanLoading[scope.row.id]"
          >
            解封
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="empty-state" v-if="!loading && (!banPost || banPost.length === 0)">
      <el-empty description="暂无封禁帖子数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { defineProps } from 'vue';
import format from '@/hooks/format';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';
import ModeratorCommand from '@/hooks/ModeratorCommand';

const { formatTime } = format()
const sectionId = defineProps(['sectionId'])
const { unBanPost } = ModeratorCommand()

type BanPost = {
  id: number
  postId: number
  title: string // 帖子标题
  sectionName: string // 所属板块
  banReason: string
  createdAt: string
}

console.log(sectionId)

const banPost = ref<BanPost[]>([])
const loading = ref(false)
const unbanLoading = reactive<Record<number, boolean>>({}) // 用于跟踪每个解封按钮的加载状态

// 获取封禁帖子信息
const getBanlog = async () => {
  loading.value = true
  try {
    // 注意：URL中有一个多余的斜杠，应该是 '/user/post/banPostLog'
    const response = await axios.get('http://localhost:8080/user/post/banPostLog', {
      params: { sectionId: sectionId.sectionId },
      headers: { token: localStorage.getItem('token') || '' }
    })

    if (response.data.code === 1) {
      banPost.value = response.data.data
      console.log('封禁帖子数据:', response.data.data)
    } else {
      ElMessage.error('出现错误：' + response.data.msg)
    }
  } catch (error) {
    console.error('获取封禁帖子信息失败:', error)
    ElMessage.error('获取封禁帖子信息出错')
  } finally {
    loading.value = false
  }
}

// 处理解封操作
const handleUnbanPost = async (post: BanPost) => {
  try {
    // 确认解封操作
    await ElMessageBox.confirm(
      `确定要解封帖子 "${post.title}" 吗？`,
      '确认解封',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 设置当前行的加载状态
    unbanLoading[post.id] = true
    
    // 调用解封函数
    unBanPost(post.id)
    

  } finally {
    // 清除加载状态
    unbanLoading[post.id] = false
  }
}

onMounted(() => {
  getBanlog()
})
</script>

<style scoped>
.ban-post-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.ban-post-container h2 {
  margin-bottom: 20px;
  color: #303133;
  font-weight: 500;
}

.empty-state {
  margin-top: 50px;
}

:deep(.el-table .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>