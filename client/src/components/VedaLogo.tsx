import Image from 'next/image';

export default function VedaLogo({ size = 36 }: { size?: number }) {
  return (
    <Image
      src="/logo.avif"
      alt="VedaAI"
      width={size}
      height={size}
      className="rounded-xl"
      style={{ width: size, height: size, objectFit: 'cover' }}
      unoptimized
    />
  );
}
