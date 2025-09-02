import { Container, Text } from "@mantine/core";
import Image from "next/image";
import { useEffect, useState } from "react";
import goa2025 from "../public/images/grimme-online-2025.jpg";

export default function StatusBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // Check initial screen size
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const logoHeight = isMobile 
    ? (isScrolled ? 30 : 45)
    : (isScrolled ? 40 : 60);

  return (
    <div className={`status-bar ${isScrolled ? "scrolled" : ""} ${isMobile ? "mobile" : ""}`}>
      <Container size="xl">
        <div className="status-bar-layout">
          <div className="status-bar-top-row">
            <a
              href="https://www.grimme-online-award.de/2025/nominierte/nominierte-detail/d/chronik-polizeilicher-todesschuesse-1976-2025"
              target="_blank"
              rel="noopener noreferrer"
              className="nomination-logo-link"
            >
              <Image
                src={goa2025}
                alt="Nominiert Grimme Online Award 2025"
                className="nomination-logo"
                height={logoHeight}
                width="auto"
                style={{
                  height: `${logoHeight}px`,
                  width: "auto",
                  transition: "all 0.3s ease",
                }}
              />
            </a>
            {!isMobile && (
              <div className="status-text-group">
                <Text 
                  size={isScrolled ? "sm" : "md"} 
                  weight={600} 
                  color="dark"
                >
                  Nominiert für den Grimme Online Award
                </Text>
                <Text
                  size="xs"
                  color="dimmed"
                  className={isScrolled ? "hide-on-scroll" : ""}
                >
                  Stimme jetzt beim Publikumspreis für unser Projekt ab!
                </Text>
              </div>
            )}
            <a
              href="https://www.grimme-online-award.de/voting"
              className="vote-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Text 
                size={isMobile ? "sm" : (isScrolled ? "sm" : "md")} 
                weight={600} 
                color="white"
              >
                Abstimmen →
              </Text>
            </a>
          </div>
          {isMobile && (
            <div className="status-text-group-mobile">
              <Text 
                size="xs" 
                weight={500} 
                color="dark"
                className={isScrolled ? "hide-on-scroll" : ""}
              >
                Stimme beim Publikumspreis für unser Projekt ab!
              </Text>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
