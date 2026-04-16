export default function ScoreBadge({ score }: { score: number }) {
  let label = "Needs Work";
  let className = "bg-[#f9e3e2] text-[#752522]";

  if (score > 70) {
    label = "Strong";
    className = "bg-[#d5faf1] text-[#254d4a]";
  } else if (score > 49) {
    label = "Good Start";
    className = "bg-[#fceed8] text-[#73321b]";
  }

  return (
    <div
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      <p>{label}</p>
    </div>
  );
}

