<template>
  <el-form :model="form" label-width="auto" ref="ruleFormRef" style="max-width: 600px">
    <el-form-item label="user name">
      <el-input v-model="form.username" />
    </el-form-item>

    <el-form-item label="email">
      <el-input v-model="form.email" />
    </el-form-item>

      <el-form-item label="phone">
      <el-input v-model="form.phone" />
    </el-form-item>

  
    <el-form-item label="gender">
      <el-radio-group v-model="form.gender">
        <el-radio value="1">男</el-radio>
        <el-radio value="2">女</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="个人简介">
      <el-input v-model="form.desc" type="textarea" />
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
            修改信息
          </el-button>
          <el-button 
            @click="resetForm()"
            size="large"
            class="reset-btn"
          >
            重置信息
          </el-button>
        </el-form-item>

  </el-form>


</template>

<script lang="ts" setup>
import { reactive, ref,toRef,toRefs } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage,ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import axios, { type AxiosResponse } from 'axios'
import type { UploadProps } from 'element-plus'
import { el } from 'element-plus/es/locales.mjs'
import { useRouter } from 'vue-router'
import { userStore } from '@/stores/user'
import { onMounted } from 'vue'



const u = JSON.parse(localStorage.getItem('user') as string)
const router = useRouter();
const userstore = userStore()
const ruleFormRef = ref<FormInstance>()

// 响应式头像URL
const imageUrl = ref('')

const avatarFile = ref<File | null>(null)

// 创建空表单结构
const form = reactive({
  username: '',
  email: '',
  phone: '',
  gender: '0', // 默认设为0（未知）
  desc: ''
})

// 保存初始值（用于重置）
const initialFormData = ref({...form})

// 在组件挂载时加载数据
onMounted(async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/home')
      ElMessage.error('请先登陆')
      return
    }

const response = await axios.get('http://localhost:8080/user/personal', {
  params: {  // 使用params选项传递查询参数
    username: u.username
  },
  headers: { 
    token: localStorage.getItem('token')
  }
})

    if (response.data.code === 1) {
      const userData = response.data.data
      
      // 更新表单数据
      Object.assign(form, {
        username: userData.username,
        email: userData.email,
        phone: userData.phone || '',
        gender: userData.gender?.toString() || '0',
        desc: userData.desc || ''
      })
      
      // 更新初始数据（用于重置）
      Object.assign(initialFormData.value, form)
      
      // 设置头像
      imageUrl.value = userData.image || 'default_avatar.png'
    
      // 存储到store
      userstore.setuser(userData)
      userstore.user.image = userData.image
      console.log(userData)
    } if(response.data.code === 0) {
       router.push('/home')
      ElMessage.error(response.data.msg)
    }
  } catch (error) {
    console.error('加载用户数据失败:', error)
    ElMessage.error('加载用户数据失败，确认登录信息')
  }
})

// 头像上传处理
const handleAvatarUpload = async (options: any) => {
  avatarFile.value = options.file
  imageUrl.value = URL.createObjectURL(options.file) // 更新响应式变量
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
 
       const formData = new FormData()
  
      if (avatarFile.value) {
        try{
           const uploadimage = await axios.post('http://localhost:8080/user/upload' ,avatarFile.value
        ,{
          headers : {
            token: localStorage.getItem('token')       
          }
        })
        formData.append('image', uploadimage.data.data)
        }catch{
          ElMessage.error('图片上传有误');
        formData.append('image', imageUrl.value)
        }
      
      }



      // 发送POST请求
        const requestData = {
        username: form.username,
        email: form.email,
        phone: form.phone,
        gender: form.gender,
        desc: form.desc,
        image: imageUrl.value // 直接使用头像 URL
      }
      const response = await axios.post('http://localhost:8080/user/update' ,requestData
        ,{
          headers : {
            token : localStorage.getItem('token')       
          }
        }
      )

      console.log(response.data)
      
      // 处理响应

      const result = response.data;
      if (result.code===1) {
        ElMessage.success('修改成功!')
        // 可以在这里进行页面跳转等操作
        const updatedUser = {...userstore.getuser(), ...form}
        userstore.setuser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
      } else {
        ElMessage.error(`${result.msg}`)
      }
    } catch (error) {
      console.error('请求出错:', error)
      ElMessage.error('网络请求错误，请稍后重试')
    }
  })
}
avatarFile.value = null
// }
const resetForm = () => {
  // 1. 重置表单数据到初始状态
  Object.assign(form, initialFormData.value)
  
  // 2. 重置头像
  const userData = userstore.getuser() || JSON.parse(localStorage.getItem('user') || '{}')
  
  imageUrl.value = userData.image || 'default_avatar.png'
  console.log(userData)
  avatarFile.value = null
  
  // 3. 重置表单验证状态
  if (ruleFormRef.value) {
    ruleFormRef.value.resetFields()
  }
  
  ElMessage.success('表单已重置')


}


