import { memo } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface EditModeBannerProps {
  onCancel?: () => void;
}

const EditModeBanner = memo(function EditModeBanner({ onCancel }: EditModeBannerProps) {
  return (
    <div className="mb-2 flex items-center justify-between px-3 py-2 bg-muted rounded-lg text-sm text-muted-foreground">
      <span>Đang chỉnh sửa tin nhắn</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onCancel}
        className="h-6 px-2 flex items-center gap-1"
      >
        <X className="w-4 h-4" /> Hủy
      </Button>
    </div>
  );
});

export default EditModeBanner;
