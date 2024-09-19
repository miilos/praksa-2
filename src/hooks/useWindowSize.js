import { useEffect, useState } from "react";

function getWindowSize() {
  const { innerWidth: width, innerHeight: height } = window;

  return {
    width,
    height,
  };
}

export default function useWindowSize() {
  const [dimensions, setDimensions] = useState(getWindowSize);

  useEffect(() => {
    function handleResize() {
      setDimensions(getWindowSize());
    }

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return dimensions;
}
