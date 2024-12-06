import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { SignOutButton, UserButton } from '@clerk/nextjs';

export async function User() {
  const { userId } = auth()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UserButton /> 
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuSeparator />
        {userId ? (
          <DropdownMenuItem>
            <SignOutButton>Logout</SignOutButton>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem>
            <Link href="/login">Login</Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
