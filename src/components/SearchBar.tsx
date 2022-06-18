import type { Component } from "solid-js";

const SearchBar: Component<{
  search: () => string;
  onSetSearch: (search: string) => void;
  onSubmit: () => void;
}> = (props) => {
  return (
    <div class="flex flex-row justify-center">
      <div class="inline-flex justify-center h-12 rounded-full border-2 border-slate-200">
        <input
          type="text"
          class="border-0 rounded-full w-[40rem] rounded-r-none ring-"
          placeholder="solidjs/solid or https://github.com/solidjs/solid"
          value={props.search()}
          onKeyUp={(evt) => props.onSetSearch(evt.currentTarget.value)}
          onKeyPress={(evt) =>
            evt.key === "Enter" ? props.onSubmit() : undefined
          }
        />
        <button
          type="submit"
          class="w-24 hover:bg-slate-200 rounded-full rounded-l-none transition-colors duration-300"
          onClick={props.onSubmit}
        >
          Plot Stars
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
