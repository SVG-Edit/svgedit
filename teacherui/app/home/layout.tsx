import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./_component/sidebar";
import { Navbar } from "./_component/navbar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full">
      <div className="h-[80px] md:pl-56 fixed inset-y-0 w-full z-50">
        <Navbar />
      </div>

      <div className="hidden md:flex h-full w-56 flex-col fixed inset-y-0 z-50">
        <Sidebar />
      </div>

      <main className="md:pl-56 pt-[80px] h-full">{children}</main>
    </div>
  );
};

export default DashboardLayout;
