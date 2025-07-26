<template>
    <div class="user-card-container">
        <el-card class="user-card">
            <template #header>
                <div class="card-header">
                    <div class="user-profile">
                        <el-avatar 
                            shape="square" 
                            :size="120" 
                            fit="cover" 
                            :src="url" 
                            class="user-avatar"
                        />
                        <div class="user-info">
                            <h3 class="username">{{ fits[0] }}</h3>
                            <p class="user-status">在线 · 活跃用户</p>
                        </div>
                    </div>
                </div>
            </template>
            
            <div class="user-details">
                <div class="detail-item">
                    <span class="detail-label">邮箱:</span>
                    <span class="detail-value">{{ fits[1] }}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">加入时间:</span>
                    <span class="detail-value">{{ formatTime(fits[2]) }}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">帖子数:</span>
                    <span class="detail-value">{{ fits[3] }}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">获赞数:</span>
                    <span class="detail-value">{{ fits[4] }}</span>
                </div>
            </div>
            
            <template #footer>
              <el-dropdown @command="handleCommand">
                  <span class="el-dropdown-link">
                    Dropdown List<el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="a">登陆</el-dropdown-item>
                      <el-dropdown-item command="b">个人信息</el-dropdown-item>
                      <el-dropdown-item command="changePassword">修改密码</el-dropdown-item>
                      <el-dropdown-item command="d">退出登陆</el-dropdown-item>

                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
            </template>
        </el-card>

         <!-- 修改密码对话框 -->
        <el-dialog 
            v-model="dialogVisible" 
            title="修改密码" 
            width="500px"
            :close-on-click-modal="false"
        >
            <el-form 
                ref="passwordFormRef" 
                :model="passwordForm" 
                :rules="passwordRules" 
                label-width="100px"
                status-icon
            >
                <el-form-item label="原密码" prop="oldPassword">
                    <el-input 
                        v-model="passwordForm.oldPassword" 
                        type="password" 
                        placeholder="请输入原密码"
                        show-password
                    />
                </el-form-item>
                
                <el-form-item label="新密码" prop="newPassword">
                    <el-input 
                        v-model="passwordForm.newPassword" 
                        type="password" 
                        placeholder="8-20位字符，包含字母和数字"
                        show-password
                    />
                </el-form-item>
                
                <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input 
                        v-model="passwordForm.confirmPassword" 
                        type="password" 
                        placeholder="请再次输入新密码"
                        show-password
                    />
                </el-form-item>
            </el-form>
            
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button 
                        type="primary" 
                        @click="submitPasswordChange"
                        :loading="submitting"
                    >
                        确认修改
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, toRefs, reactive, onMounted } from 'vue'
import { userStore } from '@/stores/user'
import { ElMessage, ElMessageBox, linkEmits, type FormInstance, type FormRules } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import formatDateTime from '@/hooks/format'


const userstore = userStore()
const router = useRouter()


// 日期时间格式化函数
let {formatTime} = formatDateTime()

if(localStorage.getItem('user')){
    const u = JSON.parse(localStorage.getItem('user') as string)
    userstore.setuserp(u)


}

onMounted(async ()=>{


    const response = await axios.get('http://localhost:8080/user/personal', {
    params: {  // 使用params选项传递查询参数
    username: userstore.user.username
  },
    headers: { 
    token: localStorage.getItem('token')
  }

})
        userstore.setuserp(response.data.data)
        localStorage.setItem('user',JSON.stringify(userstore.user))
        console.log('u===',response.data.data)


})


    const state = reactive({
    fits: [userstore.user.username,userstore.user.email,userstore.user.createtime,userstore.user.postCount,userstore.user.likeCount ]as string[],
    url: userstore.user.image,

    })
    const { fits, url } = toRefs(state)
  

    // const state = reactive({
    // fits: [userstore.user.username,userstore.user.email,userstore.user.createtimetime,userstore.user.postCount,userstore.user.likeCount ]as string[],
    // url: userstore.user.image,

    // })
    // const { fits, url } = toRefs(state)



