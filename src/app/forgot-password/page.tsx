"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet, KeyRound, ArrowRight, CheckCircle2, Mail, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "code" | "reset" | "success">("email");
  const [companySlug, setCompanySlug] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/csrf", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken))
      .catch(() => {});
  }, []);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push("8 أحرف على الأقل");
    if (!/[A-Z]/.test(password)) errors.push("حرف كبير واحد");
    if (!/[a-z]/.test(password)) errors.push("حرف صغير واحد");
    if (!/[0-9]/.test(password)) errors.push("رقم واحد");
    return errors;
  };

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    setPasswordErrors(validatePassword(value));
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/tenant/forgot-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({ companySlug, email }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStep("code");
      } else {
        setError(data.error || "حدث خطأ، حاول مرة أخرى");
      }
    } catch {
      setError("حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/tenant/verify-reset-code", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({ companySlug, email, code }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStep("reset");
      } else {
        setError(data.error || "رمز التحقق غير صحيح");
      }
    } catch {
      setError("حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      setLoading(false);
      return;
    }

    const errors = validatePassword(newPassword);
    if (errors.length > 0) {
      setError("كلمة المرور لا تستوفي المتطلبات");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/tenant/reset-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({ companySlug, email, code, newPassword }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStep("success");
      } else {
        setError(data.error || "حدث خطأ، حاول مرة أخرى");
      }
    } catch {
      setError("حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950 flex items-center justify-center p-4 font-[family-name:var(--font-cairo)]" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="bg-primary p-2 rounded-xl">
              <Wallet className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary">محفظة</span>
          </Link>
        </div>

        <Card className="shadow-2xl border-none">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {step === "success" ? (
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              ) : (
                <KeyRound className="w-8 h-8 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {step === "email" && "استعادة كلمة المرور"}
              {step === "code" && "التحقق من الرمز"}
              {step === "reset" && "كلمة مرور جديدة"}
              {step === "success" && "تم بنجاح!"}
            </CardTitle>
            <CardDescription>
              {step === "email" && "أدخل بياناتك لإرسال رمز التحقق"}
              {step === "code" && "أدخل الرمز المرسل إلى بريدك"}
              {step === "reset" && "اختر كلمة مرور جديدة"}
              {step === "success" && "تم تغيير كلمة المرور بنجاح"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "email" && (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">معرف الشركة (Slug)</label>
                  <Input
                    value={companySlug}
                    onChange={(e) => setCompanySlug(e.target.value)}
                    placeholder="مثال: nile-trade"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">البريد الإلكتروني</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@company.com"
                    required
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</p>
                )}

                <Button type="submit" className="w-full h-12 text-lg" disabled={loading || !csrfToken}>
                  {loading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
                </Button>
              </form>
            )}

            {step === "code" && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center mb-4">
                  <Mail className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    تم إرسال رمز التحقق إلى بريدك الإلكتروني
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">رمز التحقق</label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="أدخل الرمز المكون من 6 أرقام"
                    className="text-center text-2xl tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</p>
                )}

                <Button type="submit" className="w-full h-12 text-lg" disabled={loading || code.length !== 6}>
                  {loading ? "جاري التحقق..." : "تحقق"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep("email")}
                >
                  العودة
                </Button>
              </form>
            )}

            {step === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">كلمة المرور الجديدة</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  {newPassword && passwordErrors.length > 0 && (
                    <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                      <div className="flex items-center gap-1 mb-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>يجب أن تحتوي على:</span>
                      </div>
                      <ul className="list-disc list-inside">
                        {passwordErrors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {newPassword && passwordErrors.length === 0 && (
                    <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded-lg flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>كلمة مرور قوية</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">تأكيد كلمة المرور</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">كلمتا المرور غير متطابقتين</p>
                  )}
                </div>

                {error && (
                  <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</p>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg" 
                  disabled={loading || passwordErrors.length > 0 || newPassword !== confirmPassword}
                >
                  {loading ? "جاري الحفظ..." : "حفظ كلمة المرور"}
                </Button>
              </form>
            )}

            {step === "success" && (
              <div className="text-center space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl">
                  <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <p className="text-green-700 dark:text-green-300">
                    تم تغيير كلمة المرور بنجاح!
                    <br />
                    يمكنك الآن تسجيل الدخول
                  </p>
                </div>
                <Link href="/login">
                  <Button className="w-full h-12 text-lg">
                    الذهاب لتسجيل الدخول
                  </Button>
                </Link>
              </div>
            )}

            {step !== "success" && (
              <div className="mt-6 text-center text-sm text-zinc-500">
                <Link href="/login" className="text-primary font-medium hover:underline">
                  العودة لتسجيل الدخول
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="text-zinc-500 hover:text-zinc-700 text-sm inline-flex items-center gap-1">
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
