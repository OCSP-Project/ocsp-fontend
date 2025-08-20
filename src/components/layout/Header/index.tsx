"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";
import { useAuth } from "@/hooks/useAuth";
import styles from "./Header.module.scss";

interface NavItem {
  label: string;
  href: string;
}

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  const navItems: NavItem[] = [
    { label: "TRANG CHỦ", href: "/" },
    { label: "DỰ ÁN", href: "/projects" },
    { label: "THẦU XÂY DỰNG", href: "/contractors" },
    { label: "GIÁM SÁT", href: "/supervisors" },
    { label: "TIN TỨC", href: "/news" },
    { label: "LIÊN HỆ", href: "/contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Header animation on mount
    gsap.fromTo(
      ".header-nav-item",
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.2 }
    );

    // User menu animation when authenticated
    if (isAuthenticated && user) {
      gsap.fromTo(
        ".user-avatar",
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.7)", delay: 0.8 }
      );
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Click outside to close user menu
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    
    // Animation for user menu dropdown
    if (!isUserMenuOpen) {
      gsap.fromTo(
        ".user-dropdown",
        { opacity: 0, y: -10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power2.out" }
      );
    }
  };

  const handleLogout = () => {
    // Logout animation
    gsap.to(".user-avatar", {
      scale: 0,
      rotation: 180,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => {
        logout();
        router.push('/');
      }
    });
  };

  const getAvatarInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const getUserRoleText = (role: number) => {
    const roles = {
      0: "Quản trị viên",
      1: "Giám sát viên", 
      2: "Thầu xây dựng",
      3: "Chủ nhà"
    };
    return roles[role as keyof typeof roles] || "Người dùng";
  };

  if (isLoading) {
    return (
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
        <div className={styles.container}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoText}>OCSP</span>
            <span className={styles.logoSubtext}>CONSTRUCTION</span>
          </Link>
          <div className={styles.loadingSkeleton}></div>
        </div>
      </header>
    );
  }

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>OCSP</span>
          <span className={styles.logoSubtext}>CONSTRUCTION</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.nav}>
          {navItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} header-nav-item ${
                pathname === item.href ? styles.active : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Actions */}
        <div className={styles.userActions}>
          {isAuthenticated && user ? (
            // Authenticated User Menu
            <div className={styles.userMenu} ref={userMenuRef}>
              <div 
                className={`${styles.userProfile} user-avatar`}
                onClick={toggleUserMenu}
                ref={avatarRef}
              >
                <div className={styles.avatar}>
                  {getAvatarInitials(user.username)}
                </div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user.username}</span>
                  <span className={styles.userRole}>{getUserRoleText(user.role)}</span>
                </div>
                <svg 
                  className={`${styles.chevronIcon} ${isUserMenuOpen ? styles.open : ""}`}
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none"
                >
                  <path 
                    d="M6 9L12 15L18 9" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className={`${styles.userDropdown} user-dropdown`}>
                  <Link href="/dashboard" className={styles.dropdownItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                      <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                      <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                      <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Dashboard
                  </Link>
                  <Link href="/profile" className={styles.dropdownItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Hồ sơ
                  </Link>
                  <Link href="/settings" className={styles.dropdownItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Cài đặt
                  </Link>
                  <div className={styles.dropdownDivider}></div>
                  <button onClick={handleLogout} className={styles.dropdownItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2"/>
                      <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2"/>
                      <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Guest User Actions
            <>
              <Link href="/login" className={styles.loginBtn}>
                ĐĂNG NHẬP
              </Link>
              <Link href="/register" className={styles.registerBtn}>
                ĐĂNG KÝ
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={styles.mobileMenuBtn}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span
            className={`${styles.hamburger} ${isMenuOpen ? styles.open : ""}`}
          >
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ""}`}>
        <nav className={styles.mobileNav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.mobileNavItem} ${
                pathname === item.href ? styles.active : ""
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className={styles.mobileUserActions}>
            {isAuthenticated && user ? (
              <>
                <div className={styles.mobileUserInfo}>
                  <div className={styles.mobileAvatar}>
                    {getAvatarInitials(user.username)}
                  </div>
                  <div>
                    <div className={styles.mobileUserName}>{user.username}</div>
                    <div className={styles.mobileUserRole}>{getUserRoleText(user.role)}</div>
                  </div>
                </div>
                <Link href="/dashboard" className={styles.mobileNavItem}>
                  DASHBOARD
                </Link>
                <Link href="/profile" className={styles.mobileNavItem}>
                  HỒ SƠ
                </Link>
                <button onClick={handleLogout} className={styles.mobileLogoutBtn}>
                  ĐĂNG XUẤT
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={styles.mobileLoginBtn}>
                  ĐĂNG NHẬP
                </Link>
                <Link href="/register" className={styles.mobileRegisterBtn}>
                  ĐĂNG KÝ
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;