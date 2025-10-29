import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageCircle,
  Search,
  MoreVertical,
  UserPlus,
  Users,
  Archive,
} from "lucide-react";
import ContactList from "./ContactList";
import type { Contact } from "../../types/chat";

interface ChatSidebarProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onContactSelect: (contact: Contact) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const ChatSidebar = ({
  contacts,
  selectedContact,
  onContactSelect,
  searchQuery,
  onSearchChange,
}: ChatSidebarProps) => {
  return (
    <div className="w-full md:w-80 border-r border-border flex flex-col overflow-y-hidden bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Trò chuyện</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <UserPlus className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <Archive className="mr-2 h-4 w-4" />
                  <span>Tin nhắn đã lưu trữ</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Tạo nhóm mới</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="chats" className="w-full flex ">
          <TabsList className="w-full grid-cols-2">
            <TabsTrigger value="chats" className="text-xs">
              <MessageCircle className="w-4 h-4 mr-1" />
              Cá nhân
            </TabsTrigger>
            <TabsTrigger value="groups" className="text-xs">
              <Users className="w-4 h-4 mr-1" />
              Nhóm
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Contacts List */}
      <ScrollArea className="flex-1">
        <ContactList
          contacts={contacts}
          selectedContact={selectedContact}
          onContactSelect={onContactSelect}
        />
      </ScrollArea>
    </div>
  );
};

export default ChatSidebar;
