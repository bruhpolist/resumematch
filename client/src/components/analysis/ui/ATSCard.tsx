import type { FeedbackTip } from "../../../types/analysis";

export default function ATSCard({
  score,
  suggestions,
}: {
  score: number;
  suggestions: FeedbackTip[];
}) {
  const bgGradient =
    score > 69 ? "from-green-100" : score > 49 ? "from-yellow-100" : "from-red-100";

  const icon =
    score > 69 ? "/icons/ats-good.svg" : score > 49 ? "/icons/ats-warning.svg" : "/icons/ats-bad.svg";

  return (
    <div className={`bg-gradient-to-b ${bgGradient} to-white rounded-2xl shadow-md p-6`}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <img src={icon} alt="ATS Score" className="w-12 h-12" />
          <h3 className="text-2xl font-bold">ATS Score - {score}/100</h3>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-2">
            Optimization Tips for Applicant Tracking Systems
          </h4>
          <p className="text-gray-600">
            Applicant Tracking Systems (ATS) scan resumes for relevant keywords.
            These suggestions will help optimize your resume for better compatibility with automated screening systems.
          </p>
        </div>

        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-2">
              <img
                src={suggestion.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"}
                alt={suggestion.type}
                className="w-5 h-5 mt-1"
              />
              <p className="text-gray-700">{suggestion.tip}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-500">
          Implement these suggestions to help your resume pass through ATS filters and reach recruiters!
        </p>
      </div>
    </div>
  );
}

