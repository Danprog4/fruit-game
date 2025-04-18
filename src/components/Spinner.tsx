import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export const FullPageSpinner = () => {
  const [show, setShow] = useState(false);

  console.log("beg");

  // this is a good pattern, чтобы ничего не моргало на быстром инете йоу
  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  console.log("add of the spinner");

  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin" />
    </div>
  );
};
