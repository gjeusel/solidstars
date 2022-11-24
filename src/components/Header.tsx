import type { Component } from 'solid-js'

const Header: Component = () => {
  return (
    <header
      class="flex-row flex justify-around items-center h-12 text-2xl bg-gray-800 text-slate-100"
    >
      <h1>SolidStars</h1>
    </header>
  )
}

export default Header
