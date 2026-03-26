export default function ScriptsLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-slate-500 border-t-slate-200"
          role="status"
          aria-label="Loading scripts"
        />
        <p className="text-sm text-slate-400">Loading scripts…</p>
      </div>
    </div>
  )
}
