

export default function(){
    // 日期时间格式化函数
const formatTime = (dateTime: string | null) => {
  if (!dateTime) return '';
  
  try {
    const date = new Date(dateTime);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    console.error('日期格式化错误:', e);
    return dateTime;
  }
};



const getImageUrl = (path: string | null): string => {
  if (!path) return 'https://web-cyj-sky.oss-cn-beijing.aliyuncs.com/2f604646-5980-4aac-be0a-065c3bd4f3fb.jpg'; // 处理 null 值
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_API_BASE_URL || ''}${path}`;
};

// 格式化大数字显示
const formatCount = (count: number): string => {
  if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
  if (count >= 10000) return (count / 10000).toFixed(1) + '万';
  if (count >= 1000) return (count / 1000).toFixed(1) + '千';
  return count.toString();
};
// 内容截取函数
const truncateContent = (content: string | null | undefined) => {
  if (!content) return '';
  const plainText = content.replace(/<[^>]*>/g, '');
  return plainText.length > 20 ? plainText.slice(0, 20) + '...' : plainText;
}
return {formatTime,getImageUrl,formatCount,truncateContent}
}