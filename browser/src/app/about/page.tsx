import Head from "next/head"
import GoBack from "@/components/GoBack"

export default function About() {
  return (
    <div>
      <Head>
        <title>RLN - About</title>
        <meta name="title" content="RLN - About" />
        <meta name="description" content="Semaphore & RLN Benchmarks" />
      </Head>
      <div className="mb-10">
        <GoBack />
      </div>
      <div className="grid place-items-center">
        <div className="flex justify-center items-center mb-10 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500">
          Semaphore and RLN Benchmarks
        </div>
        <div className="flex justify-center items-center text-lg md:w-96 w-auto text-slate-300">
          App to show Semaphore v4 and RLN benchmarks
        </div>
      </div>
    </div>
  )
}
