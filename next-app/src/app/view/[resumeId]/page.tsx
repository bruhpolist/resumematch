export default async function ViewPage({ params }: { params: Promise<{ resumeId: string }> }) {
  const { resumeId } = await params;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Public view migration in progress</h1>
      <p className="mt-3 text-slate-600">Resume ID: {resumeId}</p>
    </div>
  );
}
