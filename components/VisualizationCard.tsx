import { Button, Card, Group, Text, useMantineTheme } from "@mantine/core";
import Link from "next/link";
import { VerticalBarChart } from "./charts";

function VisualizationCard({ data }) {
  const theme = useMantineTheme();

  return (
    <Card shadow="sm" padding="lg">
      <Card.Section>
        <VerticalBarChart
          data={data
            .slice(0, 11)
            .reverse()
            .map((x) => ({ ...x, value: parseInt(x.value) }))}
        />
      </Card.Section>

      <Group
        position="apart"
        style={{ marginBottom: 5, marginTop: theme.spacing.sm }}
      >
        <Text size="sm">Anzahl der Todesschüsse 2010–2020</Text>
      </Group>

      <Link href="/visualisierungen" passHref>
        <Button
          variant="light"
          // color="indigo"
          fullWidth
          style={{ marginTop: 14 }}
        >
          Visualisierungen
        </Button>
      </Link>
    </Card>
  );
}

export default VisualizationCard;
