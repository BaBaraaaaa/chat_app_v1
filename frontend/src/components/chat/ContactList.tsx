import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Contact } from "../../types/chat";

interface ContactListProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onContactSelect: (contact: Contact) => void;
}

const ContactList = ({
  contacts,
  selectedContact,
  onContactSelect,
}: ContactListProps) => {
  return (
    <div className="flex flex-col space-y-2 py-2">
      {contacts.map((contact) => {
        const isActive = selectedContact?.id === contact.id;
        return (
          <div
            key={contact.id}
            onClick={() => onContactSelect(contact)}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
              ${isActive ? "bg-accent/60 shadow-sm" : "hover:bg-accent/30"}
            `}
          >
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-11 h-11 shadow-sm">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {contact.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {contact.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background bg-green-500 shadow-sm"></div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <h3 className="font-medium text-sm truncate text-foreground">
                  {contact.name}
                </h3>
                <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                  {contact.timestamp}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground truncate max-w-[140px]">
                  {contact.lastMessage}
                </p>
                {contact.unreadCount ? (
                  <Badge
                    variant="default"
                    className="h-5 min-w-[20px] text-[11px] px-2 flex items-center justify-center rounded-full"
                  >
                    {contact.unreadCount}
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContactList;
