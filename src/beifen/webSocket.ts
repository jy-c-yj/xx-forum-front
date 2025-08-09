import { Client } from '@stomp/stompjs';


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
    debug: (str) => console.log('STOMP:', str)
  });
    stompClient.onConnect = () => {
        console.log('WebSocket connected');
        
        // const subPath = `/user/${userId}/queue/messages`;
        const subPath = `/user/queue/messages`
        console.log("Subscribing to:", subPath);
        
        // 修改订阅处理，直接传递消息体
        const subscription = stompClient?.subscribe(
            subPath,
            (stompMessage) => {

                console.log("Received STOMP message:", stompMessage);
                console.log("STOMP message headers:", stompMessage.headers);
                console.log("Message body:", stompMessage.body);
                try {
                    // 直接传递消息体字符串给回调
                    onMessageReceived(stompMessage.body); 
                } catch (e) {
                    console.error('Failed to process message:', e);
                }
            }
        );
        
    };

  stompClient.onStompError = (frame) => {
    console.error('STOMP protocol error:', frame.headers.message);
  };

  stompClient.onWebSocketError = (error) => {
    console.error('WebSocket error:', error);
  };

  stompClient.activate();
};

const sendsMessage = (message: any) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: '/app/private-message',
      body: JSON.stringify(message)
    });
    return true;
  }
  console.warn('STOMP connection not established');
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