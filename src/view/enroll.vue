<template>
  <div class="enroll-container">
    
    <div class="enroll-card">
      <div class="enroll-header">
        <h1>创建账户</h1>
        <p>请填写您的注册信息</p>
      </div>
      
      <el-form
        ref="ruleFormRef"
        :model="user"
        status-icon
        class="enroll-form"
      >
       <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="user.username" 
            type="text" 
            autocomplete="off"
            size="large"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item label="密__码 " prop="password">
          <el-input 
            v-model="user.password" 
            type="password" 
            autocomplete="off"
            size="large"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input 
            v-model="user.email" 
            type="email" 
            autocomplete="off"
            size="large"
            prefix-icon="Message"
          />
        </el-form-item>
        
        <div class="avatar-section">
          <div class="avatar-label">头像</div>
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :http-request="handleAvatarUpload"  
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="imageUrl" :src="imageUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </div>
        
        <el-form-item class="action-buttons">
          <el-button 
            type="primary" 
            @click="submitForm(ruleFormRef)"
            size="large"
            class="submit-btn"
          >
            注册
          </el-button>
          <el-button 
            @click="resetForm(ruleFormRef)"
            size="large"
            class="reset-btn"
          >
            重置
          </el-button>
        </el-form-item>
        
        <div class="login-link">
          已有账户? <RouterLink to="/login">立即登录</RouterLink>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup name="enroll">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import axios from 'axios' // 引入axios
import type { UploadProps } from 'element-plus'
import { el } from 'element-plus/es/locales.mjs'
import { useRouter } from 'vue-router'


const router = useRouter();



// 创建表单引用
const ruleFormRef = ref<FormInstance>()

// 用户数据
const user = reactive({
  username: "admin",
  password: "123456",
  email: "123@qq.com"
})

// 头像相关状态
const imageUrl = ref('')
const avatarFile = ref<File | null>(null) // 存储头像文件

// 自定义头像上传处理
const handleAvatarUpload = async (options: any) => {
  avatarFile.value = options.file
  // 预览图片
  imageUrl.value = URL.createObjectURL(options.file)
}

// 头像上传前验证
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile: any) => {
  // 修正：允许常见的图片类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const isImage = allowedTypes.includes(rawFile.type)
  const isLt2M = rawFile.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('头像必须是 JPG/PNG/GIF/WEBP 格式!')
    return false
  } else if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  
  // 表单验证
  formEl.validate(async (valid) => {
    if (!valid) {
      console.log('表单验证失败')
      return
    }
    
    try {
      // 创建FormData对象
      const formData = new FormData()
      formData.append('username', user.username)
      formData.append('password', user.password)
      formData.append('email', user.email)
      
      // 如果有头像文件，添加进去
      if (avatarFile.value) {
        formData.append('image', avatarFile.value)
      }

      // 发送POST请求
      const response = await axios.post('http://localhost:8080/user/enroll', formData)

      // 处理响应

      const result = response.data;
      if (result.code===1) {
        ElMessage.success('注册成功!')
        // 可以在这里进行页面跳转等操作
        router.push("/login")
      } else {
        ElMessage.error(`注册失败: ${result.msg}`)
      }
    } catch (error) {
      console.error('请求出错:', error)
      ElMessage.error('网络请求错误，请稍后重试')
    }
  })
}

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
  imageUrl.value = ''
  avatarFile.value = null
}
</script>

<style scoped>
.enroll-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.enroll-card {
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
}

.enroll-card:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.enroll-header {
  text-align: center;
  padding: 40px 30px 20px;
  border-bottom: 1px solid #f0f2f5;
}

.enroll-header h1 {
  margin: 0;
  font-size: 26px;
  color: #2c3e50;
  font-weight: 600;
}

.enroll-header p {
  margin: 12px 0 0;
  font-size: 15px;
  color: #7f8c8d;
  font-weight: 400;
}

.enroll-form {
  padding: 30px 30px 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 8px;
  display: block;
}

:deep(.el-input) {
  --el-input-height: 50px;
  --el-input-border-radius: 8px;
}

:deep(.el-input__wrapper) {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  box-shadow: none;
  padding: 0 15px;
  transition: all 0.2s ease;
}

:deep(.el-input__wrapper:hover),
:deep(.el-input__wrapper:focus) {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

:deep(.el-input__inner) {
  font-size: 15px;
  color: #2d3748;
}

:deep(.el-input__prefix) {
  color: #a0aec0;
}

.avatar-section {
  margin: 25px 0;
}

.avatar-label {
  margin-bottom: 10px;
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
}

.avatar-uploader {
  --el-border-color: #e2e8f0;
  width: 150px;
  height: 150px;
  border: 2px dashed var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  background-color: #f8fafc;
}

.avatar-uploader:hover {
  border-color: #3498db;
  background-color: #f0f7ff;
}

.avatar-uploader-icon {
  font-size: 36px;
  color: #cbd5e0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.action-buttons {
  margin-top: 20px;
}

.submit-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
  font-weight: 500;
  background-color: #3498db;
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.reset-btn {
  width: 100%;
  height: 50px;
  margin-top: 15px !important;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #4a5568;
  transition: all 0.2s;
}

.reset-btn:hover {
  border-color: #3498db;
  color: #3498db;
  background-color: #f8fafc;
}

.login-link {
  text-align: center;
  margin-top: 25px;
  font-size: 14px;
  color: #718096;
}

.login-link a {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.login-link a:hover {
  color: #2980b9;
  text-decoration: underline;
}
</style>