const handleCommand = (command: string | number | object) => {
    if (command === 'a') {

        router.push('/login')

    } else if (command === 'b') {

        router.push('/perInformation')

    } else if (command === 'changePassword') { // 新增修改密码命令

        openPasswordDialog()

    } else if (command === 'd') {

        // 退出登录逻辑
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        console.log('退出登陆')
       location.reload()


    }
}

// 修改密码对话框状态
const dialogVisible = ref(false)
const submitting = ref(false)
const passwordFormRef = ref<FormInstance>()


// 密码表单数据
const passwordForm = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
})

//密码验证规则
const validateOldPassword = (rule: any, value: string, callback: any) => {
    if (value === '') {
        callback(new Error('请输入原密码'))
    } else if (value.length < 6) {
        callback(new Error('密码长度至少为6位'))
    } else {
        callback()
    }
}

const validateNewPassword = (rule: any, value: string, callback: any) => {
    if (value === '') {
        callback(new Error('请输入新密码'))
    } else if (value.length < 8) {
        callback(new Error('密码长度至少为8位'))
    } else if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
        callback(new Error('密码必须包含字母和数字'))
    } else {
        callback()
    }
}

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
    if (value === '') {
        callback(new Error('请再次输入新密码'))
    } else if (value !== passwordForm.newPassword) {
        callback(new Error('两次输入的密码不一致'))
    } else {
        callback()
    }
}







const passwordRules: FormRules = {
    oldPassword: [{ validator: validateOldPassword, trigger: 'blur' }],
    newPassword: [{ validator: validateNewPassword, trigger: 'blur' }],
    confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }]
}



//打开修改密码对话框
const openPasswordDialog = () => {
    // 重置表单
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    
    // 如果有表单引用，清除验证状态
    if (passwordFormRef.value) {
        passwordFormRef.value.resetFields()
    }
    
    dialogVisible.value = true
}

// 提交密码修改
const submitPasswordChange = async () => {
    if (!passwordFormRef.value) return
    
    // 验证表单
    const valid = await passwordFormRef.value.validate()
    if (!valid) return
    
    submitting.value = true
    
    try {
        const token = localStorage.getItem('token')
        if (!token) {
            ElMessage.error('请先登录')
            router.push('/login')
            return
        }
        
        const response = await axios.post('http://localhost:8080/user/changepwd', 
            {
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword
            },
            {
                headers: {
                    'token': token
                }
            }
        )
        
        if (response.data.code === 1) {
            ElMessage.success('密码修改成功')
            dialogVisible.value = false
            
            // 可选：强制重新登录
            // localStorage.removeItem('token')
            // localStorage.removeItem('user')
            // router.push('/login')
        } else {
            ElMessage.error(`密码修改失败: ${response.data.msg}`)
        }
    } catch (error: any) {
        console.error('密码修改失败:', error)
        
        if (error.response) {
            // 处理HTTP错误响应
            const status = error.response.status
            if (status === 401) {
                ElMessage.error('身份验证过期，请重新登录')
                router.push('/login')
            } else if (status === 400) {
                ElMessage.error(`请求错误: ${error.response.data.msg || '参数不正确'}`)
            } else {
                ElMessage.error(`服务器错误: ${status}`)
            }
        } else if (error.request) {
            ElMessage.error('网络请求失败，请检查网络连接')
        } else {
            ElMessage.error(`请求错误: ${error.message}`)
        }
    } finally {
        submitting.value = false
    }
}



</script>

<style scoped>
.user-card-container {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.user-card {
  width: 100%;
  max-width: 480px;
  background-color: #f8f9fa; /* 浅灰色背景 */
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: none;
}

.card-header {
  padding: 16px 0;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-avatar {
  border: 3px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.user-info {
  text-align: left;
}

.username {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
  font-weight: 600;
}

.user-status {
  margin: 4px 0 0;
  font-size: 0.9rem;
  color: #5a6268;
}

.user-details {
  padding: 16px 0;
  border-top: 1px solid #eaeaea;
  border-bottom: 1px solid #eaeaea;
  margin: 16px 0;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
}

.detail-label {
  color: #6c757d;
  font-weight: 500;
}

.detail-value {
  color: #343a40;
  font-weight: 500;
}


.example-showcase .el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}

</style>