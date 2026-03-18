import { createFileRoute } from '@tanstack/react-router'
import ImportFloor from '../components/ImportFloor'

export const Route = createFileRoute('/testImport')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ImportFloor />
}

