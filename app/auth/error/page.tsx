import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const params = await searchParams

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
              <CardTitle className="text-2xl">Authentication Error</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {params?.message ? (
                <p className="text-sm text-muted-foreground">{params.message}</p>
              ) : params?.error ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Error code: {params.error}</p>
                  {params.error === "access_denied" && (
                    <p className="text-sm text-yellow-600">
                      The email verification link may have expired. Please try signing up again or contact support.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">An unspecified error occurred.</p>
              )}

              <div className="flex flex-col gap-2">
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <Link href="/auth/login">Back to Sign In</Link>
                </Button>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/auth/sign-up">Create New Account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
