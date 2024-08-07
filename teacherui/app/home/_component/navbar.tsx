import { MobileSidebar } from "./mobile_sidebar";
//import { NavbarRoutes } from "@/components/ui/navbar-routes"
export const Navbar = () => {
  return (
    <div className="p-4 boder-b h-full flex items-center bg-white shadow-sm ">
      <MobileSidebar />
    </div>
  );
};
