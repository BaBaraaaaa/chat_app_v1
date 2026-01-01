import { Button } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router";

const Logout = () => {
  const { signOut } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await signOut().finally(()=>{
        navigate("/login", { replace: true });
      });
      
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Button 
      variant="contained" 
      color="error" 
      startIcon={<LogoutIcon />}
      onClick={handleLogout}
    >
      Đăng xuất
    </Button>
  );
};

export default Logout;
