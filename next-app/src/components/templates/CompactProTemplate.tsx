import type { ResumeData } from "../../models";
import { resolveImageSrc } from "../../lib/resolveImageSrc";



const RoundBadge = ({
  title,
  accentColor,
  bgColor,
}: {
  title: string;
  accentColor: string;
  bgColor: string;
}) => (
  <div
    className="inline-flex items-center rounded-full px-6 py-2 text-[15px] font-bold uppercase tracking-wide text-white shadow-sm"
    style={{ background: `linear-gradient(90deg, ${bgColor}, ${accentColor})` }}
  >
    {title}
  </div>
);

export default function CompactProTemplate({
  data,
  accentColor,
}: {
  data: ResumeData;
  accentColor: string;
}) {
  const photo = resolveImageSrc(data.personal_info.image);
  const softPurple = "#8f63df";
  const softGreen = "#90d53f";
  const softPink = "#ef4f9c";
  const softOrange = "#ffb223";

  return (
    <div className="resume-page relative mx-auto max-w-4xl overflow-hidden bg-[#f6f6fb] px-8 py-8 text-slate-800">
      <div className="absolute left-0 top-0 h-52 w-72 bg-white/70" style={{ clipPath: "polygon(0 0, 100% 0, 58% 100%, 0 100%)" }} />
      <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-slate-300" />

      <header className="relative z-10 flex flex-col items-center">
        <div className="flex w-full items-start justify-between gap-6">
          <div className="max-w-[44%]">
            <h1 className="text-[34px] font-light uppercase tracking-wide">{data.personal_info.full_name || "Christindoe"}</h1>
            <p className="mt-1 text-[18px] text-slate-500">{data.personal_info.profession || "Your Profession Here"}</p>
          </div>
          <div className="flex max-w-[46%] gap-4 text-[11px] text-slate-500">
            <div className="space-y-2">
              <p>{data.personal_info.phone || "123 456 789"}</p>
              <p>{data.personal_info.website || "yourdomain.com"}</p>
            </div>
            <div className="space-y-2">
              <p>{data.personal_info.location || "Your full address here"}</p>
              <p>{data.personal_info.email || "email@address.com"}</p>
            </div>
          </div>
        </div>

        <div className="relative mt-4 h-36 w-36 overflow-hidden rounded-full border-[8px] border-white shadow-lg">
          <div className="absolute inset-[-8px] rounded-full" style={{ background: `linear-gradient(135deg, ${accentColor}, ${softPurple})` }} />
          <div className="absolute inset-[8px] overflow-hidden rounded-full bg-slate-200">
            {photo ? <img src={photo} alt="Profile" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-slate-300" />}
          </div>
        </div>
      </header>

      <div className="relative z-10 mt-7 grid grid-cols-2 gap-x-10 gap-y-8">
        <section>
          <RoundBadge title="About Me" accentColor={accentColor} bgColor={softOrange} />
          <p className="resume-copy mt-4 text-slate-600">
            {data.professional_summary ||
              "Write a concise profile summary here. This template emphasizes connected nodes, rounded labels, and a central structural axis."}
          </p>
        </section>

        <section>
          <RoundBadge title="Education" accentColor={accentColor} bgColor={softPurple} />
          <div className="mt-4 space-y-4">
            {data.education.slice(0, 4).map((edu, index) => (
              <div key={`${edu.institution}-${index}`} className="relative pl-5 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-slate-500">
                <p className="text-[13px] font-semibold text-slate-700">
                  {String(edu.graduation_date).slice(0, 4)}-{String(edu.graduation_date).slice(0, 4)}
                </p>
                <p className="text-[13px] font-bold">{edu.degree || "Enter your degree"}</p>
                <p className="text-[12px] text-slate-500">{edu.institution || "Enter your school"}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <RoundBadge title="Skills" accentColor={accentColor} bgColor={softOrange} />
          <div className="mt-4 space-y-3">
            {data.skills.slice(0, 4).map((skill, index) => {
              const value = 45 + ((index * 15) % 35);
              return (
                <div key={skill}>
                  <div className="mb-1 flex items-center justify-between text-[13px]">
                    <span className="truncate pr-2">{skill}</span>
                    <span>{value}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-orange-100">
                    <div className="h-full rounded-full" style={{ width: `${value}%`, background: `linear-gradient(90deg, ${softOrange}, ${accentColor})` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <RoundBadge title="Experience" accentColor={accentColor} bgColor={softGreen} />
          <div className="mt-4 space-y-4">
            {data.experience.slice(0, 4).map((exp, index) => (
              <div key={`${exp.company}-${index}`} className="relative pl-5 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-slate-500">
                <p className="text-[13px] font-semibold text-slate-700">
                  {String(exp.start_date).slice(0, 4)}-{exp.is_current ? "Present" : String(exp.end_date).slice(0, 4)}
                </p>
                <p className="text-[13px] font-bold">{exp.position || "Enter your job position"}</p>
                <p className="text-[12px] text-slate-500">{exp.company || "Enter your company"}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <RoundBadge title="Language" accentColor={accentColor} bgColor={softPink} />
          <div className="mt-4 flex gap-4">
            {["English", "Spanish", "French"].map((lang, index) => (
              <div key={lang} className="flex flex-col items-center gap-2">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full border-[5px] bg-white text-[10px] font-semibold uppercase"
                  style={{ borderColor: [softPink, accentColor, softOrange][index] }}
                >
                  {lang.slice(0, 3)}
                </div>
                <span className="text-[11px] text-slate-500">{lang}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

