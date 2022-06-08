import { Component, createEffect } from "solid-js";
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

    const minDt = dt.min(datasets.map((e) => e.data[0].x));
    const maxDt = dt.max(datasets.map((e) => e.data[e.data.length - 1].x));
    const labels = dt.eachDayOfInterval({ start: minDt, end: maxDt });

    const cfg: ChartConfiguration<"line", TimePoint[], Date> = {
      type: "line",
      data: { labels, datasets },
      options: {
        scales: {
          x: {
            type: "timeseries",
            grid: { drawOnChartArea: false },
            ticks: { source: "labels" },
            time: { unit: "day", displayFormats: { day: "yyyy-MM-dd" } },
          },
        },
      },
    };
    return cfg;
  });

  createEffect(() => {
    const cfg = starsChartCfg();
    if (cfg === undefined) return;
    const ctx = document.getElementById(starsChartId) as HTMLCanvasElement;
    return new Chart(ctx, cfg);
  });

  return (
    <div>
      {/* <div> */}
      {/*   <For each={props.repos()}>{(item) => <span>{item}</span>}</For> */}
      {/* </div> */}
      <Suspense fallback={<p>Loading...</p>}>
        <div class="w-[60rem] mx-auto">
          <canvas id={starsChartId} />
        </div>
      </Suspense>
    </div>
  );
};

export default ChartComponent;
