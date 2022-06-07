import type { Component } from "solid-js";

const Header: Component = () => {
  return (
    <header class="flex flex-row text-2xl justify-around bg-gray-800 text-slate-100 h-12 items-center">
      <h1>SolidStars</h1>
    </header>
  );
};

export default Header;
