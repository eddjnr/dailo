'use client'
import dynamic from "next/dynamic";

const ExcalidrawWrapper = dynamic(
  async () => (await import("../../components/excalidraw/wrapper")).default,
  {
    ssr: false,
  },
);

export default function Page() {
  return (
    <ExcalidrawWrapper />
  );
}