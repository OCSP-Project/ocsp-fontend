"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { useAuth } from "@/hooks/useAuth";
import styles from "@/styles/pages/ForgotPasswordPage.module.scss";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const router = useRouter();
  const { forgotPassword } = useAuth();

  // Animation on mount
  React.useEffect(() => {
    gsap.fromTo(
      ".forgot-container",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
    );

    gsap.fromTo(
      ".forgot-form",
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)", delay: 0.2 }
    );
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);

    // Clear error when user starts typing
    if (errors.email) {
      setErrors({});
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await forgotPassword({ email });

      setIsSuccess(true);

      // Success animation
      gsap.to(".forgot-form", {
        scale: 1.02,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
      });
    } catch (error: any) {
      setErrors({
        general: error.message || "Có lỗi xảy ra, vui lòng thử lại",
      });

      // Error shake animation
      gsap.to(".forgot-form", {
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

  if (isSuccess) {
    return (
      <div className={styles.forgotPasswordPage}>
        <div className={`${styles.container} forgot-container`}>
          <div className={styles.leftSection}>
            <div className={`${styles.successCard} forgot-form`}>
              {/* Logo */}
              <div className={styles.logo}>
                <Link href="/">
                  <span className={styles.logoText}>OCSP</span>
                  <span className={styles.logoSubtext}>CONSTRUCTION</span>
                </Link>
              </div>

              {/* Success Icon */}
              <div className={styles.successIcon}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#10B981" />
                  <path
                    d="M9 12L11 14L15 10"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Success Message */}
              <div className={styles.successContent}>
                <h1>Email đã được gửi!</h1>
                <p>
                  Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến địa chỉ email:
                  <strong> {email}</strong>
                </p>
                <div className={styles.instructions}>
                  <h3>Bước tiếp theo:</h3>
                  <ol>
                    <li>Kiểm tra hộp thư đến của bạn</li>
                    <li>Tìm email từ OCSP (kiểm tra cả thư mục spam)</li>
                    <li>Nhấp vào liên kết trong email để đặt lại mật khẩu</li>
                    <li>Tạo mật khẩu mới và đăng nhập</li>
                  </ol>
                </div>
              </div>

              {/* Actions */}
              <div className={styles.successActions}>
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail("");
                  }}
                  className={styles.resendButton}
                >
                  Gửi lại email
                </button>
                <Link href="/login" className={styles.backToLoginButton}>
                  Quay lại đăng nhập
                </Link>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className={styles.rightSection}>
            <div className={styles.decorativeContent}>
              <h2>Đặt lại mật khẩu dễ dàng</h2>
              <p>
                Hệ thống bảo mật của OCSP đảm bảo tài khoản của bạn luôn an toàn
              </p>

              <div className={styles.securityFeatures}>
                <div className={styles.feature}>
                  <div className={styles.featureIcon}>🔒</div>
                  <span>Mã hóa email xác thực</span>
                </div>
                <div className={styles.feature}>
                  <div className={styles.featureIcon}>⏰</div>
                  <span>Link có thời hạn 1 giờ</span>
                </div>
                <div className={styles.feature}>
                  <div className={styles.featureIcon}>✅</div>
                  <span>Xác thực 2 lớp bảo mật</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.forgotPasswordPage}>
      <div className={`${styles.container} forgot-container`}>
        <div className={styles.leftSection}>
          <div className={`${styles.forgotForm} forgot-form`}>
            {/* Logo */}
            <div className={styles.logo}>
              <Link href="/">
                <span className={styles.logoText}>OCSP</span>
                <span className={styles.logoSubtext}>CONSTRUCTION</span>
              </Link>
            </div>

            {/* Header */}
            <div className={styles.header}>
              <h1>Quên mật khẩu?</h1>
              <p>
                Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật
                khẩu
              </p>
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
                <label htmlFor="email">Địa chỉ email</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className={errors.email ? styles.inputError : ""}
                    autoFocus
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
                  "Gửi hướng dẫn"
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className={styles.backToLogin}>
              <Link href="/login">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M19 12H5M12 19L5 12L12 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Quay lại đăng nhập
              </Link>
            </div>

            {/* Help */}
            <div className={styles.helpSection}>
              <p>Cần hỗ trợ?</p>
              <Link href="/contact" className={styles.contactLink}>
                Liên hệ với chúng tôi
              </Link>
            </div>
          </div>
        </div>

        {/* Right Section - Decorative */}
        <div className={styles.rightSection}>
          <div className={styles.decorativeContent}>
            <h2>Bảo mật tài khoản</h2>
            <p>
              OCSP sử dụng các biện pháp bảo mật tiên tiến để bảo vệ thông tin
              của bạn
            </p>

            <div className={styles.securityFeatures}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>🛡️</div>
                <span>Mã hóa SSL 256-bit</span>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>🔐</div>
                <span>Xác thực đa yếu tố</span>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>📧</div>
                <span>Email xác thực an toàn</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
