import { useState, useCallback, useMemo } from 'react';
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
  Printer,
  PrinterCheck,
  BrickWall,
  Sparkles,
} from 'lucide-react';
import { signOut, useSession } from '@/lib/authClient';
import { toast } from 'sonner';
import { LazyStore } from '@tauri-apps/plugin-store';
import { useNavigate } from 'react-router';
import { SidebarSkeletonEnhanced } from '../sidebar-skeleton';
import { useOrgStore } from '@/lib/tanstack-axios';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'inventory', label: 'Inventory', icon: Package2 },
  { id: 'discounts', label: 'Discounts', icon: Tag, badge: 8 },
  { id: 'orderingTable', label: 'Ordering table', icon: Utensils },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'orderLists', label: 'Order lists', icon: FileText, path: '/order-lists' },
  { id: 'printers', label: 'Printers', icon: PrinterCheck, path: '/printers' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  { id: 'receipt', label: 'Receipt', icon: FileText, path: '/receipt' },
  { id: 'sales', label: 'Sales', icon: BrickWall, path: '/sales' },
  { id: 'helpCenter', label: 'Help center', icon: HelpCircle },
] as const;

export function Sidebar() {
  const [activeItem, setActiveItem] = useState('orders');
  const [collapsed, setCollapsed] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const navigate = useNavigate();
  const { clear } = useOrgStore();

  const { data: session, isLoading } = useSession();
  const currentUser = session?.user;

  // Memoized user initials for better performance
  const userInitials = useMemo(() => {
    return currentUser?.name?.charAt(0)?.toUpperCase() || 'U';
  }, [currentUser?.name]);

  // Optimized logout handler with useCallback
  const handleLogout = useCallback(async () => {
    try {
      try {
        await signOut();
        const store = new LazyStore('.org-storage.dat');
        await store.reset();
        await store.save();
        clear();
        localStorage.removeItem('bearer_token');
        localStorage.removeItem('org-details');
      } catch (storeError) {
        console.warn('Failed to clear local storage:', storeError);
      }

      navigate('/login');
      toast.success('Logged out successfully');
      setLogoutDialogOpen(false);
      setUserDialogOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout Failed');
      setLogoutDialogOpen(false);
    }
  }, [navigate, clear]);

  // Optimized navigation handler
  const handleNavigation = useCallback(
    (item: (typeof sidebarItems)[number]) => {
      try {
        setActiveItem(item.id);
        if (item.path) {
          navigate(item.path);
        }
      } catch (error) {
        console.error('Navigation failed:', error);
        toast.error('Navigation failed');
      }
    },
    [navigate]
  );

  // Optimized collapse toggle
  const toggleCollapsed = useCallback(() => {
    setCollapsed(prev => !prev);
  }, []);

  if (isLoading) {
    return <SidebarSkeletonEnhanced collapsed={collapsed} />;
  }

  return (
    <div
      className={cn(
        'flex flex-col h-screen transition-all duration-500 ease-out',
        'bg-gradient-to-b from-slate-50 to-white',
        'border-r border-slate-200/60 backdrop-blur-sm',
        'shadow-xl shadow-slate-900/5',
        collapsed ? 'w-16' : 'w-[280px]'
      )}
    >
      {/* Header with enhanced logo */}
      <div className="flex items-center p-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
        <div className="relative group">
          <div
            className={cn(
              'bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl',
              'shadow-lg shadow-teal-500/25 transition-all duration-300',
              'group-hover:shadow-teal-500/40 group-hover:scale-105',
              collapsed ? 'p-2' : 'p-3'
            )}
          >
            <Utensils size={collapsed ? 16 : 20} className="drop-shadow-sm" />
          </div>
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm -z-10" />
        </div>

        {!collapsed && (
          <div className="ml-3 flex items-center gap-2">
            <div className="font-bold text-xl bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
              Dealio
            </div>
            <Sparkles className="h-4 w-4 text-teal-500" />
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className={cn('ml-auto hover:bg-slate-100 transition-all duration-200', 'hover:scale-105 active:scale-95')}
          onClick={toggleCollapsed}
        >
          <SidebarClose className={cn('h-4 w-4 transition-transform duration-300', collapsed ? 'rotate-180' : '')} />
        </Button>
      </div>

      {/* Enhanced restaurant info */}
      <div className="border-b border-slate-200/60 py-4 px-4 bg-gradient-to-r from-white to-slate-50/50">
        {!collapsed && (
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Current Branch</div>
        )}

        <div
          className={cn(
            'flex items-center rounded-lg transition-all duration-200',
            'hover:bg-white/60 p-2 -m-2',
            collapsed ? 'justify-center' : ''
          )}
        >
          {!collapsed ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <div className="font-semibold text-slate-700">Main Branch</div>
              </div>
              <div className="ml-auto text-slate-400 hover:text-slate-600 transition-colors">⋮</div>
            </>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center font-bold text-slate-600 text-sm">
              MB
            </div>
          )}
        </div>

        {!collapsed && <div className="text-xs text-slate-500 mt-1 ml-4">📍 Indah Kapuk Beach, Jakarta</div>}
      </div>

      {/* Enhanced navigation items */}
      <div className="flex-1 overflow-auto py-3 px-2">
        <div className="space-y-1">
          {sidebarItems.map(item => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            const isHovered = hoveredItem === item.id;

            return (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start transition-all duration-300 group relative overflow-hidden',
                    collapsed ? 'px-0 py-3' : 'px-3 py-3',
                    isActive && [
                      'bg-gradient-to-r from-teal-50 to-teal-100/50',
                      'text-teal-700 font-medium',
                      'shadow-sm border border-teal-200/50',
                    ],
                    !isActive && [
                      'hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100/50',
                      'hover:text-slate-700',
                    ]
                  )}
                  onClick={() => handleNavigation(item)}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-teal-500 to-teal-600 rounded-r-full" />
                  )}

                  <div className={cn('flex items-center w-full', collapsed ? 'justify-center' : 'gap-3')}>
                    <div
                      className={cn(
                        'relative transition-all duration-200',
                        isActive && 'text-teal-600',
                        isHovered && !isActive && 'scale-110'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {/* Subtle icon glow for active state */}
                      {isActive && <Icon className="h-5 w-5 absolute inset-0 text-teal-400 opacity-30 blur-sm" />}
                    </div>

                    {!collapsed && <span className="text-sm font-medium flex-1 text-left">{item.label}</span>}
                  </div>

                  {/* Enhanced badge */}
                  {item.badge && (
                    <div
                      className={cn(
                        'absolute transition-all duration-200',
                        collapsed ? 'top-1 right-1' : 'right-3 top-1/2 -translate-y-1/2'
                      )}
                    >
                      <div className="relative">
                        <span
                          className={cn(
                            'bg-gradient-to-r from-teal-500 to-teal-600 text-white',
                            'rounded-full text-xs font-bold shadow-lg',
                            'flex items-center justify-center min-w-[20px] h-5',
                            collapsed ? 'px-1.5' : 'px-2'
                          )}
                        >
                          {item.badge}
                        </span>
                        {/* Badge glow effect */}
                        <span className="absolute inset-0 bg-teal-400 rounded-full opacity-50 blur-sm animate-pulse" />
                      </div>
                    </div>
                  )}

                  {/* Hover effect overlay */}
                  <div
                    className={cn(
                      'absolute inset-0 opacity-0 transition-opacity duration-200',
                      'bg-gradient-to-r from-transparent via-white/10 to-transparent',
                      isHovered && !isActive && 'opacity-100'
                    )}
                  />
                </Button>

                {/* Tooltip for collapsed state */}
                {collapsed && isHovered && (
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50">
                    <div className="bg-slate-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                      {item.label}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced user account section */}
      {currentUser && (
        <div className="border-t border-slate-200/60 p-3 bg-gradient-to-r from-white to-slate-50/30">
          <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="w-full p-0 h-auto group">
                {!collapsed ? (
                  <div className="flex items-center w-full p-3 rounded-xl hover:bg-white/60 transition-all duration-200 group-hover:shadow-md">
                    <div className="relative">
                      <Avatar className="h-10 w-10 ring-2 ring-white shadow-lg">
                        <AvatarImage src={currentUser.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-teal-400 to-teal-600 text-white font-bold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      {/* Online status indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>

                    <div className="ml-3 flex-1 text-left">
                      <div className="text-sm font-semibold text-slate-700">{currentUser.name || 'Unknown User'}</div>
                      <div className="text-xs text-slate-500 truncate">{currentUser.email || 'No email'}</div>
                    </div>

                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-teal-500 transition-colors duration-200" />
                  </div>
                ) : (
                  <div className="flex justify-center p-2">
                    <div className="relative">
                      <Avatar className="h-10 w-10 ring-2 ring-white shadow-lg hover:scale-105 transition-transform duration-200">
                        <AvatarImage src={currentUser.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-teal-400 to-teal-600 text-white font-bold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                  </div>
                )}
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[450px] backdrop-blur-sm">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg">
                    <User className="h-5 w-5 text-teal-600" />
                  </div>
                  User Profile
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  View and manage your account information
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Enhanced user info */}
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-slate-50 to-teal-50/30 rounded-xl border border-slate-200/60">
                  <div className="relative">
                    <Avatar className="h-16 w-16 ring-4 ring-white shadow-xl">
                      <AvatarImage src={currentUser.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-teal-400 to-teal-600 text-white text-xl font-bold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-3 border-white rounded-full flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{currentUser.name || 'Unknown User'}</h3>
                    <p className="text-sm text-teal-600 font-medium">{currentUser.role || 'Manager'}</p>
                  </div>
                </div>

                <Separator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                {/* Enhanced contact info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <div className="w-1 h-4 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full" />
                    Contact Information
                  </h4>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-slate-50/50 rounded-lg hover:bg-slate-100/50 transition-colors">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Mail className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm text-slate-700">{currentUser.email || 'No email provided'}</span>
                    </div>

                    {currentUser.phone && (
                      <div className="flex items-center space-x-3 p-3 bg-slate-50/50 rounded-lg hover:bg-slate-100/50 transition-colors">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Phone className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-sm text-slate-700">{currentUser.phone}</span>
                      </div>
                    )}

                    {currentUser.location && (
                      <div className="flex items-center space-x-3 p-3 bg-slate-50/50 rounded-lg hover:bg-slate-100/50 transition-colors">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <MapPin className="h-4 w-4 text-purple-600" />
                        </div>
                        <span className="text-sm text-slate-700">{currentUser.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                {/* Enhanced account details */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <div className="w-1 h-4 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full" />
                    Account Details
                  </h4>

                  <div className="space-y-3">
                    {currentUser.joinedAt && (
                      <div className="flex items-center space-x-3 p-3 bg-slate-50/50 rounded-lg">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Calendar className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 block">Member since</span>
                          <span className="text-sm font-medium text-slate-700">
                            {(() => {
                              try {
                                return formatDate(currentUser.joinedAt);
                              } catch (error) {
                                console.warn('Date formatting failed:', error);
                                return 'Invalid date';
                              }
                            })()}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3 p-3 bg-emerald-50/50 rounded-lg border border-emerald-200/50">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span className="text-sm font-medium text-emerald-700">Account Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex justify-between gap-3">
                <Button variant="outline" onClick={() => setUserDialogOpen(false)} className="flex-1">
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setLogoutDialogOpen(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/25 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Enhanced logout dialog */}
          <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
            <AlertDialogContent className="backdrop-blur-sm">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-br from-red-100 to-red-200 rounded-lg">
                    <LogOut className="h-5 w-5 text-red-600" />
                  </div>
                  Sign Out Confirmation
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-600">
                  Are you sure you want to sign out? You'll need to sign in again to access your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-3">
                <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLogout}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/25 transition-all duration-200"
                >
                  Sign Out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
