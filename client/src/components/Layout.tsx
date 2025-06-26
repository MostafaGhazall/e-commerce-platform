import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const hideOnRoutes = ["/login", "/register"];
  const shouldHide = hideOnRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHide && <Navbar />}
      <main className="min-h-screen">{children}</main>
      {!shouldHide && <Footer />}
    </>
  );
}
