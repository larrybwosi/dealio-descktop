import { useState } from 'react';
import { cn, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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
  CheckCircle,
  SidebarClose,
  LogOut,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useSession } from '@/providers/session';
import { signOut } from '@/lib/authClient';
import { toast } from 'sonner';
import { LazyStore } from '@tauri-apps/plugin-store';

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
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const { session, isLoading, logout } = useSession();
  const currentUser = session?.user;

  const handleLogout = async () => {
    try {
      await signOut();
      logout(); 
      const store =  new LazyStore('.dealio-org-storage.dat') 
      await store.reset(); // Clear the Zustand store
      toast.success('Logged out successfully');
      setLogoutDialogOpen(false);
      setUserDialogOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout Failed');
    }
  };
  

  if (isLoading || !currentUser) {
    return null;
  }

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
        {!collapsed && <div className="ml-2 font-bold text-lg">Dealio ™</div>}
        <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setCollapsed(!collapsed)}>
          <SidebarClose className={cn('h-4 w-4 transition-all', collapsed ? '-rotate-180' : '')} />
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
              variant={activeItem === item.id ? 'secondary' : 'ghost'}
              className={cn('w-full justify-start mb-1 relative', collapsed ? 'px-0' : '')}
              onClick={() => setActiveItem(item.id)}
            >
              <Icon className={cn('h-4 w-4', collapsed ? 'mx-auto' : 'mr-2')} />
              {!collapsed && <span>{item.label}</span>}
              {item.badge && !collapsed && (
                <span className="ml-auto bg-teal-600 text-white rounded-full px-2 py-0.5 text-xs">{item.badge}</span>
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
        <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" className="w-full p-0 h-auto">
              {!collapsed ? (
                <div className="flex items-center w-full p-2 rounded hover:bg-gray-50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback className="bg-gray-200">{currentUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="ml-2 flex-1 text-left">
                    <div className="text-sm font-medium">{currentUser.name}</div>
                    <div className="text-xs text-gray-500 truncate">{currentUser.email}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              ) : (
                <div className="flex justify-center p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback className="bg-gray-200">{currentUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
              )}
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Profile
              </DialogTitle>
              <DialogDescription>View and manage your account information</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* User Avatar and Basic Info */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback className="bg-teal-100 text-teal-700 text-xl">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{currentUser.name}</h3>
                  <p className="text-sm text-gray-500">{currentUser.role || 'Manager'}</p>
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Contact Information</h4>

                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{currentUser.email}</span>
                </div>

                {currentUser.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{currentUser.phone}</span>
                  </div>
                )}

                {currentUser.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{currentUser.location}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Account Details */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Account Details</h4>

                {currentUser.joinedAt && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Joined on </span>
                      <span className="text-sm">{formatDate(currentUser.joinedAt)}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Account Verified</span>
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={() => setLogoutDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Logout Confirmation Dialog */}
        <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign Out Confirmation</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to sign out? You'll need to sign in again to access your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
                Sign Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
