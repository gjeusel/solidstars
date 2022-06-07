import { Component, createEffect } from "solid-js";
import { createResource, Suspense, createMemo } from "solid-js";

import * as dt from "date-fns";

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

const toApiUrl = (repo: string, per_page?: number, page?: number) => {
  const url = new URL(`https://api.github.com/repos/${repo}/stargazers`);
  url.searchParams.set("per_page", String(per_page || 100));
  url.searchParams.set("page", String(page || 1));
  return url;
};

interface GHStargazer {
  starred_at: string;
  user: any;
}

const fetchData = async (source: string[]): Promise<GHStargazer[][]> => {
  // https://docs.github.com/en/rest/activity/starring#about-the-starring-api
  const urls = source.map((repo) => toApiUrl(repo));

  const opts = {
    headers: { Accept: "application/vnd.github.v3.star+json" },
    method: "GET",
  };
  const promises = urls.map((url) => fetch(url, opts));

  const responses = await Promise.all(promises);
  const series = await Promise.all(responses.map((r) => r.json()));
  return series as GHStargazer[][];
};

const ChartComponent: Component<{
  repos: () => string[];
}> = (props) => {
  const [series] = createResource(props.repos, fetchData);

  const starsChartId = "starsChart";

  const starsChartCfg = createMemo(() => {
    if (series() === undefined) return;
    const optsDataset: Partial<LineOptions> = {
      fill: true,
      tension: 0.1,
    };
    const datasets: ChartDatasetProperties<"line", any>[] = series().map(
      (serie, i) => {
        const label = props.repos()[i];
        const data = serie.map((point, i) => ({
          x: point.starred_at,
          y: i + 1,
        }));
        return { data, label, ...optsDataset };
      }
    );

    const minDt = dt.min(datasets.map((e) => dt.parseISO(e.data[0].x)));
    const maxDt = dt.max(
      datasets.map((e) => dt.parseISO(e.data[e.data.length - 1].x))
    );
    const labels = dt.eachDayOfInterval({ start: minDt, end: maxDt });

    const cfg: ChartConfiguration = {
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
    if (starsChartCfg() === undefined) return undefined;
    const ctx = document.getElementById(starsChartId) as HTMLCanvasElement;
    return new Chart(ctx, starsChartCfg());
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
