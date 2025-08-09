<template>
  <div class="create-section-container">
    <h1>创建新板块</h1>
    <el-form
        ref="ruleFormRef"
        :model="section"
        status-icon
        :rules="rules"
        class="enroll-form"
      >       
        <el-form-item label="板块名称" prop="name">
          <el-input 
            v-model="section.name" 
            placeholder="请输入板块名称"
            size="large"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item label="板块描述" prop="description">
          <el-input 
            v-model="section.description" 
            type="textarea" 
            placeholder="请输入板块描述"
            size="large"
            :rows="4"
            prefix-icon="Message"
          />
        </el-form-item>
        
        <div class="avatar-section">
          <div class="avatar-label">板块头像</div>
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :http-request="handleAvatarUpload"  
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="avatarUrl" :src="avatarUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </div>

        <div class="avatar-section">
          <div class="avatar-label">板块背景</div>
          <el-upload
            class="background-uploader"
            action="#"
            :show-file-list="false"
            :http-request="handleBackgroundUpload"  
            :before-upload="beforeBackgroundUpload"
          >
            <img v-if="backgroundUrl" :src="backgroundUrl" class="background" />
            <el-icon v-else class="background-uploader-icon"><Picture /></el-icon>
          </el-upload>
        </div>
        
        <div class="form-actions">
          <el-button type="primary" @click="submitForm" :loading="submitting">创建</el-button>
          <el-button @click="cancel">取消</el-button>
        </div>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { Plus, Picture, User, Message } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { reactive, ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

type Section = {
  name: string,
  description: string,
  image: string,
  backgroundImage: string
}

const section = reactive<Section>({
  name: '',
  description: '',
  image: '',
  backgroundImage: ''
})

// 表单引用
const ruleFormRef = ref<FormInstance>()

// 表单验证规则
const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入板块名称', trigger: 'blur' },
    { min: 2, max: 20, message: '名称长度在2到20个字符之间', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入板块描述', trigger: 'blur' },
    { min: 10, max: 200, message: '描述长度在10到200个字符之间', trigger: 'blur' }
  ]
})

// 头像相关状态
const avatarUrl = ref('')
const avatarFile = ref<File | null>(null) // 存储头像文件
const backgroundUrl = ref('')
const backgroundFile = ref<File | null>(null) // 存储背景文件

// 上传状态
const submitting = ref(false)

// 头像上传前验证
const beforeAvatarUpload = (file: File) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const isImage = allowedTypes.includes(file.type)
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('头像必须是 JPG/PNG/GIF/WEBP 格式!')
    return false
  } else if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}

// 背景图上传前验证
const beforeBackgroundUpload = (file: File) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const isImage = allowedTypes.includes(file.type)
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('背景图必须是 JPG/PNG/GIF/WEBP 格式!')
    return false
  } else if (!isLt5M) {
    ElMessage.error('背景图大小不能超过 5MB!')
    return false
  }
  return true
}

// 自定义头像上传处理
const handleAvatarUpload = (options: any) => {
  avatarFile.value = options.file
  // 预览图片
  avatarUrl.value = URL.createObjectURL(options.file)
}

// 自定义背景上传处理
const handleBackgroundUpload = (options: any) => {
  backgroundFile.value = options.file
  // 预览图片
  backgroundUrl.value = URL.createObjectURL(options.file)
}

// 上传图片到服务器
const uploadImage = async (file: File, type: 'avatar' | 'background') => {
  if (!file) {
    throw new Error(`请上传${type === 'avatar' ? '头像' : '背景图'}`)
  }
  
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const response = await axios.post('http://localhost:8080/user/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        token: localStorage.getItem('token') || ''
      }
    })
    
    if (response.data.code === 1) {
      return response.data.data
    } else {
      throw new Error(response.data.msg || '上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    throw new Error(`上传${type === 'avatar' ? '头像' : '背景图'}失败`)
  }
}

