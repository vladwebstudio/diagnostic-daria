import { useState } from "react";

interface Props {
  src: string;
  alt: string;
  initials: string;
  className?: string;
}

/** Фото з фолбеком: якщо файла в public/images немає, показуємо ініціали. */
export default function Photo({ src, alt, initials, className = "" }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 font-bold tracking-wider text-white/90 ${className}`}
      >
        {initials}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
