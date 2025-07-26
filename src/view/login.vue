<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>欢迎登录</h1>
        <p>请输入您的账号信息</p>
      </div>
      
      <el-form 
        ref="formRef" 
        :model="form" 
        class="login-form"
      >
        <el-form-item>
          <el-input 
            v-model="form.username" 
            placeholder="用户名"
            size="large"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item>
          <el-input 
            v-model="form.password" 
            type="password"
            placeholder="密码"
            size="large"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading"
            @click="submitForm"
            size="large"
            class="login-btn"
            >
            {{ loading ? '登录中...' : '登 录' }}
            </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <div class="remember">
          <el-checkbox>记住我</el-checkbox>
        </div>
        <div class="forgot-password">
          <RouterLink to="/enroll" >还未注册？</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive,ref } from 'vue';
import { User, Lock } from '@element-plus/icons-vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { RouterLink } from 'vue-router';
import { userStore } from '@/stores/user';
import { menuStore } from '@/stores/meau';
import meau from '@/components/meau.vue'

const loading = ref(false);
const router = useRouter();
const userstore = userStore();
const menustore = menuStore();
const form = reactive({
  username: "admin",
  password: "123456"
})

const submitForm = async () => {
  try {
    loading.value = true; // 开始加载
    
    // 使用Axios发送POST请求
    const response = await axios.post('http://localhost:8080/user/login', {
      username: form.username,
      password: form.password
    });

    const result = response.data;
    
    // 处理成功响应
    if (result.code === 1) {
        console.log('登录成功');
        
      ElMessage.success('登录成功');
      //将用户数据以及token'令牌储存进localStorage
      localStorage.setItem('token', response.data.data.token);
      const  user = {
          id : response.data.data.id,
          email : response.data.data.email,
          username : response.data.data.username,
          likeCount : response.data.data.likeCount,
          postCount : response.data.data.postCount,
          createtime : response.data.data.createTime,
          image : response.data.data.file
        }
      localStorage.setItem('user', JSON.stringify(user) );
        //设置登陆状态
      localStorage.setItem('loginState', JSON.stringify({
        username : response.data.data.username,
        state : '1'
      }))

      menustore.triggerRefresh()

      router.push('/home');
    } else {
      ElMessage.error(response.data.message || '登录失败');
    }
  } catch (error) {
        if (axios.isAxiosError(error)) {
        if (error.response) {
            // 服务器返回了错误状态码（4xx/5xx）
            ElMessage.error(`用户名或密码错误`);
        } else {
            // 请求未收到响应（网络问题）
            ElMessage.error('网络错误，请稍后重试');
        }
        } else {
        // 其他JavaScript错误
        ElMessage.error('发生未知错误');
        }
  } finally {
    loading.value = false; // 结束加载
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
}

.login-card:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  padding: 40px 30px 20px;
  border-bottom: 1px solid #f0f2f5;
}

.login-header h1 {
  margin: 0;
  font-size: 26px;
  color: #2c3e50;
  font-weight: 600;
}

.login-header p {
  margin: 12px 0 0;
  font-size: 15px;
  color: #7f8c8d;
  font-weight: 400;
}

.login-form {
  padding: 30px 30px 20px;
}

.login-form :deep(.el-input) {
  --el-input-height: 50px;
  --el-input-border-radius: 8px;
}

.login-form :deep(.el-input__wrapper) {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  box-shadow: none;
  padding: 0 15px;
  transition: all 0.2s ease;
}

.login-form :deep(.el-input__wrapper:hover),
.login-form :deep(.el-input__wrapper:focus) {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.login-form :deep(.el-input__inner) {
  font-size: 15px;
  color: #2d3748;
}

.login-form :deep(.el-input__prefix) {
  color: #a0aec0;
}

.login-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
  font-weight: 500;
  background-color: #3498db;
  border: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.login-btn:hover:not(:disabled) {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.login-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px 30px;
  font-size: 14px;
}

.remember :deep(.el-checkbox__label) {
  color: #718096;
}

.forgot-password a {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.forgot-password a:hover {
  color: #2980b9;
  text-decoration: underline;
}
</style>