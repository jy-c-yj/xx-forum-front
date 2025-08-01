import { createRouter, createWebHistory } from 'vue-router'
import login from '../view/login.vue'
import Login from '../view/login.vue'
import home from '@/view/home.vue'
import Enroll from '@/view/enroll.vue'
import Posts from '@/components/posts.vue'
import Personal from '@/components/personal.vue'
import Meau from '@/components/meau.vue'
import PerInformation from '@/view/perInformation.vue'
import Postdetail from '@/view/postdetail.vue'
import Reply from '@/components/reply.vue'
import Search from '@/components/search.vue'
import HotSection from '@/components/hotSection.vue'
import Section from '@/view/section.vue'
import MyInformation from '@/view/myInformation.vue'
import MyFollow from '@/components/MyInformationChild/myFollow.vue'
import Main from '@/components/MyInformationChild/main.vue'
import MyReply from '@/components/MyInformationChild/reply.vue'
import MyCollection from '@/components/MyInformationChild/collection.vue'
import MyManage from '@/components/MyInformationChild/manage.vue'
import MyPosts from '@/components/MyInformationChild/posts.vue'
import SearchDetail from '@/view/SearchDetail.vue'
import SearchDetailInSec from '@/view/SearchDetailInSec.vue'


const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/home',
      name: 'home',
      component: home,
    },
    {
      path: '/enroll',
      name: 'enroll',
      component: Enroll,
    },
    {
      path: '/posts',
      name: 'posts',
      component: Posts,
    },
    {
      path: '/personal',
      name: 'personal',
      component: Personal,
    },
    {
      path: '/hotSection',
      name: 'hotSection',
      component: HotSection 
    },
    {
      path: '/meau',
      name: 'meau',
      component: Meau,
    },
    {
      path: '/search',
      name: 'search',
      component: Search,
    },
    {
      
      path : '/searchdetail',
      name : 'searchdetail',
      component : SearchDetail,
      meta: { title: '搜索结果' }
    },
    {
      
      path : '/searchdetailinSec',
      name : 'searchdetailinSec',
      component : SearchDetailInSec,
      meta: { title: '搜索结果' }
    },
    {
      path: '/perInformation',
      name: 'perInformation',
      component: PerInformation,
    },
    {
    path: '/postdetail/:id',
    name: 'postdetail',
    component: Postdetail,
    props: true
    },
    {
      path : '/reply',
      name : 'reply',
      component : Reply
    },
    {
      path : '/section/:id',
      name : 'section',
      component : Section,
      props: true
    },
    {
      path : '/myInformation/:id',
      name : 'myInformation',
      component : MyInformation,
      props: true,
      redirect: { name: 'main' }, // 添加重定向到默认子路由
      children : [
        {
          path : 'main',
          name : 'main',
          component : Main
        },
        {
          path : 'myFollow',
          name : 'myFollow',
          component : MyFollow
        },
        {
          path: 'myReply',
          name: 'myReply',
          component: MyReply 
        },
        {
          path: 'myCollection',
          name: 'myCollection',
          component: MyCollection
        },
        {
          path: 'myPosts',
          name: 'myPosts',
          component: MyPosts
        },
        {
          path: 'myManage',
          name: 'myManage',
          component: MyManage
        }
      ]

    }
  ],
})

export default router
