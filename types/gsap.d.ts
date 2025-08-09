import { gsap } from 'gsap';

declare module 'gsap' {
  interface TweenVars {
    customEase?: string;
    projectProgress?: number;
    materialCount?: number;
  }
}

export interface ProjectAnimationTimeline {
  fadeIn: () => gsap.core.Timeline;
  slideUp: () => gsap.core.Timeline;
  progressBar: (progress: number) => gsap.core.Timeline;
  cardHover: () => gsap.core.Timeline;
  pageTransition: () => gsap.core.Timeline;
}

export interface UseGSAPProps {
  scope?: React.RefObject<HTMLElement>;
  dependencies?: React.DependencyList;
  revertOnUpdate?: boolean;
}

export interface GSAPAnimationConfig {
  duration?: number;
  ease?: string;
  delay?: number;
  stagger?: number;
  onComplete?: () => void;
  onStart?: () => void;
}
