import { AnalyticsView } from "@/components/dashboard/analytics/analytics-view";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ demoId: string }>;
}) {
  const { demoId } = await params;
  return <AnalyticsView demoId={demoId} />;
}
