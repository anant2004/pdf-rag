'use client';

import { SignIn } from '@clerk/nextjs';
import { SigninFormDemo } from '@/components/SignInForm';

export default function SignInPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <SigninFormDemo/>
    </div>
  );
}