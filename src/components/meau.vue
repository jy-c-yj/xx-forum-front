<template>
  <el-menu
    :default-active="activeIndex"
    class="custom-menu"
    mode="horizontal"
    :ellipsis="false"
    @select="handleSelect"
  >
    <!-- Logo 放在左侧 --> 
    <el-menu-item index="0" class="logo-item">
      <img
        style="width: 200px"
        src="@/XX.svg"
        alt="XX-Forum logo"
        @click="pushHome()"
      />
    </el-menu-item>

    <el-icon class="Message" @click="toMessage()" ><Message /></el-icon>
    
    <!-- 右侧功能区 -->
    <div class="flex-grow"></div>
    
    <!-- 下拉菜单放在最右侧 -->
    <el-menu-item index="right-menu" class="right-menu-item">
      <el-dropdown @command="handleCommand" trigger="click">
        <span class="el-dropdown-link user-actions">
          <el-avatar :size="30" :src="user.image" class="avatar" @click.stop="myInformation(user.id)"></el-avatar>
          <el-icon class="el-icon--right"><arrow-down /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu class="user-dropdown">
            <el-dropdown-item command="a" class="dropdown-item">
              <el-icon><User /></el-icon>登录
            </el-dropdown-item>
            <el-dropdown-item command="b" class="dropdown-item" :disabled="!user.id">
              <el-icon><Document /></el-icon>编辑资料
            </el-dropdown-item>
            <el-dropdown-item command="changePassword" class="dropdown-item" :disabled="!user.id">
              <el-icon><Lock /></el-icon>修改密码
            </el-dropdown-item>
            <el-dropdown-item command="e" class="dropdown-item" :disabled="!user.id">
              <el-icon><plus /></el-icon>创建板块 
            </el-dropdown-item>
            <el-dropdown-item divided command="d" class="dropdown-item logout">
              <el-icon><SwitchButton /></el-icon>退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-menu-item>
  </el-menu>


  <!-- 修改密码对话框 -->
  <el-dialog 
    v-model="dialogVisible" 
    title="修改密码" 
    width="500px"
    :close-on-click-modal="false"
    custom-class="password-dialog"
  >
    <el-form 
      ref="passwordFormRef" 
      :model="passwordForm" 
      :rules="passwordRules" 
      label-width="100px"
      status-icon
      style="background-color: #fff; padding: 20px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);"
    >
      <el-form-item label="原密码" prop="oldPassword">
        <el-input 
          v-model="passwordForm.oldPassword" 
          type="password" 
          placeholder="请输入原密码"
          show-password
          style="width: 300px;"
          suffix-icon="el-icon-lock"
        >
          <template #prefix>
            <svg-icon name="password" style="color: #c0c4cc;"/>
          </template>
        </el-input>
      </el-form-item>
      
      <el-form-item label="新密码" prop="newPassword">
        <el-input 
          v-model="passwordForm.newPassword" 
          type="password" 
          placeholder="8-20位字符，包含字母和数字"
          show-password
          style="width: 300px;"
          suffix-icon="el-icon-key"
        >
          <template #prefix>
            <svg-icon name="password" style="color: #c0c4cc;"/>
          </template>
        </el-input>
      </el-form-item>
      
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input 
          v-model="passwordForm.confirmPassword" 
          type="password" 
          placeholder="请再次输入新密码"
          show-password
          style="width: 300px;"
          suffix-icon="el-icon-check"
        >
          <template #prefix>
            <svg-icon name="password" style="color: #c0c4cc;"/>
          </template>
        </el-input>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer" style="text-align: right;">
        <el-button @click="dialogVisible = false" style="color: #606266; border: 1px solid #dcdfe6;">取消</el-button>
        <el-button 
          type="primary" 
          @click="submitPasswordChange"
          :loading="submitting"
          style="background-color: #e4e7ed; border: none; color: #606266;"
        >
          确认修改
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref,reactive, onMounted ,watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { User } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router'
import axios from 'axios'
import { el } from 'element-plus/es/locales.mjs'
import { menuStore } from '@/stores/meau';



const menustore = menuStore();
const menuKey = ref(0);


const router = useRouter()
const activeIndex = ref('1')
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}

interface user{
  id :number,
  name : string,
  image : string
}

const user = ref<user>({
  id : 0,
  name : ' ',
  image : ''
})

watch(
  () => menustore.refreshTrigger,
  () => {
    menuKey.value++;
    refreshMenuData()
  }
);

const refreshMenuData = async()=>{
      const response = await axios.get("http://localhost:8080/user/meanUser",{
      headers : {
        token : localStorage.getItem('token')
      }
    })


    if(response.data.code === 1){
      user.value = response.data.data 
      console.log('user----->',user.value)
    }
    else{
      console.log(response.data.msg)
    }
}


onMounted(()=>{
   refreshMenuData()
}
   
)

const handleCommand = (command: string | number | object) => {
    if (command === 'a') {

        router.push('/login')

    } else if (command === 'b') {

        router.push('/perInformation')

    } else if (command === 'changePassword') { // 新增修改密码命令

        openPasswordDialog()

    } else if (command === 'd') {

        // 退出登录逻辑
        if(!localStorage.getItem('token') ){
          ElMessage.error('请检查登陆状态')
          return
        }

        try{
          axios.delete("http://localhost:8080/user/quit",{
          headers : {
            token : localStorage.getItem('token') 
          }
        })
        }catch{
          ElMessage.error("出现错误，请检查登陆")
        }

        localStorage.removeItem('token')
        localStorage.removeItem('user')

        ElMessage.success('成功退出')
       location.reload()


    }
    else if (command === 'e') {
    // 在新标签页打开创建板块页面
    const route = router.resolve({
      name: 'CreateSection' // 使用路由名称
    })
    window.open(route.href, '_blank')
    }
    else if(command === 'e'){
      createSection()
    }
}

const toMessage = ()=>{
  const route = router.resolve({
      name: 'chatMessage' // 使用路由名称
    })
    window.open(route.href, '_blank')
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

//创建新的板块
const createSection = async () => {

}



const myInformation = (id : number) => {
console.log()
  router.push({
    name: 'myInformation',
    params: { 
      id: id
    }
  })

}

const pushHome = ()=>{
  router.push('/home')
}

</script>

<style scoped>
    .el-menu--horizontal > .el-menu-item:nth-child(1) {
    margin-right: auto;
    }
    /* 顶部菜单容器 */
.custom-menu {
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  border-bottom: none !important;
}

/* Logo 样式 */
.logo-item {
  height: 60px;
  cursor: pointer;
  border-bottom: none !important;
}

.logo-item:hover {
  background-color: transparent !important;
}

/* 填充剩余空间 */
.flex-grow {
  flex-grow: 1;
}


/* 右侧菜单项 */
.right-menu-item {
  height: 60px;
  border-bottom: none !important;
  margin-left: auto;
}

.right-menu-item:hover {
  background-color: transparent !important;
}

/* 用户操作区域 */
.user-actions {
  display: flex;
  align-items: center;
  padding: 0 10px;
  color: #606266;
  height: 100%;
}

.user-actions:hover {
  color: #409EFF;
}

.avatar {
  margin-right: 8px;
  background-color: #f0f2f5;
}

/* 下拉菜单样式 */
.user-dropdown {
  margin-top: 5px;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
}

.dropdown-item {
  padding: 8px 16px;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.dropdown-item i {
  margin-right: 8px;
  font-size: 16px;
}

.logout {
  color: #f56c6c;
}
</style>
