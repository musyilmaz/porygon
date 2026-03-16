import type { PlayerConfig } from "@porygon/player";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SharePlayer } from "./share-player";

import { getPublicDemoService } from "@/lib/services/public-demo.service";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const demo = await getPublicDemoService().getBySlug(slug);
    const description =
      demo.description ?? "Interactive product demo powered by Porygon";
    const ogImage = demo.steps[0]?.screenshotUrl;

    return {
      title: `${demo.title} | Porygon`,
      description,
      openGraph: {
        title: demo.title,
        description,
        type: "website",
        ...(ogImage && { images: [{ url: ogImage }] }),
      },
      twitter: {
        card: "summary_large_image",
        title: demo.title,
        description,
        ...(ogImage && { images: [ogImage] }),
      },
    };
  } catch {
    return {
      title: "Demo not found | Porygon",
    };
  }
}

export default async function SharePage({ params }: Props) {
  const { slug } = await params;

  let demo;
  try {
    demo = await getPublicDemoService().getBySlug(slug);
  } catch {
    notFound();
  }

  return <SharePlayer config={demo as unknown as PlayerConfig} />;
}

export const revalidate = 300;
