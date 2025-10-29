import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface MobileHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
  rightContent?: ReactNode;
}

const MobileHeader = ({ 
  title, 
  showBackButton = false, 
  onBack, 
  rightContent 
}: MobileHeaderProps) => {
  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        {showBackButton && onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      {rightContent && (
        <div className="flex items-center gap-2">
          {rightContent}
        </div>
      )}
    </div>
  );
};

export default MobileHeader;