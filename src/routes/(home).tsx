import { type ParentComponent, Show, createSignal } from "solid-js"
import { Title } from "solid-start"
import { trpc } from "~/utils/trpc"
import Header from "~/components/Header"
import Loader from "~/components/Loader"
import SearchBar from "~/components/SearchBar"

const baseUrl = "https://github.com/"

const [search, setSearch] = createSignal("")
const [searchError, setSearchError] = createSignal("")

const [repos, setRepos] = createSignal(["solidjs/solid", "vuejs/vue"])

const onSubmit = () => {
  setSearchError("")

  let newValue = search()
  if (!search().startsWith(baseUrl)) { newValue = search().replace(baseUrl, "") }

  if (!newValue.length) {
    setSearchError("Empty input")
    return
  }

  if (repos().includes(newValue)) { setRepos(repos().filter(e => e !== newValue)) }
  else { setRepos([...repos(), newValue]) }

  setSearch("")
}

const Home: ParentComponent = () => {
  const res = trpc.hello.useQuery(() => ({ name: "from tRPC" }))

  return (
    <>
      <Title>Home</Title>
      <Header />

      <div class="my-2">
        <SearchBar search={search} onSetSearch={setSearch} onSubmit={onSubmit} />
      </div>

      <pre>{searchError()}</pre>
      <pre>{JSON.stringify(repos())}</pre>

      <Show when={!res.isLoading} fallback={<Loader />}>
        <pre class="font-bold text-2xl text-gray-500">
          {JSON.stringify(res.data)}
        </pre>
      </Show>
    </>
  )
}

export default Home
