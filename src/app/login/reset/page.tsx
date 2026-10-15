
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "이메일 발송 완료",
        description: "비밀번호 재설정 링크가 포함된 이메일을 발송했습니다. 받은편지함을 확인해주세요.",
      });
      setSent(true);
    } catch (error: any) {
      console.error("비밀번호 재설정 오류:", error);
      toast({
        variant: "destructive",
        title: "이메일 발송 실패",
        description: error.code === 'auth/user-not-found' 
          ? "가입되지 않은 이메일입니다." 
          : (error.message || "오류가 발생했습니다. 다시 시도해 주세요."),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-12">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleReset}>
          <CardHeader>
            <CardTitle className="text-2xl">비밀번호 재설정</CardTitle>
            <CardDescription>
              가입하신 이메일 주소를 입력하시면, 비밀번호 재설정 링크를 보내드립니다.
            </CardDescription>
          </CardHeader>
          {sent ? (
            <CardContent>
              <div className="text-center p-4 bg-secondary rounded-md">
                <p className="text-sm text-secondary-foreground">이메일을 성공적으로 보냈습니다. 받은 편지함을 확인하여 비밀번호를 재설정하세요.</p>
              </div>
            </CardContent>
          ) : (
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">이메일</Label>
                <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </CardContent>
          )}
          <CardFooter className="flex flex-col gap-4">
            {!sent && (
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                재설정 이메일 보내기
              </Button>
            )}
            <Button variant="ghost" asChild className="w-full">
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                로그인으로 돌아가기
              </Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
