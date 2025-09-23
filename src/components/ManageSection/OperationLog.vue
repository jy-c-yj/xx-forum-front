<template>
  <div class="operation-log-container">
    <h2>操作日志 - 板块ID: {{ sectionId.sectionId }}</h2>
    
    <el-table :data="logList" style="width: 100%" v-loading="loading">
      <el-table-column label="操作时间" width="180">
        <template #default="scope">
          {{ formatTime(scope.row.createdAt) }}
        </template>
      </el-table-column>

      <el-table-column label="目标类型" prop="targetType" width="100">
      </el-table-column>

      <el-table-column label="操作类型" prop="operationType" width="100">
      </el-table-column>   

      <el-table-column label="所属板块" prop="sectionName">
      </el-table-column> 

      <el-table-column label="操作目标" prop="operationTarget">
      </el-table-column>  

      <el-table-column label="操作原因" prop="reason">
        <template #default="scope">
          <el-tooltip 
            v-if="scope.row.reason && scope.row.reason.length > 20" 
            :content="scope.row.reason" 
            placement="top"
          >
            <span>{{ scope.row.reason.substring(0, 20) }}...</span>
          </el-tooltip>
          <span v-else>{{ scope.row.reason || '无' }}</span>
        </template>
      </el-table-column>  
    </el-table>
    
    <div class="pagination-container" v-if="logList && logList.length > 0">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>
    
    <div class="empty-state" v-if="!loading && (!logList || logList.length === 0)">
      <el-empty description="暂无操作日志数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { ref, reactive, onMounted } from 'vue';
import { defineProps } from 'vue';
import format from '@/hooks/format';
import { ElMessage } from 'element-plus';
import axios from 'axios';

const { formatTime } = format()
const sectionId = defineProps(['sectionId'])

interface OperationLog {
  id: number
  operationType: string // 操作类型
  targetType: string // 目标类型
  operationTarget: string // 操作目标
  sectionName: string // 所属板块
  reason: string // 操作原因
  createdAt: string // 操作时间
}

const logList = ref<OperationLog[]>([])
const loading = ref(false)
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

// 获取操作日志
const getLogData = async () => {
  loading.value = true
  try {
    const response = await axios.get('http://localhost:8080/user/myInformation/manageSections/OperationLog', {
      params: { 
        sectionId: sectionId.sectionId,
        page: currentPage.value,
        pageSize: pageSize.value
      },
      headers: { token: localStorage.getItem('token') || '' }
    })
    
    if (response.data.code === 1) {
      logList.value = response.data.data.list || response.data.data
      total.value = response.data.data.total || response.data.data.length
      console.log('操作日志数据:', response.data.data)
    } else {
      ElMessage.error('出现错误：' + response.data.msg)
    }
  } catch (error) {
    console.error('获取操作日志失败:', error)
    ElMessage.error('获取操作日志失败')
  } finally {
    loading.value = false
  }
}

// 处理分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  getLogData()
}

onMounted(() => {
  getLogData()
})

console.log('板块ID:', sectionId.sectionId)
</script>

<style scoped>
.operation-log-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.operation-log-container h2 {
  margin-bottom: 20px;
  color: #303133;
  font-weight: 500;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
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