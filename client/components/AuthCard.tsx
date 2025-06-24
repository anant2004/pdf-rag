"use client"

import { useState } from "react"
import { useSignIn } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { FcGoogle } from "react-icons/fc"
import { Label } from "@/components/ui/label"

export default function AuthCard() {
    const { signIn, setActive } = useSignIn()
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleGoogleSignIn = () => {
        signIn?.authenticateWithRedirect({
            strategy: "oauth_google",
            redirectUrl: "/sso-callback",           // this can be a dedicated route
            redirectUrlComplete: "/",               // this is where user lands after successful login
        })
    }

    const handleEmailSignIn = async () => {
        if (!signIn) {
            console.error("Clerk signIn object is not available yet.")
            return
        }

        try {
            const result = await signIn.create({
                identifier: email,
                password,
            })

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId })
                router.push("/")
            } else {
                console.error("Sign-in incomplete", result)
            }
        } catch (err: any) {
            alert(err.errors?.[0]?.message || "Sign-in failed")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0c0c0c] px-4">
            <Card className="w-full max-w-sm bg-[#1a1a1a] text-white border border-[#2a2a2a] shadow-xl">
                <CardHeader>
                    <CardTitle className="text-2xl">Create an account</CardTitle>
                    <CardDescription className="text-sm text-muted text-gray-400">
                        Enter your email below to create your account
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                            onClick={handleGoogleSignIn}
                            variant="outline"
                            className="w-full flex items-center justify-center gap-2 border border-gray-600 bg-black hover:bg-gray-900 text-white"
                        >
                            <FcGoogle className="h-4 w-4" />
                            Google
                        </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Separator className="flex-1 bg-gray-700" />
                        <span className="text-xs text-gray-400">OR CONTINUE WITH</span>
                        <Separator className="flex-1 bg-gray-700" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-[#0f0f0f] border border-gray-700 text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-white">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-[#0f0f0f] border border-gray-700 text-white"
                        />
                    </div>
                </CardContent>

                <CardFooter>
                    <Button
                        className="w-full bg-white text-black hover:bg-gray-200"
                        onClick={handleEmailSignIn}
                    >
                        Create account
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
