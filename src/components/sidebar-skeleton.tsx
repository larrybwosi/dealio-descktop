import { cn } from '@/lib/utils';
import { Utensils, SidebarClose } from 'lucide-react';

// Skeleton component for individual elements
const Skeleton = ({ className, ...props }) => {
  return <div className={cn('animate-pulse rounded-md bg-gray-200', className)} {...props} />;
};

export function SidebarSkeleton({ collapsed = false }) {
  return (
    <div
      className={cn(
        'flex flex-col h-screen bg-white border-r transition-all duration-300',
        collapsed ? 'w-16' : 'w-[240px]'
      )}
    >
      {/* Header with logo */}
      <div className="flex items-center p-4 border-b">
        <div className="bg-teal-600 text-white p-2 rounded flex items-center justify-center">
          <Utensils size={16} />
        </div>
        {!collapsed && <Skeleton className="ml-2 h-6 w-20" />}
        <div className="ml-auto">
          <SidebarClose className={cn('h-4 w-4 transition-all text-gray-300', collapsed ? '-rotate-180' : '')} />
        </div>
      </div>

      {/* Restaurant info skeleton */}
      <div className="border-b py-3 px-4">
        {!collapsed && <Skeleton className="h-3 w-24 mb-2" />}
        <div className="flex items-center py-2">
          {!collapsed ? (
            <>
              <Skeleton className="h-4 w-20" />
              <div className="ml-auto text-gray-300">⋮</div>
            </>
          ) : (
            <div className="w-full flex justify-center">
              <Skeleton className="h-4 w-6" />
            </div>
          )}
        </div>
        {!collapsed && <Skeleton className="h-3 w-32" />}
      </div>

      {/* Navigation items skeleton */}
      <div className="flex-1 overflow-auto py-2">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center w-full mb-1 px-4 py-2 relative',
              collapsed ? 'justify-center' : 'justify-start'
            )}
          >
            {/* Icon skeleton */}
            <Skeleton className="h-4 w-4 rounded-sm" />

            {!collapsed && (
              <>
                {/* Label skeleton */}
                <Skeleton className="ml-2 h-4 w-16 flex-1" />

                {/* Badge skeleton (randomly show on some items) */}
                {index === 3 && <Skeleton className="ml-auto h-5 w-4 rounded-full" />}
              </>
            )}

            {/* Badge skeleton for collapsed state */}
            {collapsed && index === 3 && <Skeleton className="absolute top-0 right-1 h-4 w-4 rounded-full" />}
          </div>
        ))}
      </div>

      {/* User account section skeleton */}
      <div className="border-t p-3">
        {!collapsed ? (
          <div className="flex items-center w-full p-2 rounded">
            {/* Avatar skeleton */}
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="ml-2 flex-1">
              {/* Name skeleton */}
              <Skeleton className="h-4 w-16 mb-1" />
              {/* Email skeleton */}
              <Skeleton className="h-3 w-24" />
            </div>
            {/* Chevron skeleton */}
            <Skeleton className="h-4 w-4" />
          </div>
        ) : (
          <div className="flex justify-center p-2">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced version with pulse variations for more realistic loading
export function SidebarSkeletonEnhanced({ collapsed = false }) {
  return (
    <div
      className={cn(
        'flex flex-col h-screen bg-white border-r transition-all duration-300',
        collapsed ? 'w-16' : 'w-[240px]'
      )}
    >
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <div className="bg-teal-600 text-white p-2 rounded flex items-center justify-center">
          <Utensils size={16} />
        </div>
        {!collapsed && (
          <div className="ml-2">
            <Skeleton className="h-6 w-20" />
          </div>
        )}
        <div className="ml-auto">
          <SidebarClose className="h-4 w-4 text-gray-300" />
        </div>
      </div>

      {/* Restaurant info */}
      <div className="border-b py-3 px-4 space-y-2">
        {!collapsed && <Skeleton className="h-3 w-28" />}
        <div className="flex items-center py-1">
          {!collapsed ? (
            <>
              <Skeleton className="h-4 w-24" />
              <div className="ml-auto text-gray-300">⋮</div>
            </>
          ) : (
            <div className="w-full flex justify-center">
              <Skeleton className="h-4 w-8" />
            </div>
          )}
        </div>
        {!collapsed && <Skeleton className="h-3 w-36" />}
      </div>

      {/* Navigation skeleton with staggered animations */}
      <div className="flex-1 overflow-auto py-2 space-y-1">
        {[
          { width: 'w-20' },
          { width: 'w-16' },
          { width: 'w-24' },
          { width: 'w-18', badge: true },
          { width: 'w-28' },
          { width: 'w-22' },
          { width: 'w-26' },
          { width: 'w-20' },
          { width: 'w-18' },
          { width: 'w-24' },
        ].map((item, index) => (
          <div
            key={index}
            className={cn('flex items-center px-4 py-2 relative', collapsed ? 'justify-center' : '')}
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            <Skeleton className="h-4 w-4 rounded-sm" />

            {!collapsed && (
              <>
                <Skeleton className={cn('ml-2 h-4', item.width)} />
                {item.badge && <Skeleton className="ml-auto h-5 w-6 rounded-full" />}
              </>
            )}

            {collapsed && item.badge && <Skeleton className="absolute -top-1 -right-1 h-3 w-3 rounded-full" />}
          </div>
        ))}
      </div>

      {/* User section */}
      <div className="border-t p-3">
        <div className={cn('flex items-center p-2 rounded', collapsed ? 'justify-center' : '')}>
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          {!collapsed && (
            <div className="ml-2 flex-1 space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
          )}
          {!collapsed && <Skeleton className="h-4 w-4 ml-2" />}
        </div>
      </div>
    </div>
  );
}
