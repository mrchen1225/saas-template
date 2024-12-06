export default function Loading() {
  return (
    <div className="w-full min-h-screen">
      {/* Hero 区域加载骨架屏 */}
      <div className="w-full h-[600px] animate-pulse bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="space-y-4">
            <div className="h-12 w-2/3 bg-gray-200 rounded"></div>
            <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
            <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      {/* 其他区域加载骨架屏 */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-40 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 