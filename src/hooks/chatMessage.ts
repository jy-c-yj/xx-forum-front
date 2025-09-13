import {ref} from 'vue'
import { Client } from '@stomp/stompjs';
import { ElMessage } from 'element-plus';

export default function(){
    const dialogBottonVisible = ref(false)
    // 全局变量，用于保存STOMP客户端实例
let stompClient: Client | null = null;
let isConnecting = false;

// 初始化WebSocket连接
const initWebSocketConnection = async (): Promise<Client> => {
  return new Promise((resolve, reject) => {
    if (stompClient && stompClient.connected) {
      resolve(stompClient);
      return;
    }
    
    if (isConnecting) {
      // 如果正在连接中，等待连接完成
      const checkInterval = setInterval(() => {
        if (stompClient && stompClient.connected) {
          clearInterval(checkInterval);
          resolve(stompClient);
        }
      }, 100);
      return;
    }
    
    isConnecting = true;
    const token = localStorage.getItem('token') || '';
    const url = `ws://localhost:8080/ws?token=${encodeURIComponent(token)}`;
    
    const client = new Client({
      brokerURL: url,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => console.log('STOMP:', str)
    });
    
    client.onConnect = () => {
      console.log('WebSocket connected');
      isConnecting = false;
      stompClient = client;
      resolve(client);
    };
    
    client.onStompError = (frame) => {
      console.error('STOMP error:', frame);
      isConnecting = false;
      reject(new Error('STOMP connection error'));
    };
    
    client.onWebSocketError = (error) => {
      console.error('WebSocket error:', error);
      isConnecting = false;
      reject(new Error('WebSocket connection error'));
    };
    
    client.activate();
  });
};

// 发送消息函数
const chatMessage = async (receiverId: any) => {
  let client: Client | null = null;
  
  try {
    // 确保连接已建立
    client = await initWebSocketConnection();
    
    // 创建消息
    const message = {
      to: receiverId,
      content: '你好~',
      timestamp: new Date().toISOString()
    };

    // 发送消息
    client.publish({
      destination: '/app/private-message',
      body: JSON.stringify(message),
      headers: {
        'content-type': 'application/json'
      }
    });
    
    console.log('消息发送成功');
  } catch (error) {
    console.error('发送消息失败:', error);
  } finally {
    // 无论发送成功与否，都断开连接
    if (client) {
      client.deactivate();
      // 如果当前全局客户端是同一个实例，则清空
      if (stompClient === client) {
        stompClient = null;
      }
      console.log('WebSocket disconnected');
    }
  }
};

// 断开连接函数（在组件卸载或不再需要时调用）
const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    console.log('WebSocket disconnected');
  }
};
    return {dialogBottonVisible,chatMessage}
}