'use client';

import * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  SidebarMenuBadge,
} from './ui/sidebar';

import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription, SheetClose } from './ui/sheet';
import { Button } from './ui/button';
import { useBusinessConfig } from '@/lib/business-config-manager';
import {
  LayoutDashboard,
  Users,
  Box,
  CreditCard,
  Settings,
  CircleHelp,
  LogOut,
  ChevronRight,
  User,
  ShoppingBag,
  Store,
  Book,
  Soup,
  Shirt,
  Microwave,
  FlaskConical,
  Store as StoreIcon,
  ShoppingBasket,
  PanelLeft,
  PenTool,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';

// Define the menu items based on business type
const baseMenuItems = {
  dashboard: {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  orders: {
    label: 'Orders',
    href: '/orders',
    icon: ShoppingBag,
  },
  products: {
    label: 'Products',
    href: '/products',
    icon: Box,
  },
  customers: {
    label: 'Customers',
    href: '/customers',
    icon: Users,
  },
  payments: {
    label: 'Payments',
    href: '/payments',
    icon: CreditCard,
  },
  reports: {
    label: 'Reports',
    href: '/reports',
    icon: Book,
  },
  settings: {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  help: {
    label: 'Help',
    href: '/help',
    icon: CircleHelp,
  },
  inventory: {
    label: 'Inventory',
    href: '/inventory',
    icon: StoreIcon,
  },
};

const businessSpecificMenuItems = {
  restaurant: [
    baseMenuItems.dashboard,
    baseMenuItems.orders,
    baseMenuItems.products,
    baseMenuItems.customers,
    baseMenuItems.payments,
    { label: 'Menu Items', href: '/menu', icon: Soup },
    baseMenuItems.reports,
    baseMenuItems.settings,
  ],
  bookshop: [
    baseMenuItems.dashboard,
    baseMenuItems.orders,
    baseMenuItems.products,
    baseMenuItems.customers,
    baseMenuItems.payments,
    { label: 'Book Catalog', href: '/books', icon: Book },
    baseMenuItems.inventory,
    baseMenuItems.reports,
    baseMenuItems.settings,
  ],
  hardware: [
    baseMenuItems.dashboard,
    baseMenuItems.orders,
    baseMenuItems.products,
    baseMenuItems.customers,
    baseMenuItems.payments,
    { label: 'Tools & Materials', href: '/materials', icon: PenTool },
    baseMenuItems.inventory,
    baseMenuItems.reports,
    baseMenuItems.settings,
  ],
  supermarket: [
    baseMenuItems.dashboard,
    baseMenuItems.orders,
    baseMenuItems.products,
    baseMenuItems.customers,
    baseMenuItems.payments,
    baseMenuItems.inventory,
    { label: 'Grocery Items', href: '/grocery', icon: ShoppingBasket },
    baseMenuItems.reports,
    baseMenuItems.settings,
  ],
  pharmacy: [
    baseMenuItems.dashboard,
    baseMenuItems.orders,
    baseMenuItems.products,
    baseMenuItems.customers,
    baseMenuItems.payments,
    { label: 'Medication', href: '/medication', icon: FlaskConical },
    baseMenuItems.inventory,
    baseMenuItems.reports,
    baseMenuItems.settings,
  ],
  electronics: [
    baseMenuItems.dashboard,
    baseMenuItems.orders,
    baseMenuItems.products,
    baseMenuItems.customers,
    baseMenuItems.payments,
    { label: 'Electronics Catalog', href: '/electronics', icon: Microwave },
    baseMenuItems.inventory,
    baseMenuItems.reports,
    baseMenuItems.settings,
  ],
  clothing: [
    baseMenuItems.dashboard,
    baseMenuItems.orders,
    baseMenuItems.products,
    baseMenuItems.customers,
    baseMenuItems.payments,
    { label: 'Apparel', href: '/apparel', icon: Shirt },
    baseMenuItems.inventory,
    baseMenuItems.reports,
    baseMenuItems.settings,
  ],
  cafe: [
    baseMenuItems.dashboard,
    baseMenuItems.orders,
    baseMenuItems.products,
    baseMenuItems.customers,
    baseMenuItems.payments,
    { label: 'Menu Items', href: '/menu', icon: Soup },
    baseMenuItems.reports,
    baseMenuItems.settings,
  ],
  retail: [
    baseMenuItems.dashboard,
    baseMenuItems.orders,
    baseMenuItems.products,
    baseMenuItems.customers,
    baseMenuItems.payments,
    baseMenuItems.inventory,
    baseMenuItems.reports,
    baseMenuItems.settings,
  ],
};

const UserProfileDialog = React.memo(({ isOpen, onOpenChange, user, onLogout }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>Manage your profile settings and information.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-4 py-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h3 className="text-lg font-semibold">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {user.role && <Badge className="bg-blue-600 text-white hover:bg-blue-700">{user.role}</Badge>}
            {user.subscription && (
              <Badge className="bg-green-600 text-white hover:bg-green-700">{user.subscription}</Badge>
            )}
          </div>
        </div>
        <Separator className="my-2" />
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="loyalty">Loyalty Program</Label>
            <Switch id="loyalty" defaultChecked={user.loyaltyEnabled} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications">Email Notifications</Label>
            <Switch id="notifications" defaultChecked={user.notificationsEnabled} />
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <Button variant="outline" className="bg-slate-500 text-white hover:bg-slate-600">
            Edit Profile
          </Button>
          <Button variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={onLogout}>
            Log out
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

UserProfileDialog.displayName = 'UserProfileDialog';

const BusinessConfigSidebar = () => {
  const { businessType, availableBusinessTypes, setBusinessType } = useBusinessConfig();
  const [activePath, setActivePath] = React.useState('/dashboard');
  const [isUserModalOpen, setIsUserModalOpen] = React.useState(false);

  // Example user data
  const currentUser = {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2864&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    role: 'Manager',
    subscription: 'Pro Plan',
    loyaltyEnabled: true,
    notificationsEnabled: false,
  };

  const handleBusinessTypeChange = newType => {
    setBusinessType(newType);
    // You might want to navigate to the dashboard or a default page after changing business type
    setActivePath('/dashboard');
  };

  const handleLogout = () => {
    // Implement your logout logic here
    console.log('Logging out...');
    setIsUserModalOpen(false);
  };

  const menuItems = businessSpecificMenuItems[businessType] || Object.values(baseMenuItems);

  return (
    <SidebarProvider>
      <div className="flex">
        <Sidebar>
          <SidebarHeader className="flex flex-col items-center">
            <Avatar className="h-10 w-10 cursor-pointer" onClick={() => setIsUserModalOpen(true)}>
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="text-lg font-bold truncate mt-2">
              {businessType.charAt(0).toUpperCase() + businessType.slice(1)} POS
            </span>
            <span className="text-xs text-muted-foreground">{currentUser.name}</span>
            <Separator className="mt-2" />
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = item.href === activePath;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      href={item.href}
                      isActive={isActive}
                      onClick={() => setActivePath(item.href)}
                      tooltip={item.label}
                    >
                      <Icon className="size-5" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter>
            <Separator />
            <div className="p-2">
              <Select onValueChange={handleBusinessTypeChange} defaultValue={businessType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Business Type</SelectLabel>
                    {availableBusinessTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setIsUserModalOpen(true)}>
                <User className="size-5" />
                <span>My Profile</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                <LogOut className="size-5" />
                <span>Log Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarFooter>
        </Sidebar>

        {/* User Profile Modal */}
        <UserProfileDialog
          isOpen={isUserModalOpen}
          onOpenChange={setIsUserModalOpen}
          user={currentUser}
          onLogout={handleLogout}
        />

        {/* Main content area */}
        <main className="flex-1 p-4 overflow-auto">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <PanelLeft />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="sm:max-w-xs p-0">
                <nav className="grid gap-6 text-lg font-medium">
                  {/* Mobile sidebar content goes here, mirroring the main sidebar */}
                </nav>
              </SheetContent>
            </Sheet>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
          </div>
          {/* Add a router outlet or children prop to render the main content */}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default BusinessConfigSidebar;
