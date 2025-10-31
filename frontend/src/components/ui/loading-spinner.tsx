import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const LoadingSpinner = ({ size = "md", className = "" }: LoadingSpinnerProps) => {
  const sizeClass = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  }[size];

  return (
    <div className={`flex justify-center py-8 ${className}`}>
      <Loader2 className={`${sizeClass} animate-spin text-primary`} />
    </div>
  );
};

export default LoadingSpinner;