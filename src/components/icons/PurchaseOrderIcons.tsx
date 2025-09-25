// Simple icon components that match LucideIcon interface for Purchase Orders
import { forwardRef } from 'react';
import type { LucideProps } from 'lucide-react';

interface IconProps extends LucideProps {
  color?: string;
  size?: number;
  className?: string;
}

export const FileTextIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ color = "currentColor", size = 24, className, ...props }, ref) => (
    <svg 
      ref={ref}
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      {...props}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14,2 14,8 20,8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10,9 9,9 8,9"/>
    </svg>
  )
);
FileTextIcon.displayName = "FileTextIcon";

export const SendIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ color = "currentColor", size = 24, className, ...props }, ref) => (
    <svg 
      ref={ref}
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      {...props}
    >
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22,2 15,22 11,13 2,9 22,2"/>
    </svg>
  )
);
SendIcon.displayName = "SendIcon";

export const ClockIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ color = "currentColor", size = 24, className, ...props }, ref) => (
    <svg 
      ref={ref}
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12,6 12,12 16,14"/>
    </svg>
  )
);
ClockIcon.displayName = "ClockIcon";

export const CheckCircleIcon = ({ color = "currentColor", size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22,4 12,14.01 9,11.01"/>
  </svg>
);