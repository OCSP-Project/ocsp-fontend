"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import Snowfall from "react-snowfall";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

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
    const fallbackTimer = setTimeout(() => {
      const buttons = document.querySelectorAll(".hero-button");
      buttons.forEach((btn) => {
        (btn as HTMLElement).style.opacity = "1";
        (btn as HTMLElement).style.visibility = "visible";
      });
    }, 2000);

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

      gsap.from(".hero-button", {
        duration: 1,
        y: 30,
        opacity: 0,
        ease: "power2.out",
        delay: 1.1,
        stagger: 0.2,
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
        "Dịch vụ thi công chuyên nghiệp với đội ngũ thầu xây dựng giàu kinh nghiệm và tận tâm",
      features: [
        "Thiết kế kiến trúc sáng tạo",
        "Thi công hoàn thiện chất lượng cao",
        "Giám sát chặt chẽ từng công đoạn",
      ],
    },
    {
      icon: "👨‍💼",
      title: "GIÁM SÁT CHUYÊN NGHIỆP",
      description:
        "Giám sát viên có chứng chỉ hành nghề, đảm bảo tiến độ và chất lượng tối ưu",
      features: [
        "Kiểm tra tiến độ hàng ngày",
        "Báo cáo chi tiết định kỳ",
        "Kiểm soát chất lượng nghiêm ngặt",
      ],
    },
    {
      icon: "💰",
      title: "THANH TOÁN THÔNG MINH",
      description:
        "Hệ thống thanh toán an toàn, minh bạch theo từng giai đoạn công việc",
      features: [
        "Escrow payment bảo mật",
        "Báo cáo chi phí chi tiết",
        "Thanh toán linh hoạt đa dạng",
      ],
    },
  ];

  const projects: ProjectItem[] = [
    {
      id: "1",
      title: "BIỆT THỰ HIỆN ĐẠI",
      category: "RESIDENTIAL",
      image: "/images/projects/project1.jpg",
      description: "Thiết kế hiện đại với không gian mở thoáng đãng",
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
      description: "Hòa quyện hoàn hảo với thiên nhiên",
    },
    {
      id: "5",
      title: "NHÀ MÁY SẢN XUẤT",
      category: "INDUSTRIAL",
      image: "/images/projects/project5.jpg",
      description: "Tối ưu hóa quy trình sản xuất hiệu quả",
    },
    {
      id: "6",
      title: "TRUNG TÂM THƯƠNG MẠI",
      category: "COMMERCIAL",
      image: "/images/projects/project6.jpg",
      description: "Điểm đến mua sắm hiện đại bậc nhất",
    },
  ];

  return (
    <main className={styles.homePage}>
      {/* Snowfall Effect */}
      <Snowfall
        color="#ffffff"
        snowflakeCount={50}
        style={{
          position: "fixed",
          width: "100vw",
          height: "100vh",
          zIndex: 10,
          pointerEvents: "none",
        }}
      />

      {/* Hero Section */}
      <section ref={heroRef} className={styles.heroSection}>
        {/* Background Carousel */}
        <div className={styles.heroCarousel}>
          <Swiper
            modules={[Autoplay, EffectFade, Pagination]}
            effect="fade"
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
            }}
            loop={true}
            className={styles.swiper}
          >
            <SwiperSlide>
              <div className={styles.slideWrapper}>
                <Image
                  src="/images/page/homePage/bgHome.png"
                  alt="OCSP Construction"
                  fill
                  className={styles.slideImage}
                  priority
                />
                <div className={styles.slideOverlay} />
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className={styles.slideWrapper}>
                <Image
                  src="/images/page/homePage/layout1.png"
                  alt="Modern Construction"
                  fill
                  className={styles.slideImage}
                />
                <div className={styles.slideOverlay} />
              </div>
            </SwiperSlide>
          </Swiper>
        </div>

        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.heroCard}>
              <h1 className={`${styles.heroTitle} hero-title`}>
                XÂY DỰNG
                <br />
                <span className={styles.gradientText}>TƯƠNG LAI</span>
              </h1>

              <p className={`${styles.heroSubtitle} hero-subtitle`}>
                Kết nối chủ đầu tư với thầu xây dựng và giám sát viên uy tín
                <br />
                Nền tảng quản lý dự án toàn diện với công nghệ AI tiên tiến
              </p>

              <div className={styles.heroButtons}>
                <Link
                  href="/projects/create"
                  className={`${styles.heroButton} hero-button`}
                >
                  BẮT ĐẦU DỰ ÁN
                </Link>
                <Link
                  href="/contact"
                  className={`${styles.heroButtonSecondary} hero-button`}
                >
                  LIÊN HỆ TƯ VẤN
                </Link>
              </div>
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
                XÂY DỰNG
                <br />
                TỪNG VIÊN GẠCH
              </h2>
              <p className={styles.aboutDescription}>
                OCSP là nền tảng kết nối hàng đầu trong lĩnh vực xây dựng tại
                Việt Nam. Chúng tôi tạo cầu nối tin cậy giữa chủ đầu tư và các
                nhà thầu chuyên nghiệp, với sứ mệnh mang đến giải pháp xây dựng
                thông minh, minh bạch và hiệu quả.
              </p>
              <div className={styles.aboutStats}>
                <div className={styles.statItem}>
                  <h3>500+</h3>
                  <p>Dự án hoàn thành</p>
                </div>
                <div className={styles.statItem}>
                  <h3>1000+</h3>
                  <p>Khách hàng hài lòng</p>
                </div>
                <div className={styles.statItem}>
                  <h3>50+</h3>
                  <p>Thầu xây dựng</p>
                </div>
              </div>
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

      {/* Services Section */}
      {/* <section ref={servicesRef} className={styles.servicesSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>DỊCH VỤ CỦA CHÚNG TÔI</span>
            <h2 className={styles.sectionTitle}>
              Giải pháp toàn diện cho mọi dự án
            </h2>
          </div>

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
                    <li key={idx}>
                      <span className={styles.checkIcon}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Solutions Section */}
      <section className={styles.solutionsSection}>
        <div className={styles.container}>
          <div className={styles.solutionsContent}>
            <h2 className={styles.solutionsTitle}>
              Công nghệ AI
              <br />
              <span className={styles.gradientText}>
                Tư vấn thông minh 24/7
              </span>
            </h2>
            <p className={styles.solutionsDescription}>
              Hệ thống AI tiên tiến giúp bạn quản lý dự án hiệu quả, từ ước tính
              chi phí đến giám sát tiến độ thi công một cách tự động và chính
              xác
            </p>
            <div className={styles.solutionsFeatures}>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>🤖</span>
                <span>Tư vấn AI thông minh</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>📊</span>
                <span>Phân tích dữ liệu real-time</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>🔔</span>
                <span>Cảnh báo tiến độ tự động</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Gallery */}
      <section ref={projectsRef} className={styles.projectsSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>DỰ ÁN TIÊU BIỂU</span>
            <h2 className={styles.sectionTitle}>
              Những công trình chúng tôi tự hào
            </h2>
          </div>

          <div className={styles.projectsGrid}>
            {projects.map((project) => (
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

      {/* CTA Section */}
      <section ref={ctaRef} className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={`${styles.ctaContent} cta-content`}>
            <h2>Sẵn sàng khởi động dự án của bạn?</h2>
            <p>Tham gia cùng hàng nghìn khách hàng đã tin tưởng OCSP</p>
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
