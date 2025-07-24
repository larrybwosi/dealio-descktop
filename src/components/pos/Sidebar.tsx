import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { 
  ChevronRight,
  LayoutDashboard,
  ClipboardList,
  Package2,
  Tag,
  Utensils,
  Users,
  FileText,
  BarChart2,
  Settings,
  HelpCircle,
  CheckCircle
} from 'lucide-react';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'inventory', label: 'Inventory', icon: Package2 },
  { id: 'discounts', label: 'Discounts', icon: Tag, badge: 8 },
  { id: 'orderingTable', label: 'Ordering table', icon: Utensils },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'orderLists', label: 'Order lists', icon: FileText },
  { id: 'analysis', label: 'Analysis', icon: BarChart2 },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'helpCenter', label: 'Help center', icon: HelpCircle },
];

export function Sidebar() {
  const [activeItem, setActiveItem] = useState('orders');
  const [collapsed, setCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: "Antonio Erlangga",
    email: "antonioer@gmail.com",
    image: "/images/Profile.jpg"
  });

  return (
    <div className={cn(
      "flex flex-col h-screen bg-white border-r transition-all duration-300", 
      collapsed ? "w-16" : "w-[240px]"
    )}>
      {/* Header with logo */}
      <div className="flex items-center p-4 border-b">
        <div className="bg-teal-600 text-white p-2 rounded flex items-center justify-center">
          <Utensils size={16} />
        </div>
        {!collapsed && <div className="ml-2 font-bold text-lg">FoodPoint</div>}
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-auto"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronRight className={cn("h-4 w-4 transition-all", collapsed ? "-rotate-180" : "")} />
        </Button>
      </div>

      {/* Restaurant info */}
      <div className="border-b py-3 px-4">
        {!collapsed && <div className="text-sm text-gray-500">Current restaurant</div>}
        <div className="flex items-center py-2">
          {!collapsed ? (
            <>
              <div className="font-medium">Bounty Catch Branch 1</div>
              <div className="ml-auto">⋮</div>
            </>
          ) : (
            <div className="w-full text-center">BC</div>
          )}
        </div>
        {!collapsed && <div className="text-xs text-gray-500">Indah Kapuk beach, Jakarta</div>}
      </div>

      {/* Navigation items */}
      <div className="flex-1 overflow-auto py-2">
        {sidebarItems.map(item => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeItem === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start mb-1 relative",
                collapsed ? "px-0" : ""
              )}
              onClick={() => setActiveItem(item.id)}
            >
              <Icon className={cn("h-4 w-4", collapsed ? "mx-auto" : "mr-2")} />
              {!collapsed && <span>{item.label}</span>}
              {item.badge && !collapsed && (
                <span className="ml-auto bg-teal-600 text-white rounded-full px-2 py-0.5 text-xs">
                  {item.badge}
                </span>
              )}
              {item.badge && collapsed && (
                <span className="absolute top-0 right-1 bg-teal-600 text-white rounded-full px-1.5 text-xs">
                  {item.badge}
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* User account section */}
      <div className="border-t p-3">
        {!collapsed ? (
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              {currentUser.name.charAt(0)}
            </div>
            <div className="ml-2 flex-1">
              <div className="text-sm font-medium">{currentUser.name}</div>
              <div className="text-xs text-gray-500 truncate">{currentUser.email}</div>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto">
              <CheckCircle className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              {currentUser.name.charAt(0)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}