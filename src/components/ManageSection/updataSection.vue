<template>
    <div id="app">
        <h1 style="text-align: center; margin-bottom: 30px;">修改板块信息</h1>
        
        <!-- 板块信息展示 -->
        <div class="section-info">
            <div class="info-item">
                <span class="info-label">板块ID：</span>
                <span class="info-value">{{ section.id }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">板块名称：</span>
                <span class="info-value">{{ section.name }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">关注数：</span>
                <span class="info-value">{{ section.followersCount }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">帖子数：</span>
                <span class="info-value">{{ section.postCount }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">创建时间：</span>
                <span class="info-value">{{ section.createdTime }}</span>
            </div>
        </div>
        
        <el-form
            ref="ruleFormRef"
            :model="section"
            status-icon
            :rules="rules"
            class="enroll-form"
        >       
            <el-form-item label="板块描述" prop="description">
                <el-input 
                    v-model="section.description" 
                    type="textarea" 
                    placeholder="请输入板块描述"
                    size="large"
                    :rows="4"
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
                <div style="font-size: 12px; color: #909399; margin-top: 8px;">
                    支持 JPG/PNG/GIF/WEBP 格式，大小不超过2MB
                </div>
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
                <div style="font-size: 12px; color: #909399; margin-top: 8px;">
                    支持 JPG/PNG/GIF/WEBP 格式，大小不超过5MB
                </div>
            </div>
            
            <div class="form-actions">
                <el-button type="primary" @click="submitForm" :loading="submitting">确认修改</el-button>
                <el-button @click="cancel">取消</el-button>
            </div>
        </el-form>
    </div>
</template>

<script setup lang="ts">
import { useRoute,useRouter } from 'vue-router';
import { ref,reactive, onMounted } from 'vue';
import { defineProps } from 'vue';
import { Plus, Picture } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules ,ElMessageBox} from 'element-plus'
import axios from 'axios';



const sectionId = defineProps(['sectionId'])

interface Section{
  id:number
  name:string
  description:string
  backgroundImage:string  //板块背景
  followersCount:number
  createdTime:string
  postCount:number
  image:string //板块头像
}
console.log(sectionId)

const section = reactive<Section>({
  id:-1,  
  name: '',
  description: '',
  image: '',
  backgroundImage: '',
  followersCount:-1,
  createdTime:' ',
  postCount:-1
})

// 表单引用
const ruleFormRef = ref<FormInstance>()

// 表单验证规则
const rules = reactive<FormRules>({
  description: [
    { required: true, message: '请输入板块描述', trigger: 'blur' },
    { min: 10, max: 200, message: '描述长度在10到200个字符之间', trigger: 'blur' }
  ]
})

onMounted( () => {
  if(!localStorage.getItem('token')){
    ElMessage.error('还未登陆')
    return
  }

    refashFormDate(sectionId.sectionId)
})

const refashFormDate = async (sectionId:number)=>{

    try{
        const response = await axios.get('http://localhost:8080/user/myInformation/manage/getSection',{
            params : {
                sectionId : sectionId
            },
            headers : {
                token : localStorage.getItem('token')
            }
        })

        if(response.data.code === 1){
            section.backgroundImage = response.data.data.backgroundImage
            section.createdTime = response.data.data.createdTime
            section.description = response.data.data.description
            section.followersCount = response.data.data.followersCount
            section.id = response.data.data.id
            section.image = response.data.data.image
            section.name = response.data.data.name
            section.postCount = response.data.data.postCount
            avatarUrl.value = section.image
            backgroundUrl.value = section.backgroundImage
            console.log(">>>>>>>>>>>",section)

        }else{
            ElMessage.error("response.data.msg")
        }

    }catch{
        ElMessage.error('初始化表格失败')
    }

}


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
        
      return response.data.data as string
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
  


  submitting.value = true
  
  try {
    let newAvatarUrl = section.image; // 默认使用原来的头像
    let newBackgroundUrl = section.backgroundImage; // 默认使用原来的背景
    
    // 如果有新头像文件，则上传
    if (avatarFile.value) {
      newAvatarUrl = await uploadImage(avatarFile.value, 'avatar');
    }

    // 如果有新背景文件，则上传
    if (backgroundFile.value) {
      newBackgroundUrl = await uploadImage(backgroundFile.value, 'background');
    }

    
    // 设置图片URL
    section.image = newAvatarUrl;
    section.backgroundImage = newBackgroundUrl;

    interface UpdataSectionDTO{
        id:number
        description:string
        backgroundImage:string  //板块背景
        image:string //板块头像
    }    

    const updataSectionDTO = {
        id:sectionId.sectionId,
        description:section.description,
        backgroundImage:section.backgroundImage,
        image:section.image
    }
    // 提交修改板块请求
    const createResponse = await axios.post('http://localhost:8080/user/sections/UpdataSection', updataSectionDTO, {
      headers: {
        token: localStorage.getItem('token') || ''
      }
    })
    
    if (createResponse.data.code === 1) {
      ElMessage.success('板块修改成功')

    } else {
      ElMessage.error(createResponse.data.msg || '修改板块失败')
    }
  } catch (error: any) {
    console.error('修改板块失败:', error)
    ElMessage.error(error.message || '修改板块失败，请重试')
  } finally {
    submitting.value = false
  }
}
 const cancel = () => {
    ElMessageBox.confirm('确定要取消修改吗？所有未保存的更改将会丢失。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
        }).then(() => {
            ElMessage.info('已取消修改');
          // 这里可以添加返回上一页的逻辑
        }).catch(() => {
            window// 用户点击了取消
        });
    };



</script>

<style scoped>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f5f7fa;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        
        #app {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
            padding: 30px;
        }
        
        h1 {
            color: #303133;
            margin-bottom: 30px;
            font-weight: 600;
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #ebeef5;
        }
        
        .section-info {
            margin-bottom: 30px;
            padding: 20px;
            background-color: #f9fafc;
            border-radius: 8px;
            border-left: 4px solid #409EFF;
        }
        
        .info-item {
            margin-bottom: 12px;
            display: flex;
            align-items: center;
        }
        
        .info-label {
            font-weight: 600;
            width: 90px;
            color: #606266;
        }
        
        .info-value {
            flex: 1;
            color: #303133;
        }
        
        .enroll-form {
            padding: 0 20px;
        }
        
        .avatar-section {
            margin-bottom: 28px;
            padding: 20px;
            background-color: #f9fafc;
            border-radius: 8px;
        }
        
        .avatar-label {
            margin-bottom: 12px;
            font-weight: 600;
            color: #606266;
            font-size: 15px;
        }
        
        .avatar-uploader, .background-uploader {
            border: 1px dashed #d9d9d9;
            border-radius: 8px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: all 0.3s;
            background-color: #fbfdff;
        }
        
        .avatar-uploader {
            width: 140px;
            height: 140px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .background-uploader {
            width: 100%;
            height: 220px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .avatar-uploader:hover, .background-uploader:hover {
            border-color: #409EFF;
            box-shadow: 0 2px 12px rgba(32, 160, 255, 0.15);
        }
        
        .avatar {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 6px;
        }
        
        .background {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 6px;
        }
        
        .avatar-uploader-icon, .background-uploader-icon {
            font-size: 32px;
            color: #8c939d;
        }
        
        .upload-tip {
            font-size: 13px;
            color: #909399;
            margin-top: 10px;
            line-height: 1.5;
        }
        
        .form-actions {
            text-align: center;
            margin-top: 40px;
            padding-top: 25px;
            border-top: 1px solid #ebeef5;
        }
        
        .el-button {
            padding: 10px 24px;
            border-radius: 6px;
            font-weight: 500;
            transition: all 0.3s;
        }
        
        .el-button--primary {
            background: linear-gradient(45deg, #409EFF, #64b5ff);
            border: none;
        }
        
        .el-button--primary:hover {
            background: linear-gradient(45deg, #64b5ff, #409EFF);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(32, 160, 255, 0.3);
        }
        
        .el-form-item__label {
            font-weight: 600;
            color: #606266;
        }
        
        .el-textarea__inner {
            border-radius: 6px;
            padding: 12px 15px;
            font-size: 14px;
            transition: all 0.3s;
        }
        
        .el-textarea__inner:focus {
            border-color: #409EFF;
            box-shadow: 0 0 0 2px rgba(32, 160, 255, 0.2);
        }
        
        .status-message {
            padding: 10px;
            margin: 15px 0;
            border-radius: 4px;
            text-align: center;
        }
        
        .status-success {
            background-color: #f0f9eb;
            color: #67c23a;
            border: 1px solid #e1f3d8;
        }
        
        .status-error {
            background-color: #fef0f0;
            color: #f56c6c;
            border: 1px solid #fde2e2;
        }
        
        @media (max-width: 768px) {
            #app {
                padding: 15px;
                margin: 10px;
            }
            
            .enroll-form {
                padding: 0 10px;
            }
            
            .avatar-uploader {
                width: 120px;
                height: 120px;
            }
            
            .background-uploader {
                height: 180px;
            }
        }
</style>