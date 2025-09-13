import { ref, onMounted, watch } from 'vue'
import { useRoute,useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'


export default function(){


    const isModerator = ref(false)         // 是否是版主
    let banDialogVisible = ref(false)    // 封禁对话框显示状态
    const banForm = ref({                   // 封禁表单数据
    reason : '请输入原因'
    })
    //查询是否是版主
    const checkUserModeratorStatus = async (sectionId:number)=>{
        try {
            const response = await axios.get('http://localhost:8080/user/sections/isModerator',{
            params : {sectionId : sectionId},
            headers: { token: localStorage.getItem('token') || '' }
            })
            
            if (response.data.code === 1) {
            isModerator.value = response.data.data;

            }
        } catch (error) {
            console.error('检查版主状态失败:', error);
        }

    }

  

    //封禁帖子
    const confirmBanPost = async (postId:number) => {
    try {
        
            const response = await axios.post('http://localhost:8080/user/post/confirmBanPost',{
            postId: postId,
            reason: banForm.value.reason
            },{
            headers: { token: localStorage.getItem('token') || '' }
            });
            
            if (response.data.code === 1) {
            ElMessage.success('帖子已封禁');
            banDialogVisible.value = false;
            banForm.value.reason = '';     
            // 可选：刷新页面或更新帖子状态
            } else {
            ElMessage.error(response.data.msg || '封禁失败')
            }
        } catch (error) {
            console.error('封禁帖子失败:', error);
            ElMessage.error('封禁帖子失败');
        }

    console.log("确认封禁，原因:", banForm.value.reason)
    banDialogVisible.value = false
    }
    //解封帖子
    
    //封禁用户
    const confirmBanUser = async (userId:number,sectionId:number) => {
    try {
        
            const response = await axios.post('http://localhost:8080/user/sections/confirmBanUser',{
            userId: userId,
            sectionId: sectionId,
            reason: banForm.value.reason
            },{
            headers: { token: localStorage.getItem('token') || '' }
            });
            
            if (response.data.code === 1) {
            ElMessage.success('用户已封禁');
            banDialogVisible.value = false;
            banForm.value.reason = '';     
            
            } else {
            ElMessage.error(response.data.msg || '封禁失败')
            }
        } catch (error) {
            console.error('封禁用户失败:', error);
            ElMessage.error('封禁用户失败');
        }

    console.log("确认封禁，原因:", banForm.value.reason)
    banDialogVisible.value = false
    }
    //解封用户

    //置顶帖子
    const pinPost = async () => {
    console.log('置顶帖子')
    }    
    //取消置顶
    return {pinPost,confirmBanPost,confirmBanUser,checkUserModeratorStatus,isModerator,banDialogVisible,banForm}
}