import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-green-600">Healthyduck</h1>
            <p className="text-sm text-muted-foreground mt-1">Your fitness data, your way</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Welcome to Healthyduck!</CardTitle>
              <CardDescription className="text-center">Please check your email to verify your account</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                We&apos;ve sent you a verification email. Please click the link in the email to activate your account
                and start tracking your fitness data.
              </p>
              <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                <Link href="/auth/login">Back to Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
