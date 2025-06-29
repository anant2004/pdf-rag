"use client";

import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";

export function NavbarDemo() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isSignedIn } = useUser();

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          {/* No NavItems */}
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <UserButton/>
            ) : (
              <>
                <NavbarButton variant="primary" href="/login">Sign In</NavbarButton>
                <NavbarButton variant="primary" href="/register">Sign Up</NavbarButton>
              </>
            )}
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {isSignedIn ? (
              <div className="flex items-center px-4 py-2">
                <img
                  src={user.imageUrl}
                  alt="User"
                  className="h-10 w-10 rounded-full"
                />
                <div className="ml-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {user.fullName || user.username || "Account"}
                </div>
              </div>
            ) : (
              <div className="flex w-full flex-col gap-4 px-4 py-2">
                <NavbarButton
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="primary"
                  className="w-full"
                  href="/login"
                >
                  Sign In
                </NavbarButton>
                <NavbarButton
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="primary"
                  className="w-full"
                  href="/register"
                >
                  Sign Up
                </NavbarButton>
              </div>
            )}
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
