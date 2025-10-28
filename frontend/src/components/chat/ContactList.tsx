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
    <div className="space-y-1 p-2">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          onClick={() => onContactSelect(contact)}
          className={`p-3 hover:bg-muted/50 cursor-pointer rounded-lg transition-colors ${
            selectedContact?.id === contact.id ? "bg-muted" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {contact.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {contact.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm truncate">
                  {contact.name}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {contact.timestamp}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-muted-foreground truncate">
                  {contact.lastMessage}
                </p>
                {contact.unreadCount && (
                  <Badge variant="default" className="h-5 text-xs">
                    {contact.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactList;