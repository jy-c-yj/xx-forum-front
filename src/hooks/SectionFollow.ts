import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
export default function(){

const isFollowed = ref<boolean | null>(null) // 关注状态：true=已关注, false=未关注, null=未知


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
    } else {
      ElMessage.error(response.data.msg || '取消关注失败')
    }
  } catch  {
      ElMessage.error('出现未知错误')
  }
}
return {checkFollowStatus,unfollowSec,followSec,isFollowed}
}