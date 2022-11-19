import type { Component } from 'solid-js'

const Loader: Component = () => {
  return (
    <div class="h-full w-full flex justify-center items-center flex-col">
      <IconFa6SolidSpinner class="animate-spin-slow mx-auto self-center duration-75 text-slate-400 h-10 w-10" />
    </div>
  )
}

export default Loader
