<template>
  <div>
    <h3>常看的板块</h3>
      <div v-for="section in sections" :key="section.id">
          <el-button  @click="pushSection(section.id)">{{ section.sectionName }}</el-button>
      </div>
    
  </div>
  <div>
    <h3>热门动态</h3>
    <div v-for="post in posts" :key="post.id">
      <p @click="pushSection(post.sectionId)">{{ post.sectionImage }}</p>
      <p @click="pushSection(post.sectionId)">{{ post.sectionName }}</p>
      <p >{{ formatTime(post.createdTime)  }}</p>
      <p @click="pushPostdetail(post.id)">{{ post.title }}</p>
      <p >{{ truncateContent(post.content) }}</p>
      <p >{{ post.userName }}</p>
      <p >{{ post.replyCount }}</p>
    </div>
    <el-button  @click="">加载更多</el-button>
  </div>
</template>
<script setup lang="ts">
import axios from 'axios';
import type { AxiosError } from 'axios'
import { ElMessage } from 'element-plus';
import { ref, computed, onMounted } from 'vue';
import { useRoute , useRouter} from 'vue-router';
import format from '@/hooks/format';


interface Secs{
  id : number
  sectionName : string
}

interface Posts{
  id : number
  title : string           // 帖子标题
  content : string         // 帖子内容
  userId : number
  userName :string
  createdTime : string
  replyCount : number
  sectionId : number
  sectionName : string
  sectionImage : string

}

const {formatTime,truncateContent} = format()
const router = useRouter()
const error = ref<string | null>(null);
const page = ref(1)
const pageSize = ref(5)
const sections = ref<Secs[]>([])
const posts = ref<Posts[]>([])

onMounted(()=>{

      if(!localStorage.getItem('token')){
      ElMessage.error('请登陆')
      return
    }

  refreshPostsData()
  refreshSecsData()
})

const refreshPostsData = async ()=>{


    try{

      const response =await axios.get('http://localhost:8080/user/myInformation/main/posts',{
        params : {
          page : page.value,
          pageSize : pageSize.value
        },
        headers : {
          token : localStorage.getItem('token')
        }
      })

      if(response.data.code === 1){
        console.log(response.data.data.records)
        posts.value = response.data.data.records
      }else{
        ElMessage.error(response.data.msg)
        error.value = `获取数据失败: ${response.data.msg || '未知错误'}`;
      }

    }catch (err) {
    const axiosError = err as AxiosError;
    error.value = `网络请求失败: ${axiosError.message}`;
    console.error('API请求错误:', axiosError);
  }


}
const refreshSecsData = async ()=>{

    try{

      const response =await axios.get('http://localhost:8080/user/myInformation/main/sections',{
        headers : {
          token : localStorage.getItem('token')
        }
      })

      if(response.data.code === 1){
         sections.value = response.data.data
      }else{
        ElMessage.error(response.data.msg)
        error.value = `获取数据失败: ${response.data.msg || '未知错误'}`;
      }

    }catch (err) {
    const axiosError = err as AxiosError;
    error.value = `网络请求失败: ${axiosError.message}`;
    console.error('API请求错误:', axiosError);
  }

}

const pushSection = (sectionId : number)=>{
    router.push({
    name: 'section',
    params: { 
      id: sectionId,
    }
  })
}

const pushPostdetail = (postId : number)=>{
      axios.get('http://localhost:8080/user/addPostView',
      {
      params: { id : postId ,
                viewCount : -1
      },
      headers: {
        token: localStorage.getItem('token') || ''
      }
    }
    )

    router.push({
    name: 'postdetail',
    params: { 
      id: postId,
    }
  })
}

</script>

<style scoped>
</style>