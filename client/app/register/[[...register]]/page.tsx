'use client';

import { SignUp } from '@clerk/nextjs';
import { SignupFormDemo } from '@/components/SignUpForm';

export default function RegisterPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <SignupFormDemo />
    </div>
  );
}