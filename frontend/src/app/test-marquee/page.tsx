"use client";


export default function TestMarquee() {
  return (
    <div style={{ padding: 40, background: "#111", minHeight: "100vh" }}>
      <h1 style={{ color: "white", marginBottom: 20 }}>Marquee + Tilt Test</h1>

      <div style={{ perspective: "800px" }}>
        <div
          style={{
            display: "flex",
            gap: 48,
            height: 400,
            width: 300,
            transform: "rotateY(-14deg) rotateX(5deg)",
          }}
        >
          {/* Column 1 - scrolling up */}
          <div style={{ flex: 1, height: 400, overflow: "hidden", maskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)" }}>
            <div className="animate-scroll-up" style={{ display: "flex", flexDirection: "column" }}>
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  {["IIT Bombay", "MIT", "Stanford", "IIT Delhi", "Harvard", "BITS Pilani", "IISc Bangalore", "University of Toronto", "IIT Madras", "NIT Trichy", "Delhi University", "JNU Delhi"].map((name) => (
                    <p key={`${name}-${i}`} style={{ color: "white", padding: "12px 0", margin: 0, lineHeight: 1.4, textAlign: "center", fontSize: 18 }}>{name}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Column 2 - scrolling down */}
          <div style={{ flex: 1, height: 400, overflow: "hidden", maskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)" }}>
            <div className="animate-scroll-down" style={{ display: "flex", flexDirection: "column" }}>
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  {["Yale", "Caltech", "IIT Roorkee", "McGill", "UC Berkeley", "IIT Hyderabad", "Anna University", "Jadavpur University", "AIIMS Delhi", "ISI Kolkata", "IIT Guwahati", "UBC"].map((name) => (
                    <p key={`${name}-${i}`} style={{ color: "white", padding: "12px 0", margin: 0, lineHeight: 1.4, textAlign: "center", fontSize: 18 }}>{name}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-33.33%); }
        }
        @keyframes scrollDown {
          0% { transform: translateY(-33.33%); }
          100% { transform: translateY(0); }
        }
        .animate-scroll-up {
          animation: scrollUp 20s linear infinite;
        }
        .animate-scroll-down {
          animation: scrollDown 25s linear infinite;
        }
      `}</style>
    </div>
  );
}
