import { compatibilitySummary } from "@strk20-workbench/lab-core";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-20">
      <p className="mb-5 w-fit rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-200">
        Sandbox · Simulated proof
      </p>
      <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.045em] text-white sm:text-7xl">
        Build private Starknet apps without the heavy setup.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
        STRK20 Workbench will let developers run, inspect, and debug a complete
        privacy workflow, then graduate it to a supported wallet on mainnet.
      </p>
      <dl className="mt-12 grid gap-3 text-sm sm:grid-cols-3">
        <Status label="Mode" value="Sandbox" />
        <Status label="Proof" value="Simulated" />
        <Status label="Real route" value={compatibilitySummary.realRoute} />
      </dl>
    </main>
  );
}

function Status({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-1 font-medium text-slate-100">{value}</dd>
    </div>
  );
}