// 提交表单
const submitForm = async () => {
  // 表单验证
  if (!ruleFormRef.value) return
  const valid = await ruleFormRef.value.validate()
  if (!valid) return
  
  // 检查是否已上传图片
  if (!avatarFile.value) {
    ElMessage.error('请上传板块头像')
    return
  }
  
  if (!backgroundFile.value) {
    ElMessage.error('请上传板块背景图')
    return
  }
  
  submitting.value = true
  
  try {
    // 上传头像和背景图
    const [avatarResponse, backgroundResponse] = await Promise.all([
      uploadImage(avatarFile.value, 'avatar'),
      uploadImage(backgroundFile.value, 'background')
    ])
    
    // 设置图片URL
    section.image = avatarResponse
    section.backgroundImage = backgroundResponse
    
    // 提交创建板块请求
    const createResponse = await axios.post('http://localhost:8080/user/sections/createSection', section, {
      headers: {
        token: localStorage.getItem('token') || ''
      }
    })
    
    if (createResponse.data.code === 1) {
      ElMessage.success('板块创建成功')
      // 创建成功后关闭窗口
      setTimeout(() => {
        window.close()
      }, 1500)
    } else {
      ElMessage.error(createResponse.data.msg || '创建板块失败')
    }
  } catch (error: any) {
    console.error('创建板块失败:', error)
    ElMessage.error(error.message || '创建板块失败，请重试')
  } finally {
    submitting.value = false
  }
}

const cancel = () => {
  // 关闭当前标签页
  window.close()
}
</script>

<style scoped>

        
        .create-section-container {
            width: 100%;
            max-width: 100%;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
            overflow: hidden;
            animation: fadeIn 0.6s ease-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .header {
            background: white;
            padding: 30px 40px 20px;
            text-align: center;
            position: relative;
        }
        
        .header h1 {
            font-size: 2rem;
            font-weight: 600;
            margin-bottom: 10px;
            color: #1e293b;
            letter-spacing: 0.5px;
        }
        
        .header p {
            color: #64748b;
            font-size: 1rem;
            max-width: 500px;
            margin: 0 auto;
        }
        
        .form-container {
            padding: 0 40px 40px;
        }
        
        .form-row {
            margin-bottom: 25px;
        }
        
        .el-form-item {
            margin-bottom: 28px;
        }
        
        .el-form-item__label {
            font-weight: 500;
            color: #334155;
            margin-bottom: 8px;
            display: block;
            font-size: 0.95rem;
        }
        
        .el-input, .el-textarea {
            border-radius: 10px;
            --el-input-border-color: #e2e8f0;
            transition: all 0.3s ease;
        }
        
        .el-input:hover, .el-textarea:hover {
            --el-input-border-color: #cbd5e1;
        }
        
        .el-input__inner, .el-textarea__inner {
            padding: 12px 16px;
            font-size: 1rem;
        }
        
        .upload-section {
            margin-bottom: 25px;
        }
        
        .upload-title {
            font-size: 1rem;
            font-weight: 500;
            color: #334155;
            margin-bottom: 16px;
        }
        
        .upload-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 20px;
        }
        
        .upload-card {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s;
        }
        
        .upload-label {
            font-size: 0.95rem;
            font-weight: 500;
            color: #475569;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .avatar-uploader, .background-uploader {
            width: 100%;
            height: 160px;
            border: 2px dashed #cbd5e1;
            border-radius: 10px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            overflow: hidden;
            transition: all 0.3s;
            background: #f8fafc;
        }
        
        .avatar-uploader:hover, .background-uploader:hover {
            border-color: #94a3b8;
            background: #f1f5f9;
        }
        
        .avatar-uploader-icon, .background-uploader-icon {
            font-size: 1.8rem;
            color: #94a3b8;
        }
        
        .avatar, .background {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .upload-hint {
            font-size: 0.85rem;
            color: #94a3b8;
            margin-top: 12px;
            text-align: center;
        }
        
        .form-actions {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 30px;
        }
        
        .el-button {
            padding: 12px 32px;
            font-size: 1rem;
            font-weight: 500;
            border-radius: 10px;
            transition: all 0.3s;
            min-width: 140px;
        }
        
        .submit-btn {
            background: #1e293b;
            border: none;
            color: white;
        }
        
        .submit-btn:hover {
            background: #334155;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(30, 41, 59, 0.15);
        }
        
        .cancel-btn {
            background: #f1f5f9;
            color: #475569;
            border: 1px solid #e2e8f0;
        }
        
        .cancel-btn:hover {
            background: #e2e8f0;
            border-color: #cbd5e1;
        }
        
        .footer-note {
            text-align: center;
            margin-top: 30px;
            font-size: 0.9rem;
            color: #94a3b8;
            line-height: 1.6;
        }
        
        @media (max-width: 768px) {
            .form-container {
                padding: 0 20px 30px;
            }
            
            .header {
                padding: 25px 20px 15px;
            }
            
            .upload-grid {
                grid-template-columns: 1fr;
            }
        }
</style>
