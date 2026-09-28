import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function RouteProgressBar() {
  const location = useLocation();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setActive(true);
    setProgress(30);

    const t1 = setTimeout(() => setProgress(75), 60);
    const t2 = setTimeout(() => {
      setProgress(100);
      const t3 = setTimeout(() => {
        setActive(false);
        setProgress(0);
      }, 150);
      return () => clearTimeout(t3);
    }, 180);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [location.pathname]);

  if (!active && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 pointer-events-none overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-green-600 transition-all duration-200 ease-out shadow-[0_0_10px_rgba(249,115,22,0.8)]"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
