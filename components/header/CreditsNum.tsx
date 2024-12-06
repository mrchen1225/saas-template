"use client";

import { useEffect, useState } from "react";

export default function CreditsNum() {
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    // 这里应该是从API或状态管理中获取实际的积分数量
    // 这只是一个示例，实际使用时请替换为真实的数据获取逻辑
    const fetchCredits = async () => {
      const response = await fetch("/api/credits");
      const data = await response.json();
      setCredits(data.credits);
    };

    fetchCredits();
  }, []);

  return (
    <div className="flex items-center ml-2">
      <div className="relative flex items-center justify-center w-5 h-5 bg-gray-300 rounded-full border border-gray-400 shadow-inner">
        <div className="absolute inset-0 bg-gray-200 rounded-full m-0.5"></div>
        <span className="relative text-[10px] font-bold text-gray-700">C</span>
      </div>
      <span className="ml-1 text-sm font-bold text-gray-400">{credits}</span>
    </div>
  );
}

