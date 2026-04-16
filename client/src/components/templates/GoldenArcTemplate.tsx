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

const Pill = ({ title, accentColor }: { title: string; accentColor: string }) => (
  <div
    className="inline-flex rounded-full border-[3px] px-5 py-1 text-[12px] font-bold uppercase tracking-wide"
    style={{ borderColor: accentColor, color: "#494949" }}
  >
    {title}
  </div>
);

export default function GoldenArcTemplate({
  data,
  accentColor,
}: {
  data: ResumeData;
  accentColor: string;
}) {
  const photo = resolveImageSrc(data.personal_info.image);
  return (
    <div className="resume-page mx-auto grid max-w-4xl grid-cols-[225px_1fr] bg-white text-slate-800">
      <aside className="relative border-r border-gray-200 px-5 py-7" style={{ backgroundColor: `${accentColor}18` }}>
        <div className="absolute inset-x-0 top-0 h-56" style={{ backgroundColor: accentColor }} />
        <div className="absolute right-0 top-0 h-36 w-24 bg-white" style={{ clipPath: "ellipse(100% 100% at 100% 0%)" }} />
        <div className="relative z-10 mx-auto mt-3 h-40 w-40 overflow-hidden rounded-full border-[6px] border-white shadow-lg">
          {photo ? <img src={photo} alt="profile" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-slate-300" />}
        </div>

        <div className="relative z-10 mt-7 space-y-7">
          <div>
            <Pill title="Contact Me" accentColor={accentColor} />
            <div className="resume-meta mt-3 space-y-1">
              <p>{data.personal_info.phone}</p>
              <p>{data.personal_info.location}</p>
              <p>{data.personal_info.email}</p>
              <p>{data.personal_info.website}</p>
            </div>
          </div>
          <div>
            <Pill title="Education" accentColor={accentColor} />
            <div className="mt-3 space-y-3">
              {data.education.slice(0, 3).map((edu, i) => (
                <div key={i}>
                  <p className="text-[13px] font-black uppercase" style={{ color: accentColor }}>
                    {edu.institution}
                  </p>
                  <p className="text-[12px]">{edu.degree} {edu.field}</p>
                  <p className="text-[11px] text-slate-500">{formatDate(edu.graduation_date)}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Pill title="Reference" accentColor={accentColor} />
            <div className="resume-meta mt-3">
              <p className="font-bold uppercase">{data.personal_info.full_name}</p>
              <p>{data.personal_info.location}</p>
              <p>{data.personal_info.phone}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="px-7 py-7">
        <h1 className="text-[46px] font-black uppercase leading-[0.92] tracking-tight">
          {data.personal_info.full_name || "Anve Johanson"}
        </h1>
        <p className="mt-2 text-[20px] uppercase tracking-[0.16em] text-slate-600">
          {data.personal_info.profession || "Web Designer"}
        </p>
        <div className="mt-4 h-1.5 w-44 rounded-full" style={{ backgroundColor: accentColor }} />

        <section className="mt-8">
          <Pill title="Job Experience" accentColor={accentColor} />
          <div className="mt-4 space-y-4">
            {data.experience.slice(0, 3).map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="text-[19px] font-black uppercase leading-none" style={{ color: accentColor }}>
                      {exp.position}
                    </p>
                    <p className="text-[14px] font-semibold text-slate-600">{exp.company}</p>
                  </div>
                  <p className="text-[13px] text-slate-500">
                    {formatDate(exp.start_date)}-{exp.is_current ? "Present" : formatDate(exp.end_date)}
                  </p>
                </div>
                <p className="resume-copy mt-2 whitespace-pre-line text-slate-600">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <Pill title="Skills" accentColor={accentColor} />
          <div className="mt-4 space-y-4">
            {data.skills.slice(0, 5).map((skill, i) => {
              const value = 58 + ((i * 10) % 32);
              return (
                <div key={skill} className="grid grid-cols-[150px_1fr] items-center gap-3">
                  <span className="truncate text-[14px] font-semibold">{skill}</span>
                  <div className="h-3 rounded-full bg-gray-300">
                    <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: accentColor }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-8">
          <Pill title="About Me" accentColor={accentColor} />
          <p className="resume-copy mt-4 text-slate-600">{data.professional_summary}</p>
        </section>
      </main>
    </div>
  );
}



