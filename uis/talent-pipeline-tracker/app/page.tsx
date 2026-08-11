import { Suspense } from "react";

import { CandidateListPage } from "@/components/candidate-list-page";

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <div className="glass-panel soft-shadow flex w-full flex-col gap-4 rounded-[2rem] p-8 animate-pulse">
            <div className="h-4 w-28 rounded bg-slate-200" />
            <div className="h-10 w-2/3 rounded bg-slate-200" />
            <div className="h-56 rounded-[1.75rem] bg-slate-100" />
          </div>
        </main>
      }
    >
      <CandidateListPage />
    </Suspense>
  );
}
