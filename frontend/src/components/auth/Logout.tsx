import { useAuthStore } from "@/stores/useAuthStore";
import { replace, useNavigate } from "react-router";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";

const Logout = () => {
  const { signOut } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Button onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      <span>Đăng xuất</span>
    </Button>
  );
};

export default Logout;
