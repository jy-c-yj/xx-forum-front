import { Client } from '@stomp/stompjs';
import { ElMessage } from 'element-plus';


export default function(){

let stompClient: Client | null = null;

const connect = (userId: string, token: string, onMessageReceived: (message: any) => void) => {
  // 将 token 作为查询参数传递
  const url = `ws://localhost:8080/ws?token=${encodeURIComponent(token)}`;
  
  stompClient = new Client({
    brokerURL: url,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    appendMissingNULLonIncoming: true,
    forceBinaryWSFrames: false, // 强制使用文本帧
    splitLargeFrames: false,
    debug: (str) => console.log('STOMP:', str)
  });
    stompClient.onConnect = () => {
        console.log('WebSocket connected');
    
    const subPath = `/user/queue/messages`;
    console.log("Subscribing to:", subPath);
    
    // 确保使用正确的订阅方式
    stompClient?.subscribe(
      subPath,
      (message) => {
        console.log("===== RAW MESSAGE HEADERS =====", message.headers);
        console.log("===== 回调信息 =====", message.body);
        console.log("===== RAW MESSAGE BODY =====", message.body);
        try {
          // 直接传递消息体字符串
          onMessageReceived(message.body); 
        } catch (e) {
          console.error('Failed to process message:', e);
        }
      },
      // 添加ACK模式配置
      { ack: 'client-individual' }
    );
       

  };


    stompClient.onWebSocketError = (error) => {
    console.error('WebSocket connection error:', error);
    ElMessage.error('WebSocket连接错误');
    };

    stompClient.onStompError = (frame) => {
    console.error('STOMP protocol error:', frame.headers.message);
    console.error('Error details:', frame.body);
    ElMessage.error(`STOMP协议错误: ${frame.headers.message}`);
    };

    // 添加断开连接处理
    stompClient.onDisconnect = () => {
    console.warn('WebSocket disconnected');
    ElMessage.warning('WebSocket连接已断开');
    };

  stompClient.activate();
};

const sendsMessage = (message: any) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: '/app/private-message',
      body: JSON.stringify(message),
      headers: {
        'content-type': 'application/json',
        'priority': '9'  // 添加一些测试头
      }
    });
    return true;
  }
  console.warn('STOMP connection not established', stompClient?.connected);
  return false;
};

const disconnect = () => {
  if (stompClient) {
    stompClient.deactivate();
    console.log('WebSocket disconnected');
  }
};

return {connect, sendsMessage , disconnect}
}