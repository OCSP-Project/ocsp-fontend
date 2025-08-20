"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { useAuth } from "@/hooks/useAuth";
import styles from "@/styles/pages/LoginPage.module.scss";

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  // Animation on mount
  React.useEffect(() => {
    gsap.fromTo(
      ".login-container",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
    );

    gsap.fromTo(
      ".login-form",
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)", delay: 0.2 }
    );
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await login(formData);

      // Success animation
      gsap.to(".login-form", {
        scale: 1.05,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          router.push("/");
        },
      });
    } catch (error: any) {
      setErrors({ general: error.message || "Đăng nhập thất bại" });

      // Error shake animation
      gsap.to(".login-form", {
        keyframes: {
          x: [-10, 10, -10, 10, 0],
        },
        duration: 0.5,
        ease: "power2.inOut",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    console.log("Google login will be implemented");
  };

  return (
    <div className={styles.loginPage}>
      <div className={`${styles.container} login-container`}>
        <div className={styles.leftSection}>
          <div className={`${styles.loginForm} login-form`}>
            {/* Logo */}
            <div className={styles.logo}>
              <Link href="/">
                <span className={styles.logoText}>OCSP</span>
                <span className={styles.logoSubtext}>CONSTRUCTION</span>
              </Link>
            </div>

            {/* Header */}
            <div className={styles.header}>
              <h1>Chào mừng trở lại</h1>
              <p>Đăng nhập để quản lý dự án xây dựng của bạn</p>
            </div>

            {/* General Error */}
            {errors.general && (
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
                {errors.general}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Email Input */}
              <div className={styles.inputGroup}>
                <label htmlFor="email">Email</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className={errors.email ? styles.inputError : ""}
                  />
                  <svg
                    className={styles.inputIcon}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path d="M3 7L9 13L15 7H3Z" fill="currentColor" />
                    <path
                      d="M21 5H3C2.45 5 2 5.45 2 6V18C2 18.55 2.45 19 3 19H21C21.55 19 22 18.55 22 18V6C22 5.45 21.55 5 21 5Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
                {errors.email && (
                  <span className={styles.errorText}>{errors.email}</span>
                )}
              </div>

              {/* Password Input */}
              <div className={styles.inputGroup}>
                <label htmlFor="password">Mật khẩu</label>
                <div className={styles.inputWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={errors.password ? styles.inputError : ""}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 11.9992 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span className={styles.errorText}>{errors.password}</span>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className={styles.forgotPassword}>
                <Link href="/forgot-password">Quên mật khẩu?</Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
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
                  "Đăng nhập"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className={styles.divider}>
              <span>HOẶC</span>
            </div>

            {/* Social Login */}
            <button
              type="button"
              className={styles.googleButton}
              onClick={handleGoogleLogin}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Đăng nhập với Google
            </button>

            {/* Register Link */}
            <div className={styles.registerLink}>
              <span>Chưa có tài khoản? </span>
              <Link href="/register">Đăng ký ngay</Link>
            </div>
          </div>
        </div>

        {/* Right Section - Decorative */}
        <div className={styles.rightSection}>
          <div className={styles.decorativeContent}>
            <h2>Bắt đầu dự án xây dựng của bạn</h2>
            <p>
              Kết nối với hàng ngàn thầu xây dựng và giám sát viên chuyên nghiệp
            </p>

            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>🏗️</div>
                <span>Quản lý dự án thông minh</span>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>💰</div>
                <span>Thanh toán an toàn</span>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>🤖</div>
                <span>Tư vấn AI 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
