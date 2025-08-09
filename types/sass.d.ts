declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}
declare module '*.sass' {
  const content: { [className: string]: string };
  export default content;
}
declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}
declare module '*.module.sass' {
  const classes: { [key: string]: string };
  export default classes;
}
declare module '@/styles/variables.scss' {
  export const primaryColor: string;
  export const secondaryColor: string;
  export const breakpointMd: string;
  export const breakpointLg: string;
  export const headerHeight: string;
  export const sidebarWidth: string;
}
