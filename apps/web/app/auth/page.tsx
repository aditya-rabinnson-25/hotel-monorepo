"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaApple } from "react-icons/fa";
import { SiTesla, SiTcs, SiInfosys } from "react-icons/si";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

type PageMode =
  | "login"
  | "signup"
  | "verifyEmail"
  | "forgotPassword"
  | "resetPassword";

export default function AuthPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  // ---------- UI / page state ----------
  const [currentPage, setCurrentPage] = useState<PageMode>("login");

  // forms
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    captcha: "",
  });
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [verifyData, setVerifyData] = useState({ confirmationCode: "" });
  const [resetData, setResetData] = useState({
    email: "",
    confirmationCode: "",
    newPassword: "",
  });

  // ui state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [captchaCode, setCaptchaCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // dynamic visuals
  const [dynamicText, setDynamicText] = useState("");
  const [dynamicLogo, setDynamicLogo] = useState<React.ReactNode>(null);
  const [dynamicImage, setDynamicImage] = useState("");

  // refs
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const captchaRef = useRef<HTMLInputElement | null>(null);

  // arrays for dynamic visuals
  const dynamicTexts = [
    "sysmind",
    "Consysmind",
    "Rabinnson",
    "Tesla",
    "Dettol",
    "Workforce",
    "Citi",
    "Prabulu",
  ];

  const companyLogos = [
    { icon: <SiTcs className="w-full h-full text-[#0047ab]" />, name: "TCS" },
    { icon: <FaApple className="w-full h-full text-black" />, name: "Apple" },
    { icon: <SiTesla className="w-full h-full text-[#cc0000]" />, name: "Tesla" },
    { icon: <SiInfosys className="w-full h-full text-[#007cc3]" />, name: "Infosys" },
  ];

  const dynamicImages = [
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2069&q=80",
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=2070&q=80",
  ];

  // ---------- Helpers / validators ----------
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < 5; i++) out += chars[Math.floor(Math.random() * chars.length)];
    setCaptchaCode(out);
    setLoginData((p) => ({ ...p, captcha: "" }));
    setErrors((p) => ({ ...p, captcha: "" }));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Please enter a valid username or work email address.";
    if (!emailRegex.test(email)) return "Please enter a valid email address.";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Please enter your password.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return "";
  };

  const validateSignupPassword = (password: string) => {
    if (!password) return "Please enter your password.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return "Password must contain uppercase, lowercase, and number.";
    }
    return "";
  };

  const validateConfirmPassword = (password: string, confirmPassword: string) => {
    if (!confirmPassword) return "Please confirm your password.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return "";
  };

  const validateCaptcha = (captcha: string) => {
    if (!captcha) return "Please enter the captcha.";
    if (captcha !== captcha.toUpperCase()) return "Captcha must be uppercase ";
    if (captcha.toUpperCase() !== captchaCode) return "Captcha does not match.";
    return "";
  };

  const validateCode6 = (code: string) => {
    if (!code) return "Please enter the verification code.";
    if (code.length !== 6) return "Verification code must be 6 digits.";
    return "";
  };

  // dynamic visuals rotator
  const startDynamicContent = () => {
    let textIndex = 0, logoIndex = 0, imageIndex = 0;
    setDynamicText(dynamicTexts[textIndex]);
    setDynamicLogo(companyLogos[logoIndex].icon);
    setDynamicImage(dynamicImages[imageIndex]);

    const textInterval = setInterval(() => {
      textIndex = (textIndex + 1) % dynamicTexts.length;
      setDynamicText(dynamicTexts[textIndex]);
    }, 3000);

    const logoInterval = setInterval(() => {
      logoIndex = (logoIndex + 1) % companyLogos.length;
      setDynamicLogo(companyLogos[logoIndex].icon);
    }, 2500);

    const imageInterval = setInterval(() => {
      imageIndex = (imageIndex + 1) % dynamicImages.length;
      setDynamicImage(dynamicImages[imageIndex]);
    }, 4000);

    return () => {
      clearInterval(textInterval);
      clearInterval(logoInterval);
      clearInterval(imageInterval);
    };
  };

  useEffect(() => {
    generateCaptcha();
    const stop = startDynamicContent();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inputStateClasses = (field: string, formData: any) => {
    const base =
      "w-full h-[48px] px-[12px] py-[10px] md:h-[52px] md:px-[14px] md:py-[12px] border rounded-md text-[14px] outline-none bg-white transition-all duration-300";
    const touchedField = touched[field];
    const hasError = !!errors[field];
    const hasValue = !!formData[field];

    if (touchedField && hasError)
      return `${base} border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.15)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.25)] focus:border-red-500`;
    if (touchedField && !hasError && hasValue)
      return `${base} border-emerald-500 focus:border-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]`;
    return `${base} border-gray-200 focus:border-[#516cc6] focus:shadow-[0_0_0_3px_rgba(81,108,198,0.15)]`;
  };

  // handle form changes
  const handleLoginChange = (field: string, value: string) => {
    setLoginData((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };
  const handleSignupChange = (field: string, value: string) => {
    setSignupData((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };
  const handleVerifyChange = (field: string, value: string) => {
    setVerifyData((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };
  const handleResetChange = (field: string, value: string) => {
    setResetData((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  // ---------- IMPORTANT: On mount, check server-side session (covers Google OAuth redirect to /auth) ----------
  useEffect(() => {
  let cancelled = false;

  (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/get-session`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = await res.json();
      const token = data?.data?.session?.token;

      if (token && !cancelled) {
        sessionStorage.setItem("access_token", token);
        router.replace("/dashboard");
      }
    } catch (e) {
      console.log("Session check failed:", e);
    }
  })();

  return () => {
    cancelled = true;
  };
}, []);



    /* ===========================================================
      LOGIN SUBMIT HANDLER
  =========================================================== */
  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();

    const emailError = validateEmail(loginData.email);
    const passwordError = validatePassword(loginData.password);
    const captchaError = validateCaptcha(loginData.captcha);

    const newErrors: any = {
      email: emailError,
      password: passwordError,
      captcha: captchaError,
    };

    setErrors(newErrors);
    setTouched({
      email: true,
      password: true,
      captcha: true,
    });

    if (emailError || passwordError || captchaError) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signIn.email(
        {
          email: loginData.email,
          password: loginData.password,
        },
        { fetchOptions: { credentials: "include" } } as any
      );

      // SUCCESSFUL LOGIN
      if ("data" in result) {
        const token = result.data?.session?.token;
        if (token) sessionStorage.setItem("access_token", token);

        setSuccess("Logged in successfully!");
        setTimeout(() => router.replace("/dashboard"), 250);
        return;
      }

      // LOGIN ERROR
      if ("error" in result) {
        const errorObj = result.error as { message?: string };
        throw new Error(errorObj.message || "Invalid credentials");
      }

      // Unexpected fallback
      throw new Error("Unexpected login error");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ===========================================================
      GOOGLE LOGIN HANDLER
  =========================================================== */
  async function handleGoogleLogin() {
  setIsLoading(true);
  window.location.href = `${API_BASE}/api/auth/google/login`;
}

  /* ===========================================================
      SIGN-UP SUBMIT HANDLER
  =========================================================== */
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailErr = validateEmail(signupData.email);
    const pwErr = validateSignupPassword(signupData.password);
    const cpwErr = validateConfirmPassword(
      signupData.password,
      signupData.confirmPassword
    );

    setErrors({
      email: emailErr,
      password: pwErr,
      confirmPassword: cpwErr,
    });

    if (emailErr || pwErr || cpwErr) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    // Simulated success
    setSuccess("Account created! Please verify your email.");
    setCurrentPage("verifyEmail");
  };

  /* ===========================================================
      EMAIL VERIFICATION SUBMIT HANDLER
  =========================================================== */
  const handleVerifyEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const codeErr = validateCode6(verifyData.confirmationCode);
    setErrors({ confirmationCode: codeErr });

    if (codeErr) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setSuccess("Email verified! You may now login.");
    setTimeout(() => {
      setCurrentPage("login");
      setSuccess(null);
    }, 1500);
  };

  /* ===========================================================
      FORGOT PASSWORD SUBMIT
  =========================================================== */
  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailErr = validateEmail(resetData.email);
    setErrors({ email: emailErr });

    if (emailErr) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setSuccess("Reset code sent! Check your email.");
    setCurrentPage("resetPassword");
  };

  /* ===========================================================
      RESET PASSWORD SUBMIT
  =========================================================== */
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const codeErr = validateCode6(resetData.confirmationCode);
    const pwErr = validateSignupPassword(resetData.newPassword);

    setErrors({ confirmationCode: codeErr, newPassword: pwErr });

    if (codeErr || pwErr) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setSuccess("Password reset successful!");
    setTimeout(() => {
      setCurrentPage("login");
      setSuccess(null);
    }, 1200);
  };

  /* ===========================================================
      RENDER PAGE TITLE
  =========================================================== */
  const renderPageTitle = () => {
    switch (currentPage) {
      case "signup":
        return "Create Account";
      case "verifyEmail":
        return "Verify Your Email";
      case "forgotPassword":
        return "Reset Password";
      case "resetPassword":
        return "Set New Password";
      default:
        return "Login to";
    }
  };

  /* ===========================================================
      RENDER PAGE SUBTITLE
  =========================================================== */
  const renderPageSubtitle = () => {
    switch (currentPage) {
      case "signup":
        return "Get started with your free account";
      case "verifyEmail":
        return `We sent a verification code to ${signupData.email}`;
      case "forgotPassword":
        return "Enter your email to receive a reset code";
      case "resetPassword":
        return `Enter the code sent to ${resetData.email}`;
      default:
        return null;
    }
  };

    /* ===========================================================
      RETURN — FULL AUTH PAGE UI
  =========================================================== */

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row md:items-start md:justify-end px-2 sm:px-4 pt-6 pb-10 overflow-hidden">

      {/* 🟦 GLOBAL LOADING OVERLAY */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-700">Processing...</p>
          </div>
        </div>
      )}

      {/* 🟥 ERROR MESSAGE */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 max-w-md">
          {error}
          <button onClick={() => setError(null)} className="float-right font-bold ml-4">×</button>
        </div>
      )}

      {/* 🟩 SUCCESS MESSAGE */}
      {success && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50 max-w-md">
          {success}
          <button onClick={() => setSuccess(null)} className="float-right font-bold ml-4">×</button>
        </div>
      )}

      {/* =============================
          LEFT SIDE VISUAL SECTION
      ============================== */}
      <div className="hidden md:flex flex-1 md:flex-[2] flex-col bg-[#f8f9fa]">
        {/* Top logo section */}
        <div className="flex justify-start items-center py-8 px-4 md:py-12 md:px-8 bg-white border-b border-[#e9ecef] min-h-[150px]">
          <div className="text-4xl md:text-6xl animate-[float_3s_ease-in-out_infinite]">
            {dynamicLogo}
          </div>
        </div>

        {/* Background rotating images */}
        <div
          className="flex flex-1 bg-cover bg-center items-center justify-center -mt-16 -ml-32 relative"
          style={{ backgroundImage: `url(${dynamicImage})` }}
        >
          <div className="text-center text-white bg-black/60 px-12 py-8 rounded-lg">
            <h2 className="text-[2.5rem] font-semibold mb-4">Welcome</h2>
            <p className="text-[1.2rem] opacity-90 m-0">Glad you&apos;re here!</p>
          </div>
        </div>
      </div>

      {/* =============================
          RIGHT SIDE — AUTH FORMS
      ============================== */}
      <div className="w-full md:flex-[1] flex justify-center items-center p-2 sm:p-4 md:p-8 bg-white relative mt-7">

        {/* floating logo (desktop) */}
        <div className="hidden md:flex absolute top-8 right-8 w-[160px] h-[42px] items-center justify-end">
          <div className="text-[2rem] animate-[float_3s_ease-in-out_infinite]">
            {dynamicLogo}
          </div>
        </div>

        <main
          aria-label="Authentication"
          className={`w-full max-w-[500px] mx-auto ${
            shake ? "animate-[shake_0.5s_ease-in-out]" : ""
          }`}
        >
          {/* mobile logo */}
          <div className="md:hidden w-full flex justify-center mb-4">
            <div className="text-[1.5rem] animate-[float_3s_ease-in-out_infinite]">
              {dynamicLogo}
            </div>
          </div>

          {/* Auth Card */}
          <section className="mt-1 p-4 md:p-6 bg-white rounded-xl">

            {/* Title */}
            <h1 className="text-[22px] font-bold flex items-center justify-center md:justify-start mb-1">
              {renderPageTitle()}
              <span
                className="ml-2 bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(45deg,#1f6fd8,#3aa655)" }}
              >
                {currentPage === "login" ? dynamicText : ""}
              </span>
            </h1>

            {/* Subtitle */}
            {renderPageSubtitle() && (
              <p className="text-[14px] text-gray-600 mb-4 text-center md:text-left">
                {renderPageSubtitle()}
              </p>
            )}

            {/* ===========================================================
                LOGIN FORM
            =========================================================== */}
            {currentPage === "login" && (
              <form onSubmit={handleLoginSubmit}>

                {/* GOOGLE LOGIN BUTTON */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full h-11 flex items-center justify-center gap-3 border border-gray-300 rounded-md bg-white hover:bg-gray-100 text-[15px] font-medium"
                >
                  <img
                    src="https://developers.google.com/identity/images/g-logo.png"
                    className="w-5 h-5"
                  />
                  Continue with Google
                </button>

                {/* Email */}
                <div className="mt-3">
                  <input
                    ref={emailRef}
                    type="email"
                    placeholder="Email"
                    value={loginData.email}
                    onChange={(e) => handleLoginChange("email", e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, email: true }))} 
                    disabled={isSubmitting}
                    className={inputStateClasses("email", loginData)}
                  />
                  {errors.email && (
                    <div className="mt-[6px] text-[12px] text-red-500">{errors.email}</div>
                  )}
                </div>

                {/* Password */}
                <div className="mt-3">
                  <input
                    ref={passwordRef}
                    type="password"
                    placeholder="Password"
                    value={loginData.password}
                    onChange={(e) => handleLoginChange("password", e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, password: true }))} 
                    disabled={isSubmitting}
                    className={inputStateClasses("password", loginData)}
                  />
                  {errors.password && (
                    <div className="mt-[6px] text-[12px] text-red-500">{errors.password}</div>
                  )}
                </div>

                {/* CAPTCHA */}
                <div className="mt-3">
                  <div className="flex gap-3 items-center">

                    {/* captcha code */}
                    <div className="h-[52px] min-w-[110px] border border-gray-200 rounded-md bg-white flex items-center justify-center font-mono text-[22px] font-bold tracking-wider text-[#3aa655]">
                      {captchaCode}
                    </div>

                    {/* refresh button */}
                    <button
                      type="button"
                      onClick={generateCaptcha}
                      className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center bg-white hover:bg-gray-100"
                    >
                      ⟳
                    </button>

                    {/* captcha input */}
                    <input
                      ref={captchaRef}
                      type="text"
                      placeholder="Captcha"
                      value={loginData.captcha}
                      onChange={(e) => handleLoginChange("captcha", e.target.value)}
                      onBlur={() => setTouched((p) => ({ ...p, captcha: true }))} 
                      disabled={isSubmitting}
                      className={`flex-1 ${inputStateClasses("captcha", loginData)}`}
                    />
                  </div>

                  {errors.captcha && (
                    <div className="mt-[6px] text-[12px] text-red-500">{errors.captcha}</div>
                  )}
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full h-12 mt-4 rounded-md text-white font-semibold ${
                    isSubmitting
                      ? "bg-blue-600 opacity-70"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isSubmitting ? "Logging in…" : "Login"}
                </button>

                {/* Links */}
                <div className="mt-3 text-[14px] flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentPage("forgotPassword")}
                    className="text-blue-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage("signup")}
                    className="text-blue-600 hover:underline"
                  >
                    Create account
                  </button>
                </div>
              </form>
            )}

            {/* ===========================================================
                SIGN-UP FORM
            =========================================================== */}
            {currentPage === "signup" && (
              <form onSubmit={handleSignupSubmit}>
                <div className="mt-3">
                  <input
                    type="email"
                    placeholder="Email"
                    value={signupData.email}
                    onChange={(e) => handleSignupChange("email", e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, email: true }))} 
                    className={inputStateClasses("email", signupData)}
                  />
                  {errors.email && <div className="mt-[6px] text-red-500 text-[12px]">{errors.email}</div>}
                </div>

                <div className="mt-3">
                  <input
                    type="password"
                    placeholder="Password"
                    value={signupData.password}
                    onChange={(e) => handleSignupChange("password", e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, password: true }))} 
                    className={inputStateClasses("password", signupData)}
                  />
                  {errors.password && <div className="mt-[6px] text-red-500 text-[12px]">{errors.password}</div>}
                </div>

                <div className="mt-3">
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={signupData.confirmPassword}
                    onChange={(e) =>
                      handleSignupChange("confirmPassword", e.target.value)
                    }
                    onBlur={() => setTouched((p) => ({ ...p, confirmPassword: true }))} 
                    className={inputStateClasses(
                      "confirmPassword",
                      signupData
                    )}
                  />
                  {errors.confirmPassword && (
                    <div className="mt-[6px] text-red-500 text-[12px]">
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full h-12 mt-4 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Sign Up
                </button>

                <div className="mt-3 text-[14px] text-center">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => setCurrentPage("login")}
                  >
                    Sign in
                  </button>
                </div>
              </form>
            )}

            {/* ===========================================================
                VERIFY EMAIL
            =========================================================== */}
            {currentPage === "verifyEmail" && (
              <form onSubmit={handleVerifyEmailSubmit}>
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verifyData.confirmationCode}
                    onChange={(e) =>
                      handleVerifyChange("confirmationCode", e.target.value)
                    }
                    className={inputStateClasses(
                      "confirmationCode",
                      verifyData
                    )}
                  />
                  {errors.confirmationCode && (
                    <div className="mt-[6px] text-red-500 text-[12px]">
                      {errors.confirmationCode}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full h-12 mt-4 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Verify Email
                </button>
              </form>
            )}

            {/* ===========================================================
                FORGOT PASSWORD
            =========================================================== */}
            {currentPage === "forgotPassword" && (
              <form onSubmit={handleForgotPasswordSubmit}>
                <div className="mt-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={resetData.email}
                    onChange={(e) => handleResetChange("email", e.target.value)}
                    className={inputStateClasses("email", resetData)}
                  />
                  {errors.email && (
                    <div className="mt-[6px] text-red-500 text-[12px]">
                      {errors.email}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full h-12 mt-4 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Send Reset Code
                </button>
              </form>
            )}

            {/* ===========================================================
                RESET PASSWORD
            =========================================================== */}
            {currentPage === "resetPassword" && (
              <form onSubmit={handleResetPasswordSubmit}>
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={resetData.confirmationCode}
                    onChange={(e) =>
                      handleResetChange("confirmationCode", e.target.value)
                    }
                    className={inputStateClasses(
                      "confirmationCode",
                      resetData
                    )}
                  />
                  {errors.confirmationCode && (
                    <div className="mt-[6px] text-red-500 text-[12px]">
                      {errors.confirmationCode}
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <input
                    type="password"
                    placeholder="Create a new password"
                    value={resetData.newPassword}
                    onChange={(e) =>
                      handleResetChange("newPassword", e.target.value)
                    }
                    className={inputStateClasses("newPassword", resetData)}
                  />
                  {errors.newPassword && (
                    <div className="mt-[6px] text-red-500 text-[12px]">
                      {errors.newPassword}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full h-12 mt-4 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Reset Password
                </button>
              </form>
            )}

            {/* Footer text */}
            <p className="mt-5 mb-3 text-[13px] text-gray-600 text-center">
              Any queries? Write to Bluecats@rabinnson.in
            </p>

            {/* App Store + Play Store */}
            <div className="flex justify-center gap-2 mt-3">
              <img
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                className="h-[40px]"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                className="h-[40px]"
              />
            </div>

          </section>
        </main>
      </div>
    </div>
  );
}
