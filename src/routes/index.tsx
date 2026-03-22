import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { Input } from "#/components/ui/input"
import { getTodos } from "#/server/todo.functions"
import { ThreeScene } from "#/components/threeJS/map-scene"

const App = () => {
  const { data: todos } = useQuery({ queryKey: ["todos"], queryFn: getTodos })
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      {todos?.map((todo) => (
        <div key={todo.id}>
          <h1>{todo.title}</h1>
        </div>
      ))}
      <Input type="text" placeholder="Add a todo" />
      <div style={{ width: "100%", height: "600px" }}>
        <ThreeScene />
      </div>
    </main>
  )
}

export const Route = createFileRoute("/")({ component: App })
