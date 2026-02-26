"use client";

const columnsData = [
  ["Lovely Professional University", "Amity University", "Manipal Academy", "SRM University", "Christ University", "Ashoka University", "Shiv Nadar University", "Symbiosis International", "Northeastern University", "University of Waterloo", "Arizona State University", "FLAME University"],
  ["VIT Vellore", "Chandigarh University", "OP Jindal Global", "Bennett University", "Woxsen University", "Krea University", "University of Alberta", "Deakin University", "UPES Dehradun", "Plaksha University", "York University", "Seneca College"],
];

export function CollegeMarquee() {
  const maskStyle = {
    maskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
    WebkitMaskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
  };

  return (
    <>
      <div style={{ perspective: "800px" }}>
        <div
          style={{
            display: "flex",
            gap: 48,
            height: 400,
            transform: "rotateY(-22deg) rotateX(8deg)",
          }}
        >
          <div style={{ flex: 1, height: 400, overflow: "hidden", ...maskStyle }}>
            <div className="animate-scroll-up" style={{ display: "flex", flexDirection: "column" }}>
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  {columnsData[0].map((name) => (
                    <p key={`${name}-${i}`} style={{ color: "rgba(147,197,253,0.5)", padding: "12px 0", margin: 0, lineHeight: 1.4, textAlign: "center", fontSize: 22, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>{name}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, height: 400, overflow: "hidden", ...maskStyle }}>
            <div className="animate-scroll-down" style={{ display: "flex", flexDirection: "column" }}>
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  {columnsData[1].map((name) => (
                    <p key={`${name}-${i}`} style={{ color: "rgba(147,197,253,0.5)", padding: "12px 0", margin: 0, lineHeight: 1.4, textAlign: "center", fontSize: 22, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>{name}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap');
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
    </>
  );
}
