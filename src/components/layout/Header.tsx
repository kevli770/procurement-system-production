// components/layout/Header.tsx
// Top header with user info and logout

'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">מערכת רכש</h1>
        </div>

        <div className="flex items-center gap-4">
          {session?.user && (
            <>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span className="font-medium">{session.user.name}</span>
                <span className="text-gray-500">({session.user.role})</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                <LogOut className="h-4 w-4 ml-2" />
                התנתק
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
