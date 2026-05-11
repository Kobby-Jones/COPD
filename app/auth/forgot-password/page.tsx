"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Wind, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/api";
import Link from "next/link";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    await authService.forgotPassword(data.email);
    setIsLoading(false);
    setSent(true);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="prediction-gradient p-8 text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-lg">PneumaAI</div>
              <div className="text-blue-200 text-xs">COPD Prediction System</div>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-1">Reset password</h1>
          <p className="text-blue-200 text-sm">Enter your email to receive a reset link</p>
        </div>

        <div className="p-8">
          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 text-lg mb-2">Check your inbox</h3>
              <p className="text-gray-500 text-sm mb-6">We sent a password reset link to <strong>{getValues("email")}</strong></p>
              <Link href="/auth/login">
                <Button variant="outline" className="w-full"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In</Button>
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input id="email" type="email" placeholder="dr.smith@hospital.org" {...register("email")} className="pl-10" />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-11 bg-clinical-blue hover:bg-[#1557A0]">
                {isLoading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Sending...</span> : "Send Reset Link"}
              </Button>
              <Link href="/auth/login">
                <Button type="button" variant="ghost" className="w-full text-gray-500">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
                </Button>
              </Link>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
}
