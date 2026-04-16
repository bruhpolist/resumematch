import type { FeedbackTip, ResumeFeedback } from "../../../types/analysis";
import { Accordion, AccordionContent, AccordionHeader, AccordionItem } from "./Accordion";

const ScoreBadge = ({ score }: { score: number }) => {
  const bgClass =
    score > 69 ? "bg-[#d5faf1]" : score > 39 ? "bg-[#fceed8]" : "bg-[#f9e3e2]";
  const textClass =
    score > 69 ? "text-[#254d4a]" : score > 39 ? "text-[#73321b]" : "text-[#752522]";

  return (
    <div className={`flex flex-row gap-1 items-center px-2 py-0.5 rounded-[96px] ${bgClass}`}>
      <img
        src={score > 69 ? "/icons/check.svg" : "/icons/warning.svg"}
        alt="score"
        className="size-4"
      />
      <p className={`text-sm font-medium ${textClass}`}>{score}/100</p>
    </div>
  );
};

const CategoryHeader = ({ title, categoryScore }: { title: string; categoryScore: number }) => {
  return (
    <div className="flex flex-row gap-4 items-center py-2">
      <p className="text-2xl font-semibold">{title}</p>
      <ScoreBadge score={categoryScore} />
    </div>
  );
};

const CategoryContent = ({ tips }: { tips: FeedbackTip[] }) => {
  return (
    <div className="flex flex-col gap-4 items-center w-full">
      <div className="bg-gray-50 w-full rounded-lg px-5 py-4 grid grid-cols-2 gap-4">
        {tips.map((tip, index) => (
          <div className="flex flex-row gap-2 items-center" key={index}>
            <img
              src={tip.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"}
              alt="score"
              className="size-5"
            />
            <p className="text-xl text-gray-500">{tip.tip}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4 w-full">
        {tips.map((tip, index) => (
          <div
            key={`${tip.tip}-${index}`}
            className={`flex flex-col gap-2 rounded-2xl p-4 ${
              tip.type === "good"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-yellow-50 border border-yellow-200 text-yellow-700"
            }`}
          >
            <div className="flex flex-row gap-2 items-center">
              <img
                src={tip.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"}
                alt="score"
                className="size-5"
              />
              <p className="text-xl font-semibold">{tip.tip}</p>
            </div>
            <p>{tip.explanation || "No additional explanation provided."}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DetailsAccordion({ feedback }: { feedback: ResumeFeedback }) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <Accordion>
        <AccordionItem id="tone-style">
          <AccordionHeader itemId="tone-style">
            <CategoryHeader title="Tone & Style" categoryScore={feedback.toneAndStyle.score} />
          </AccordionHeader>
          <AccordionContent itemId="tone-style">
            <CategoryContent tips={feedback.toneAndStyle.tips} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem id="content">
          <AccordionHeader itemId="content">
            <CategoryHeader title="Content" categoryScore={feedback.content.score} />
          </AccordionHeader>
          <AccordionContent itemId="content">
            <CategoryContent tips={feedback.content.tips} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem id="structure">
          <AccordionHeader itemId="structure">
            <CategoryHeader title="Structure" categoryScore={feedback.structure.score} />
          </AccordionHeader>
          <AccordionContent itemId="structure">
            <CategoryContent tips={feedback.structure.tips} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem id="skills">
          <AccordionHeader itemId="skills">
            <CategoryHeader title="Skills" categoryScore={feedback.skills.score} />
          </AccordionHeader>
          <AccordionContent itemId="skills">
            <CategoryContent tips={feedback.skills.tips} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

