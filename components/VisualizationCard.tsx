import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { spacing } from "../lib/colors";
import Link from "next/link";
import { VerticalBarChart } from "./charts/charts";

interface ChartDataItem {
  value: string;
  count: number;
  [key: string]: string | number;
}

interface VisualizationCardProps {
  data: ChartDataItem[];
}

function VisualizationCard({ data }: VisualizationCardProps) {
  return (
    <Card className="shadow-sm p-6">
      <CardContent className="p-0">
        <VerticalBarChart
          data={data
            .slice(0, 11)
            .reverse()
            .map((x) => ({ ...x, value: x.value, count: parseInt(x.value) }))}
        />
      </CardContent>

      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 5, marginTop: spacing.sm }}
      >
        <p className="text-sm">Anzahl der Todesschüsse 2010–2020</p>
      </div>

      <Button variant="secondary" className="w-full mt-3.5" asChild>
        <Link href="/visualisierungen">Visualisierungen</Link>
      </Button>
    </Card>
  );
}

export default VisualizationCard;
