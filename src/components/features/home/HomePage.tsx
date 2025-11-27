"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";

import styles from "./HomePage.module.scss";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ProjectItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
}

interface ServiceItem {
  icon: string;
  title: string;
  description: string;
  features: string[];
}

const HomePage: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Animation setup
  useEffect(() => {
    // Fallback: ensure buttons are visible after a delay
    const fallbackTimer = setTimeout(() => {
      const buttons = document.querySelectorAll(".hero-button");
      buttons.forEach((btn) => {
        (btn as HTMLElement).style.opacity = "1";
        (btn as HTMLElement).style.visibility = "visible";
      });
    }, 2000); // After 2 seconds, ensure buttons are visible

    const ctx = gsap.context(() => {
      // Hero section animations
      gsap.from(".hero-title", {
        duration: 1.5,
        y: 100,
        opacity: 0,
        ease: "power3.out",
        delay: 0.5,
      });

      gsap.from(".hero-subtitle", {
        duration: 1.2,
        y: 50,
        opacity: 0,
        ease: "power2.out",
        delay: 0.8,
      });

      // Animate hero buttons
      // Animate hero buttons
      gsap.from(".hero-button", {
        duration: 1,
        y: 30,
        opacity: 0,
        ease: "power2.out",
        delay: 1.1,
        stagger: 0.2,
        // Ensure buttons are visible if animation fails
        onComplete: () => {
          const buttons = document.querySelectorAll(".hero-button");
          buttons.forEach((btn) => {
            (btn as HTMLElement).style.opacity = "1";
            (btn as HTMLElement).style.visibility = "visible";
          });
        },
      });

      // About section animation
      gsap.from(".about-text", {
        scrollTrigger: {
          trigger: aboutRef.current,
          start: "top 80%",
        },
        duration: 1.2,
        x: -100,
        opacity: 0,
        ease: "power2.out",
      });

      gsap.from(".about-image", {
        scrollTrigger: {
          trigger: aboutRef.current,
          start: "top 80%",
        },
        duration: 1.2,
        x: 100,
        opacity: 0,
        ease: "power2.out",
        delay: 0.2,
      });

      // Services animation
      gsap.from(".service-card", {
        scrollTrigger: {
          trigger: servicesRef.current,
          start: "top 80%",
        },
        duration: 0.8,
        y: 60,
        opacity: 0,
        stagger: 0.2,
        ease: "power2.out",
      });

      // Projects animation
      gsap.from(".project-card", {
        scrollTrigger: {
          trigger: projectsRef.current,
          start: "top 80%",
        },
        duration: 0.8,
        scale: 0.8,
        opacity: 0,
        stagger: 0.15,
        ease: "power2.out",
      });

      // CTA animation
      gsap.from(".cta-content", {
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 80%",
        },
        duration: 1,
        y: 50,
        opacity: 0,
        ease: "power2.out",
      });
    });

    return () => {
      ctx.revert();
      clearTimeout(fallbackTimer);
    };
  }, []);

  const services: ServiceItem[] = [
    {
      icon: "🏗️",
      title: "THI CÔNG XÂY DỰNG",
      description:
        "Dịch vụ thi công chuyên nghiệp với đội ngũ thầu xây dựng có kinh nghiệm",
      features: [
        "Thiết kế kiến trúc",
        "Thi công hoàn thiện",
        "Giám sát chất lượng",
      ],
    },
    {
      icon: "👨‍💼",
      title: "GIÁM SÁT CÔNG TRÌNH",
      description: "Giám sát viên có chứng chỉ đảm bảo tiến độ và chất lượng",
      features: ["Kiểm tra tiến độ", "Báo cáo định kỳ", "Kiểm soát chất lượng"],
    },
    {
      icon: "💰",
      title: "QUẢN LÝ TÀI CHÍNH",
      description: "Hệ thống thanh toán an toàn theo tiến độ công việc",
      features: ["Escrow payment", "Báo cáo chi phí", "Thanh toán linh hoạt"],
    },
  ];

  const projects: ProjectItem[] = [
    {
      id: "1",
      title: "BIỆT THỰ HIỆN ĐẠI",
      category: "RESIDENTIAL",
      image: "/images/projects/project1.jpg",
      description: "Thiết kế hiện đại với không gian mở",
    },
    {
      id: "2",
      title: "NHÀ PHỐ MINIMALIST",
      category: "RESIDENTIAL",
      image: "/images/projects/project2.jpg",
      description: "Phong cách tối giản, tận dụng ánh sáng tự nhiên",
    },
    {
      id: "3",
      title: "VĂN PHÒNG THÔNG MINH",
      category: "COMMERCIAL",
      image: "/images/projects/project3.jpg",
      description: "Không gian làm việc hiệu quả và sáng tạo",
    },
    {
      id: "4",
      title: "RESORT BOUTIQUE",
      category: "HOSPITALITY",
      image: "/images/projects/project4.jpg",
      description: "Hòa quyện với thiên nhiên",
    },
    {
      id: "5",
      title: "NHÀ MÁY SẢN XUẤT",
      category: "INDUSTRIAL",
      image: "/images/projects/project5.jpg",
      description: "Tối ưu hóa quy trình sản xuất",
    },
    {
      id: "6",
      title: "TRUNG TÂM THƯƠNG MẠI",
      category: "COMMERCIAL",
      image: "/images/projects/project6.jpg",
      description: "Điểm đến mua sắm hiện đại",
    },
  ];

  return (
    <main className={styles.homePage}>
      {/* Hero Section */}
      <section ref={heroRef} className={styles.heroSection}>
        <div className={styles.heroBackground}>
          <Image
            src="/images/page/homePage/bgHome.png"
            alt="OCSP Background"
            fill
            className={styles.backgroundImage}
            priority
          />
          <div className={styles.overlay} />
        </div>

        <div className={styles.container}>
          <div className={styles.heroContent}>
            <h1 className={`${styles.heroTitle} hero-title`}>
              XÂY DỰNG
              <br />
              TƯƠNG LAI
            </h1>

            <p className={`${styles.heroSubtitle} hero-subtitle`}>
              Kết nối chủ đầu tư với các thầu xây dựng và giám sát viên uy tín.
              <br />
              Nền tảng quản lý dự án toàn diện với công nghệ AI tiên tiến.
            </p>

            <div className={styles.heroButtons}>
              <Link
                href="/projects/create"
                className={`${styles.heroButton} hero-button`}
              >
                BẮT ĐẦU <br />
                DỰ ÁN
              </Link>
              <Link
                href="/contact"
                className={`${styles.heroButtonSecondary} hero-button`}
              >
                ĐĂNG KÝ NHÀ THẦU,  <br />
                GIÁM SÁT VIÊN
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} className={styles.aboutSection}>
        <div className={styles.container}>
          <div className={styles.aboutGrid}>
            <div className={`${styles.aboutText} about-text`}>
              <span className={styles.sectionLabel}>VỀ CHÚNG TÔI</span>
              <h2 className={styles.aboutTitle}>
                BUILD BRICK
                <br />
                BY BRICK
              </h2>
              <p className={styles.aboutDescription}>
                OCSP là nền tảng kết nối hàng đầu trong lĩnh vực xây dựng tại
                Việt Nam. Chúng tôi tạo cầu nối tin cậy giữa chủ đầu tư và các
                nhà thầu chuyên nghiệp, đảm bảo mọi dự án được thực hiện với
                chất lượng cao nhất.
              </p>
              <Link href="/about" className={styles.aboutButton}>
                TÌM HIỂU THÊM
              </Link>
            </div>
            <div className={`${styles.aboutImages} about-image`}>
              <div className={styles.imageGrid}>
                <div className={styles.imageItem}>
                  <Image
                    src="/images/about/construction1.jpg"
                    alt="Construction"
                    fill
                    className={styles.aboutImg}
                  />
                </div>
                <div className={styles.imageItem}>
                  <Image
                    src="/images/about/construction2.jpg"
                    alt="Construction"
                    fill
                    className={styles.aboutImg}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Art of Innovation */}

      {/* Services Section */}
      <section ref={servicesRef} className={styles.servicesSection}>
        <div className={styles.container}>
          <div className={styles.servicesGrid}>
            {services.map((service, index) => (
              <div key={index} className={`${styles.serviceCard} service-card`}>
                <div className={styles.serviceIcon}>{service.icon}</div>
                <h3 className={styles.serviceTitle}>{service.title}</h3>
                <p className={styles.serviceDescription}>
                  {service.description}
                </p>
                <ul className={styles.serviceFeatures}>
                  {service.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* <div className={styles.servicesBottom}>
              <h3 className={styles.servicesBottomTitle}>
                DESIGNS
                <br />
                FOR A<br />
                SUSTAINABLE
                <br />
                LIFE
              </h3>
            </div> */}
        </div>
      </section>

      {/* Solutions Section */}
      <section className={styles.solutionsSection}>
        <div className={styles.container}>
          <div className={styles.solutionsHeader}>
            <span className={styles.sectionLabel}>GIẢI PHÁP CHO DỰ ÁN</span>
            <h2 className={styles.solutionsTitle}>
              Dành cho mọi loại dự án xây dựng
            </h2>
          </div>
        </div>
      </section>

      {/* Projects Gallery */}
      <section ref={projectsRef} className={styles.projectsSection}>
        <div className={styles.container}>
          <div className={styles.projectsGrid}>
            {projects.map((project, index) => (
              <div
                key={project.id}
                className={`${styles.projectCard} project-card`}
              >
                <div className={styles.projectImage}>
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className={styles.projectImg}
                  />
                  <div className={styles.projectOverlay}>
                    <span className={styles.projectCategory}>
                      {project.category}
                    </span>
                    <h3 className={styles.projectTitle}>{project.title}</h3>
                    <p className={styles.projectDescription}>
                      {project.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Build Vision Section */}
      <section className={styles.buildVisionSection}>
        <div className={styles.buildVisionContent}>
          <div className={styles.buildVisionText}>
            <h2>
              BUILD
              <br />
              VISION
            </h2>
          </div>
          <div className={styles.buildVisionImage}>
            <Image
              src="/images/vision/city-view.jpg"
              alt="City Vision"
              fill
              className={styles.visionImg}
            />
          </div>
        </div>
      </section>

      {/* Precision Section */}
      <section className={styles.precisionSection}>
        <div className={styles.container}>
          <div className={styles.precisionContent}>
            <span className={styles.sectionLabel}>CHẤT LƯỢNG</span>
            <h2 className={styles.precisionTitle}>
              PRECISION
              <br />
              IN <span className={styles.highlight}>EVERY</span>
              <br />
              DESIGN
            </h2>
            <p className={styles.precisionDescription}>
              Mỗi dự án được thực hiện với độ chính xác cao nhất, từ khâu thiết
              kế đến thi công hoàn thiện.
            </p>
            <Link href="/projects" className={styles.precisionButton}>
              XEM DỰ ÁN
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={`${styles.ctaContent} cta-content`}>
            <h2>Sẵn sàng khởi tạo dự án của bạn?</h2>
            <p>Tham gia cùng hàng nghìn khách hàng đã tin tướng OCSP</p>
            <div className={styles.ctaButtons}>
              <Link href="/register" className={styles.ctaPrimaryButton}>
                BẮT ĐẦU NGAY
              </Link>
              <Link href="/contact" className={styles.ctaSecondaryButton}>
                LIÊN HỆ TƯ VẤN
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
