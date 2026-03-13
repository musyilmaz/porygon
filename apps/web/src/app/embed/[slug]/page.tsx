import type { PlayerConfig } from "@porygon/player";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EmbedPlayer } from "./embed-player";

import { getPublicDemoService } from "@/lib/services/public-demo.service";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const demo = await getPublicDemoService().getBySlug(slug);
    return {
      title: demo.title,
      robots: { index: false, follow: false },
    };
  } catch {
    return {
      title: "Demo not found",
      robots: { index: false, follow: false },
    };
  }
}

export default async function EmbedPage({ params }: Props) {
  const { slug } = await params;

  let demo;
  try {
    demo = await getPublicDemoService().getBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <>
      <EmbedPlayer config={demo as unknown as PlayerConfig} />
    </>
  );
}

export const revalidate = 300;
