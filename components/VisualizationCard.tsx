import { Button, Card, Group, Text, useMantineTheme } from "@mantine/core";
import React from "react";
import TimeChart from "./TimeChart";

function VisualizationCard({ data }) {
  const theme = useMantineTheme();

  return (
    <Card shadow="sm" padding="lg">
      <Card.Section>
        <TimeChart
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

      <Button
        variant="light"
        color="indigo"
        fullWidth
        style={{ marginTop: 14 }}
      >
        Weitere Visualisierungen
      </Button>
    </Card>
  );
}

export default VisualizationCard;
