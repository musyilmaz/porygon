"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@porygon/ui/components/card";

interface TopReferrersTableProps {
  referrers: { referrer: string; count: number }[];
}

export function TopReferrersTable({ referrers }: TopReferrersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Referrers</CardTitle>
      </CardHeader>
      <CardContent>
        {referrers.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No referrer data yet
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 font-medium">Source</th>
                <th className="pb-2 text-right font-medium">Views</th>
              </tr>
            </thead>
            <tbody>
              {referrers.map((r) => (
                <tr key={r.referrer} className="border-b last:border-0">
                  <td className="py-2">{r.referrer}</td>
                  <td className="py-2 text-right tabular-nums">
                    {r.count.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
