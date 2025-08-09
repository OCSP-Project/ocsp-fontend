import { gsap } from 'gsap';

declare global {
  interface Window {
    gsap: typeof gsap;
    hubConnection?: any;
    google?: any;
    ocspConfig?: {
      apiUrl: string;
      version: string;
      features: string[];
    };
  }

  interface CSSStyleDeclaration {
    '--primary-color'?: string;
    '--secondary-color'?: string;
    '--header-height'?: string;
    '--sidebar-width'?: string;
    '--progress-width'?: string;
  }

  interface HTMLElement {
    _gsapTargets?: any[];
  }
}

export {};
