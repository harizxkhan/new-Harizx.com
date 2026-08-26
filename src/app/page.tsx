import SmoothScroll from "@/components/animations/SmoothScroll";
import CustomCursor from "@/components/animations/CustomCursor";
import BrandIdent from "@/components/layout/BrandIdent";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/hero/Hero";
import Marquee from "@/components/sections/Marquee";
import Integrations from "@/components/sections/Integrations";
import Problem from "@/components/sections/Problem";
import Services from "@/components/services/Services";
import SystemProcess from "@/components/sections/SystemProcess";
import WorkShowcase from "@/components/work/WorkShowcase";
import About from "@/components/about/About";
import WhyUs from "@/components/sections/WhyUs";
import Technology from "@/components/sections/Technology";
import FinalCTA from "@/components/sections/FinalCTA";
import ContactForm from "@/components/contact/ContactForm";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <SmoothScroll>
      <BrandIdent />
      <CustomCursor />
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Integrations />
        <Problem />
        <Services />
        <SystemProcess />
        <WorkShowcase />
        <About />
        <WhyUs />
        <Technology />
        <FinalCTA />
        <ContactForm />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
