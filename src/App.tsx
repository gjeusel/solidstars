import type { Component } from "solid-js";
import { createSignal, Show } from "solid-js";

import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import Chart from "./components/Chart";

const baseUrl = "https://github.com/";

const [search, setSearch] = createSignal("");
const [searchError, setSearchError] = createSignal(false);

const [repos, setRepos] = createSignal(["solidjs/solid", "vuejs/vue"]);

const onSubmit = () => {
  let newValue = search();
  if (!search().startsWith(baseUrl)) newValue = search().replace(baseUrl, "");

  if (repos().includes(newValue))
    setRepos(repos().filter((e) => e != newValue));
  else setRepos([...repos(), newValue]);

  setSearch("")
};

const App: Component = () => {
  return (
    <div class="text-gray-600 h-screen">
      <div class="mb-4">
        <Header />
      </div>

      <SearchBar search={search} onSetSearch={setSearch} onSubmit={onSubmit} />

      <div class="my-4">
        <Show when={repos().length}>
          <Chart repos={repos} />
        </Show>
      </div>
    </div>
  );
};

export default App;
