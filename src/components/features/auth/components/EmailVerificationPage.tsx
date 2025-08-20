"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { gsap } from "gsap";
import { authApi } from "@/lib/auth/auth.api";
import styles from "@/styles/pages/EmailVerificationPage.module.scss";

const EmailVerificationPage: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Animation on mount
  useEffect(() => {
    gsap.fromTo(
      ".verification-container",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
    );

    gsap.fromTo(
      ".verification-form",
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)", delay: 0.2 }
    );

    // Focus first input
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Clear error when user starts typing
    if (error) setError("");

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "");

    if (pastedData.length === 6) {
      const newCode = pastedData.split("");
      setVerificationCode(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const code = verificationCode.join("");
    if (code.length !== 6) {
      setError("Vui lòng nhập đầy đủ mã xác thực");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await authApi.verifyEmail({
        email: email,
        token: code,
      });

      setSuccess(true);

      // Success animation
      gsap.to(".verification-form", {
        scale: 1.05,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          setTimeout(() => {
            router.push("/login?message=email-verified");
          }, 1500);
        },
      });
    } catch (error: any) {
      setError(error.message || "Mã xác thực không đúng");

      // Error shake animation
      gsap.to(".verification-form", {
        keyframes: { x: [-10, 10, -10, 10, 0] },
        duration: 0.5,
        ease: "power2.inOut",
      });

      // Clear the code
      setVerificationCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    try {
      // Call resend verification API
      await authApi.resendVerification(email);
      setResendCooldown(60); // 60 seconds cooldown
      setError("");

      // Show success message
      gsap.to(".resend-success", {
        opacity: 1,
        duration: 0.3,
        onComplete: () => {
          setTimeout(() => {
            gsap.to(".resend-success", { opacity: 0, duration: 0.3 });
          }, 3000);
        },
      });
    } catch (error: any) {
      setError(error.message || "Không thể gửi lại mã xác thực");
    }
  };

  if (success) {
    return (
      <div className={styles.verificationPage}>
        <div className={styles.container}>
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#10b981" />
                <path
                  d="M9 12l2 2 4-4"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1>Xác thực thành công!</h1>
            <p>
              Tài khoản của bạn đã được kích hoạt. Đang chuyển hướng đến trang
              đăng nhập...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.verificationPage}>
      <div className={`${styles.container} verification-container`}>
        <div className={styles.leftSection}>
          <div className={`${styles.verificationForm} verification-form`}>
            {/* Logo */}
            <div className={styles.logo}>
              <Link href="/">
                <span className={styles.logoText}>OCSP</span>
                <span className={styles.logoSubtext}>CONSTRUCTION</span>
              </Link>
            </div>

            {/* Header */}
            <div className={styles.header}>
              <h1>Xác thực email</h1>
              <p>
                Chúng tôi đã gửi mã xác thực 6 số đến
                <br />
                <strong>{email}</strong>
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className={styles.errorMessage}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Verification Code Input */}
              <div className={styles.codeInputGroup}>
                <label>Mã xác thực</label>
                <div className={styles.codeInputs} onPaste={handlePaste}>
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={styles.codeInput}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading || verificationCode.join("").length !== 6}
              >
                {isLoading ? (
                  <div className={styles.spinner}>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        opacity="0.3"
                      />
                      <path
                        d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      >
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          dur="1s"
                          values="0 12 12;360 12 12"
                          repeatCount="indefinite"
                        />
                      </path>
                    </svg>
                  </div>
                ) : (
                  "Xác thực tài khoản"
                )}
              </button>
            </form>

            {/* Resend Code */}
            <div className={styles.resendSection}>
              <p>Không nhận được mã?</p>
              <button
                type="button"
                className={styles.resendButton}
                onClick={handleResendCode}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0
                  ? `Gửi lại sau ${resendCooldown}s`
                  : "Gửi lại mã xác thực"}
              </button>
              <div
                className="resend-success"
                style={{
                  opacity: 0,
                  color: "#10b981",
                  fontSize: "0.9rem",
                  marginTop: "0.5rem",
                }}
              >
                Đã gửi lại mã xác thực!
              </div>
            </div>

            {/* Back to Login */}
            <div className={styles.loginLink}>
              <Link href="/login">← Quay lại đăng nhập</Link>
            </div>
          </div>
        </div>

        {/* Right Section - Decorative */}
        <div className={styles.rightSection}>
          <div className={styles.decorativeContent}>
            <h2>Một bước cuối cùng</h2>
            <p>
              Xác thực email để hoàn tất việc tạo tài khoản và bắt đầu sử dụng
              OCSP
            </p>

            <div className={styles.benefits}>
              <div className={styles.benefit}>
                <div className={styles.benefitIcon}>📧</div>
                <div>
                  <h4>Kiểm tra email</h4>
                  <p>Mã được gửi đến hộp thư của bạn</p>
                </div>
              </div>
              <div className={styles.benefit}>
                <div className={styles.benefitIcon}>🔒</div>
                <div>
                  <h4>Bảo mật cao</h4>
                  <p>Mã có hiệu lực trong 15 phút</p>
                </div>
              </div>
              <div className={styles.benefit}>
                <div className={styles.benefitIcon}>⚡</div>
                <div>
                  <h4>Xác thực nhanh</h4>
                  <p>Chỉ cần vài giây để hoàn tất</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
