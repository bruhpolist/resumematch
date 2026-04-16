import type { ResumeData } from "../../models";
import { resolveImageSrc } from "../../lib/resolveImageSrc";



const formatDate = (dateStr: Date | string): string => {
  if (!dateStr) return "";
  const [year, month] = String(dateStr).split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
};

const SectionPill = ({ title, accentColor }: { title: string; accentColor: string }) => (
  <div
    className="inline-flex items-center rounded-full border-[3px] px-5 py-1 text-[13px] font-bold uppercase tracking-wide"
    style={{ borderColor: accentColor, color: "#404040" }}
  >
    {title}
  </div>
);

export default function ExecutiveTemplate({
  data,
  accentColor,
}: {
  data: ResumeData;
  accentColor: string;
}) {
  const photo = resolveImageSrc(data.personal_info.image);
  const skills = data.skills.slice(0, 5);

  return (
    <div className="resume-page mx-auto grid max-w-4xl grid-cols-[225px_1fr] bg-white text-slate-800">
      <aside className="relative px-5 py-7" style={{ backgroundColor: `${accentColor}22` }}>
        <div
          className="absolute left-0 top-0 h-56 w-full"
          style={{ background: `linear-gradient(180deg, ${accentColor}, ${accentColor}88)` }}
        />
        <div
          className="absolute right-0 top-0 h-28 w-20 bg-white"
          style={{ clipPath: "ellipse(95% 100% at 100% 0%)" }}
        />

        <div className="relative z-10 mx-auto mt-4 h-40 w-40 overflow-hidden rounded-full border-[6px] border-white shadow-lg">
          {photo ? (
            <img src={photo} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-slate-200" />
          )}
        </div>

        <div className="relative z-10 mt-7">
          <SectionPill title="Contact Me" accentColor={accentColor} />
          <div className="resume-meta mt-4 space-y-2 text-slate-700">
            <p>{data.personal_info.phone || "+000-111-222-333"}</p>
            <p>{data.personal_info.location || "Your address here"}</p>
            <p>{data.personal_info.email || "your@email.com"}</p>
            <p>{data.personal_info.website || "www.website.com"}</p>
            <p>{data.personal_info.linkedin || "linkedin.com/in/you"}</p>
          </div>
        </div>

        <div className="relative z-10 mt-7">
          <SectionPill title="Education" accentColor={accentColor} />
          <div className="mt-4 space-y-3.5">
            {data.education.slice(0, 3).map((edu, index) => (
              <div key={`${edu.institution}-${index}`}>
                <p className="text-[13px] font-bold uppercase" style={{ color: accentColor }}>
                  {edu.institution || "University"}
                </p>
                <p className="text-[12px] font-semibold text-slate-600">
                  {edu.degree} {edu.field}
                </p>
                <p className="text-[11px] text-slate-500">{formatDate(edu.graduation_date)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-7">
          <SectionPill title="Reference" accentColor={accentColor} />
          <div className="resume-meta mt-4 space-y-3 text-slate-700">
            <div>
              <p className="font-bold uppercase" style={{ color: accentColor }}>
                {data.personal_info.full_name || "Reference Name"}
              </p>
              <p>{data.personal_info.location || "Any city"}</p>
              <p>{data.personal_info.phone || "+000-111-222-333"}</p>
              <p>{data.personal_info.email || "mail@example.com"}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="px-7 py-7">
        <header>
          <h1 className="text-[46px] font-black uppercase leading-[0.9] tracking-tight">
            {data.personal_info.full_name || "Anne Robertson"}
          </h1>
          <p className="mt-2 text-[21px] uppercase tracking-[0.18em] text-slate-600">
            {data.personal_info.profession || "Graphic Designer"}
          </p>
          <div className="mt-4 h-1.5 w-44 rounded-full" style={{ backgroundColor: accentColor }} />
        </header>

        <section className="mt-8">
          <SectionPill title="Job Experience" accentColor={accentColor} />
          <div className="mt-5 space-y-4">
            {data.experience.slice(0, 3).map((exp, index) => (
              <div key={`${exp.company}-${index}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[20px] font-extrabold uppercase leading-none" style={{ color: accentColor }}>
                      {exp.position || "Senior Designer"}
                    </p>
                    <p className="mt-1 text-[14px] font-semibold text-slate-600">
                      {exp.company || "Creative Agency"}
                    </p>
                  </div>
                  <p className="pt-1 text-[13px] font-medium text-slate-500">
                    {formatDate(exp.start_date)} - {exp.is_current ? "Present" : formatDate(exp.end_date)}
                  </p>
                </div>
                <p className="resume-copy mt-2 whitespace-pre-line text-slate-600">
                  {exp.description || "Describe responsibilities, impact, and achievements here."}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <SectionPill title="Skills" accentColor={accentColor} />
          <div className="mt-5 space-y-4">
            {skills.map((skill, index) => {
              const value = 58 + ((index * 11) % 32);
              return (
                <div key={skill} className="grid grid-cols-[150px_1fr_42px] items-center gap-3">
                  <p className="truncate text-[14px] font-semibold text-slate-700">{skill}</p>
                  <div className="h-3 overflow-hidden rounded-full bg-gray-300">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${value}%`, backgroundColor: accentColor }}
                    />
                  </div>
                  <p className="text-[14px] font-semibold text-slate-600">{value}%</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-8">
          <SectionPill title="About Me" accentColor={accentColor} />
          <p className="resume-copy mt-4 whitespace-pre-line text-slate-600">
            {data.professional_summary ||
              "Use this section for a concise summary of your background, strengths, and the type of work you do best."}
          </p>
        </section>
      </main>
    </div>
  );
}

