import { Metadata } from "next";
import Header from "@/modules/home/header";
import Footer from "@/modules/home/footer";

export const metadata: Metadata = {
  title: {
    template: "VibeCode - Editor",
    default: "Code Editor For VibeCoders- VibeCode",
  },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
       <main className ="z-20 relative w-full pt-0">
       {children}
       </main>
      <Footer />
    </>
  );
}
