// components/layout/Sidebar.tsx
// Navigation sidebar

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Building2,
  BarChart3,
  Settings,
  Building,
  Tags,
  CheckSquare,
} from 'lucide-react';

const navItems = [
  {
    title: 'לוח בקרה',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'הזמנות רכש',
    href: '/purchase-orders',
    icon: ShoppingCart,
  },
  {
    title: 'אישורים',
    href: '/approvals',
    icon: CheckSquare,
  },
  {
    title: 'קטלוג פריטים',
    href: '/admin/items',
    icon: Package,
    adminOnly: true,
  },
  {
    title: 'ספקים',
    href: '/admin/suppliers',
    icon: Building2,
    adminOnly: true,
  },
  {
    title: 'חברות',
    href: '/admin/companies',
    icon: Building,
    adminOnly: true,
  },
  {
    title: 'מאפיינים',
    href: '/admin/characters',
    icon: Tags,
    adminOnly: true,
  },
  {
    title: 'דוחות',
    href: '/reports',
    icon: BarChart3,
  },
  {
    title: 'ניהול משתמשים',
    href: '/admin/users',
    icon: Users,
    adminOnly: true,
  },
  {
    title: 'הגדרות',
    href: '/admin/settings',
    icon: Settings,
    adminOnly: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter((item) => {
    if (!item.adminOnly) return true; // Show non-admin items to all users

    // Only show admin items to ADMIN and SUPER_ADMIN roles
    return session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';
  });

  return (
    <aside className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-64 border-l bg-gray-50">
      <nav className="flex flex-col gap-1 p-4">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-gray-100 text-gray-700'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
