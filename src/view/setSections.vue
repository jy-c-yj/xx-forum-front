<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="400px">
        <el-row class="tac">    
            <el-col :span="12">
              <h5 class="mb-2">板块管理</h5>
              <el-menu
                default-active="1"
                class="el-menu-vertical-demo"
              >
                <el-menu-item index="1" @click="navigateTo('UpdataSection')">
                  <el-icon><icon-menu /></el-icon>
                  <span>修改板块信息</span>
                </el-menu-item>
                <el-menu-item index="2" @click="navigateTo('ManageSecPost')">
                  <el-icon><icon-menu /></el-icon>
                  <span>管理帖子</span>
                </el-menu-item>
                <el-menu-item index="3" @click="navigateTo('ManageSecUser')">
                  <el-icon><icon-menu /></el-icon>
                  <span>管理关注者</span>
                </el-menu-item>
                <el-menu-item index="4" @click="navigateTo('OperationLog')">
                  <el-icon><icon-menu /></el-icon>
                  <span>操作日志</span>
                </el-menu-item>
                
              </el-menu>
            </el-col>
        </el-row>        
      </el-aside>
      <el-main>
        <!-- 子路由显示区域 -->
        <div class="main-content">
          <router-view :sectionId="sectionId"></router-view>
        </div>        
      </el-main>
    </el-container>
  </div>  
   
</template>

<script setup lang="ts" name="setSections">
import {
  Menu as IconMenu,
} from '@element-plus/icons-vue'
import { useRoute,useRouter } from 'vue-router';
import { ref,reactive } from 'vue';


const route = useRoute()
const router = useRouter()

const sectionId = parseInt(route.params.sectionId as string)

// 导航函数
const navigateTo = (tabType: string) => {
  if (tabType === 'UpdataSection') {
    router.push({ name: 'UpdataSection' });
  } else if(tabType === 'ManageSecPost'){
    router.push({ name: 'ManageSecPost' });
  } else if(tabType === 'ManageSecUser'){
    router.push({ name: 'ManageSecUser' });
  } else if(tabType === 'OperationLog'){
    router.push({ name: 'OperationLog' });
  }
};

// 初始加载时重定向到默认子路由
if (route.name === 'setSections') {
  router.replace({ name: 'UpdataSection' });
}

</script>

<style scoped></style>