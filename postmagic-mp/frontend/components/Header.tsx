"use client";

import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function Header() {
  const { user, isLoaded } = useUser();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          PostMagic
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-8">
          {/* Menu */}
          <div className="flex gap-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition">
              Início
            </Link>
            {isLoaded && user && (
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition">
                Dashboard
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {isLoaded ? (
              user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Olá, <strong>{user.firstName}</strong>
                  </span>
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10",
                      },
                    }}
                  />
                </div>
              ) : (
                <SignInButton
                  mode="modal"
                  fallbackRedirectUrl="/dashboard"
                  signUpFallbackRedirectUrl="/dashboard"
                >
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                    Entrar
                  </button>
                </SignInButton>
              )
            ) : (
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          {isLoaded && user ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
              <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold">
                Entrar
              </button>
            </SignInButton>
          )}
        </div>
      </nav>
    </header>
  );
}
