import {defineStore} from 'pinia'
import { reactive } from 'vue'

export const userStore = defineStore('users',()=>{
    

    const user = reactive({
        id : 0,
        username: '未登录',
        email: '未登录',
        createtime: '未登录',
        postCount : '请登录',
        likeCount : '请登录',
        phone : '',
        desc : '',
        gender : '0',
        image: ''

    })

    function getuser(){
        return user
    }
    function setuser(per:any){
        if(per.id){
            user.id = per.id
        }
        user.email = per.email
        user.postCount = per.postCount
        user.likeCount = per.likeCount
        user.username = per.usernamecreate
        user.createtime = per.createtime
        user.desc = per.desc
        user.gender = per.gender
        user.phone = per.phone
    }

        function setuserp(per:any){
        if(per.id){
            user.id = per.id
        }
        if(per.email){
            user.email = per.email
        }
        user.email = per.email
        user.postCount = per.postCount
        user.likeCount = per.likeCount
        user.username = per.username
        user.createtime = per.createtime
        user.image = per.image

    }

    return {user , getuser ,setuser,setuserp}

})

