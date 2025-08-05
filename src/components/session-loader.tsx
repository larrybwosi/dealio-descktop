// Loading Skeleton Component
const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Header Skeleton */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded animate-pulse mx-auto w-32"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-48"></div>
          </div>
        </div>

        {/* Card Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          {/* Form fields skeleton */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
            </div>
          </div>

          {/* Button skeleton */}
          <div className="pt-2">
            <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
          </div>

          {/* Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
          </div>

          {/* Social buttons skeleton */}
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
          </div>
        </div>

        {/* Footer links skeleton */}
        <div className="text-center space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-40"></div>
          <div className="flex justify-center space-x-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
          </div>
        </div>
      </div>

      {/* Floating loading indicator */}
      <div className="fixed bottom-6 right-6">
        <div className="flex items-center space-x-2 bg-white rounded-full shadow-lg px-4 py-2 border">
          <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-sm text-gray-600">Loading...</span>
        </div>
      </div>
    </div>
  );
};
export default LoadingSkeleton;