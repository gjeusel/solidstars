import { Component, createEffect, Show, For } from "solid-js";
import { createResource, Suspense, createMemo } from "solid-js";

import * as dt from "date-fns";
import * as client from "../client";

import {
  Chart,
  LineController,
  Legend,
  Title,
  Tooltip,
  TimeSeriesScale,
  LinearScale,
  LineElement,
  PointElement,
} from "chart.js";
import "chartjs-adapter-date-fns"; // needed to parse dates

import type {
  ChartConfiguration,
  LineOptions,
  ChartDatasetProperties,
} from "chart.js";

// Register Line Plot
Chart.register(
  LineController,
  Legend,
  Title,
  Tooltip,
  TimeSeriesScale,
  LinearScale,
  PointElement,
  LineElement
);

interface TimePoint {
  x: Date;
  y: number;
}

const ChartComponent: Component<{
  repos: () => string[];
}> = (props) => {
  const [series] = createResource(
    props.repos,
    async () => {
      const promises = props.repos().map((repo) => client.fetchStars(repo));
      return await Promise.all(promises);
    },
    { initialValue: [] }
  );

  const starsChartId = "starsChart";

  const starsChartCfg = createMemo(() => {
    if (!series().length) return;

    const optsDataset: Partial<LineOptions> = {
      fill: true,
      tension: 0.1,
    };

    const datasets: ChartDatasetProperties<"line", TimePoint[]>[] =
      series().map((serie, i) => {
        const label = props.repos()[i];
        const data = serie.stars.map((point, i) => ({
          x: point.starredAt,
          y: i + 1,
        }));
        return { data, label, ...optsDataset };
      });

    const minDt = dt.startOfMonth(dt.min(datasets.map((e) => e.data[0].x)));
    const maxDt = dt.startOfMonth(
      dt.addMonths(dt.max(datasets.map((e) => e.data[e.data.length - 1].x)), 1)
    );
    const labels = dt.eachMonthOfInterval({ start: minDt, end: maxDt });

    const cfg: ChartConfiguration<"line", TimePoint[], Date> = {
      type: "line",
      data: { labels, datasets },
      options: {
        scales: {
          x: {
            type: "time",
            grid: { drawOnChartArea: false },
            ticks: { source: "labels" },
            time: { unit: "month" },
          },
        },
      },
    };
    return cfg;
  });

  let chart: Chart<any, any, any> | undefined = undefined;

  createEffect(() => {
    const cfg = starsChartCfg();
    if (!cfg) return;

    const ctx = document.getElementById(
      starsChartId
    ) as HTMLCanvasElement | null;
    if (!ctx) return;

    if (chart !== undefined) chart.destroy();
    chart = new Chart(ctx, cfg);
    return chart;
  });

  return (
    <div>
      <ul class="list-none space-y-4">
        <For each={props.repos()}>{(item) => <li>{item}</li>}</For>
      </ul>
      <Show when={series.loading}>
        <div class="h-96 flex">
          <IconUiwLoading class="mx-auto self-center animate-spin-slow duration-75 text-slate-400 h-10 w-10" />
        </div>
      </Show>

      <Show when={!series.loading}>
        <div class="w-[60rem] mx-auto">
          <canvas id={starsChartId} />
        </div>
      </Show>
    </div>
  );
};

export default ChartComponent;
