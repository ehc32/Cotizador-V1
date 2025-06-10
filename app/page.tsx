import { ProjectOverview } from "../components/project-overview"
import { Header } from "../components/header"
import Chat from "@/components/chat"

export default function Page() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <Chat />
      </main>
    </>
  )
}
