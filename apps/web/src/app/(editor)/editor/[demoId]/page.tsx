import { notFound } from "next/navigation";

import { EditorShell } from "@/components/editor/editor-shell";

import { getSession } from "@/lib/get-session";
import { getAnnotationService } from "@/lib/services/annotation.service";
import { getDemoService } from "@/lib/services/demo.service";
import { getHotspotService } from "@/lib/services/hotspot.service";
import { getStepService } from "@/lib/services/step.service";
import type { EditorInitialData, EditorStep } from "@/stores/editor/types";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ demoId: string }>;
}) {
  const { demoId } = await params;
  const session = await getSession();
  if (!session) notFound();

  const userId = session.user.id;

  let demo;
  try {
    demo = await getDemoService().getById(demoId, userId);
  } catch {
    notFound();
  }

  const steps = await getStepService().list(demoId, userId);
  const hotspotService = getHotspotService();
  const annotationService = getAnnotationService();

  const editorSteps: EditorStep[] = await Promise.all(
    steps.map(async (step) => {
      const [hotspots, annotations] = await Promise.all([
        hotspotService.listByStep(step.id, userId),
        annotationService.listByStep(step.id, userId),
      ]);

      return {
        id: step.id,
        demoId: step.demoId,
        orderIndex: step.orderIndex,
        screenshotUrl: step.screenshotUrl,
        actionType: step.actionType,
        actionCoordinates: step.actionCoordinates,
        hotspots,
        annotations,
      };
    }),
  );

  const initialData: EditorInitialData = {
    demoId,
    workspaceId: demo.workspaceId,
    demo: {
      title: demo.title,
      description: demo.description,
      slug: demo.slug,
      status: demo.status,
      settings: demo.settings,
    },
    steps: editorSteps,
  };

  return <EditorShell initialData={initialData} />;
}
