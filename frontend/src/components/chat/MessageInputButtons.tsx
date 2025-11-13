import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Smile, Send } from "lucide-react";

interface MessageInputButtonsProps {
  disabled: boolean;
  canSend: boolean;
  onSend: () => void;
}

export const AttachButton = memo(function AttachButton({ disabled }: { disabled: boolean }) {
  return (
    <Button 
      variant="outline" 
      size="icon" 
      disabled={disabled} 
      className="hover:bg-muted transition-colors"
    >
      <Paperclip className="w-5 h-5 text-muted-foreground" />
    </Button>
  );
});

export const EmojiButton = memo(function EmojiButton({ disabled }: { disabled: boolean }) {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      disabled={disabled} 
      className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-muted transition-colors"
    >
      <Smile className="w-5 h-5 text-muted-foreground" />
    </Button>
  );
});

export const SendButton = memo(function SendButton({ 
  disabled, 
  canSend, 
  onSend 
}: MessageInputButtonsProps) {
  return (
    <Button 
      onClick={onSend} 
      size="icon" 
      disabled={disabled || !canSend} 
      className="bg-primary hover:bg-primary/90 text-white transition-colors rounded-full p-2"
    >
      <Send className="w-5 h-5" />
    </Button>
  );
});
