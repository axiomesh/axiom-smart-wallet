import React, { useEffect } from 'react';

const ClearStorageAfterTimestamp = () => {
  const targetTimestamp = sessionStorage.getItem("validUntil");
  if(!targetTimestamp) return;
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTimestamp = new Date().getTime(); // 获取当前时间的时间戳（单位：秒）
      if (currentTimestamp > Number(targetTimestamp)) {
        sessionStorage.removeItem("sk");
        sessionStorage.removeItem("a");
        sessionStorage.removeItem("b");
        sessionStorage.removeItem("op");
        sessionStorage.removeItem("freeLimit");
        sessionStorage.removeItem("sr");
        sessionStorage.removeItem("validAfter");
        sessionStorage.removeItem("validUntil");
        sessionStorage.removeItem("ow");
        clearInterval(interval); // 停止定时器
      }
    }, 1000); // 每秒检查一次

    return () => clearInterval(interval); // 在组件卸载时清除定时器
  }, [targetTimestamp]);

  return null; // 这个组件不需要渲染任何内容
};

export default ClearStorageAfterTimestamp;
