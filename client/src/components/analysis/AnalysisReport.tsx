import type { ResumeFeedback } from "../../types/analysis";
import ATSCard from "./ui/ATSCard";
import DetailsAccordion from "./ui/DetailsAccordion";
import SummaryCard from "./ui/SummaryCard";

const ListBlock = ({ title, items }: { title: string; items: string[] }) => (
  <div className="bg-white rounded-2xl shadow-md p-6">
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    {items.length === 0 ? (
      <p className="text-gray-500">No data yet.</p>
    ) : (
      <ul className="list-disc pl-6 space-y-1 text-gray-700">
        {items.map((item) => (
          <li key={`${title}-${item}`}>{item}</li>
        ))}
      </ul>
    )}
  </div>
);

export default function AnalysisReport({ feedback }: { feedback: ResumeFeedback }) {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
      <SummaryCard feedback={feedback} />
      <ATSCard score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
      <DetailsAccordion feedback={feedback} />
      <ListBlock title="Strengths" items={feedback.strengths} />
      <ListBlock title="Weaknesses" items={feedback.weaknesses} />
      <ListBlock title="Recommendations" items={feedback.recommendations} />
      <ListBlock title="Errors & Gaps" items={feedback.errorsAndGaps} />

      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-xl font-semibold mb-3">Improved Phrasings</h3>
        {feedback.improvedPhrasings.length === 0 ? (
          <p className="text-gray-500">No phrasing suggestions yet.</p>
        ) : (
          <div className="space-y-3">
            {feedback.improvedPhrasings.map((item, index) => (
              <div
                key={`${item.original}-${index}`}
                className="rounded-xl border border-blue-200 bg-blue-50 p-4"
              >
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Original:</span> {item.original}
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  <span className="font-semibold">Improved:</span> {item.improved}
                </p>
                {item.reason && (
                  <p className="text-sm text-slate-700 mt-1">
                    <span className="font-semibold">Reason:</span> {item.reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