</script>
<style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Helvetica Neue', Arial, sans-serif;
        }
        
        body {
            background-color: #f5f7fa;
            color: #333;
          
            min-height: 100vh;
            justify-content: center;
            align-items: center;
        }
        
        .user-profile-container {
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
            max-width: 800px;
            width: 100%;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        
        .profile-header {
            background: linear-gradient(120deg, #f0f4f8, #e6ebf0);
            padding: 25px 30px;
            border-bottom: 1px solid #eaeef5;
        }
        
        .profile-header h1 {
            font-size: 1.8rem;
            color: #2c3e50;
            font-weight: 600;
            display: flex;
            align-items: center;
        }
        
        .profile-header h1 i {
            margin-right: 12px;
            font-size: 1.5rem;
            color: #3498db;
        }
        
        .profile-header p {
            color: #7f8c8d;
            margin-top: 8px;
            font-size: 0.95rem;
        }
        
        .profile-content {
            display: flex;
            padding: 25px 30px;
        }
        
        .avatar-section {
            width: 35%;
            padding-right: 30px;
            border-right: 1px solid #f0f2f5;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .avatar-label {
            font-weight: 500;
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 1.1rem;
            align-self: flex-start;
        }
        
        .avatar-uploader {
            width: 180px;
            height: 180px;
            border-radius: 50%;
            background-color: #f8fafc;
            border: 1px dashed #d1d9e6;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
        }
        
        .avatar-uploader:hover {
            border-color: #3498db;
            background-color: #f0f8ff;
        }
        
        .avatar-uploader .avatar {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .avatar-uploader-icon {
            font-size: 3rem;
            color: #c0c4cc;
        }
        
        .avatar-hint {
            margin-top: 15px;
            color: #95a5a6;
            font-size: 0.9rem;
            text-align: center;
            max-width: 220px;
            line-height: 1.5;
        }
        
        .form-section {
            width: 65%;
            padding-left: 30px;
        }
        
        .form-row {
            display: flex;
            margin-bottom: 22px;
            gap: 20px;
        }
        
        .form-item {
            flex: 1;
        }
        
        .form-item label {
            display: block;
            margin-bottom: 8px;
            color: #34495e;
            font-weight: 500;
            font-size: 0.95rem;
        }
        
        .form-input {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid #e1e5eb;
            border-radius: 8px;
            background-color: #fafbfc;
            transition: all 0.3s;
            font-size: 0.95rem;
        }
        
        .form-input:focus {
            outline: none;
            border-color: #3498db;
            box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
            background-color: white;
        }
        
        .el-radio-group {
            display: flex;
            gap: 20px;
            margin-top: 5px;
        }
        
        .el-radio {
            display: flex;
            align-items: center;
        }
        
        .el-textarea {
            min-height: 100px;
            resize: vertical;
        }
        
        .action-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 15px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #f0f2f5;
        }
        
        .submit-btn, .reset-btn {
            padding: 12px 28px;
            border-radius: 8px;
            font-weight: 500;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s;
            border: none;
        }
        
        .submit-btn {
            background: linear-gradient(120deg, #3498db, #2980b9);
            color: white;
            box-shadow: 0 4px 12px rgba(52, 152, 219, 0.25);
        }
        
        .submit-btn:hover {
            background: linear-gradient(120deg, #2980b9, #2573a7);
            box-shadow: 0 6px 15px rgba(52, 152, 219, 0.35);
            transform: translateY(-2px);
        }
        
        .reset-btn {
            background-color: #f8f9fa;
            color: #7f8c8d;
            border: 1px solid #e1e5eb;
        }
        
        .reset-btn:hover {
            background-color: #f1f3f5;
            color: #3498db;
            border-color: #d1d9e6;
        }
        
        @media (max-width: 768px) {
            .profile-content {
                flex-direction: column;
            }
            
            .avatar-section, .form-section {
                width: 100%;
                padding: 0;
                border: none;
            }
            
            .avatar-section {
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid #f0f2f5;
                align-items: center;
            }
            
            .avatar-label {
                align-self: center;
            }
            
            .form-row {
                flex-direction: column;
                gap: 15px;
            }
        }
</style>