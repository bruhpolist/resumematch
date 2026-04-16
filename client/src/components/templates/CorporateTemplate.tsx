import type { ResumeData } from "../../models";
import { resolveImageSrc } from "../../lib/resolveImageSrc";



const skillBar = (index: number, accentColor: string) => {
  const value = 55 + ((index * 14) % 30);
  return (
    <div className="mt-2 h-4 border border-slate-400 bg-white">
      <div className="h-full" style={{ width: `${value}%`, backgroundColor: accentColor }} />
    </div>
  );
};

export default function CorporateTemplate({
  data,
  accentColor,
}: {
  data: ResumeData;
  accentColor: string;
}) {
  const photo = resolveImageSrc(data.personal_info.image);

  return (
    <div className="resume-page relative mx-auto max-w-4xl overflow-hidden bg-[#f7f7f2] px-10 py-8 text-slate-800">
      <div className="absolute -left-24 top-0 h-72 w-72 rounded-full border border-slate-300/50" />
      <div className="absolute -left-16 top-10 h-64 w-64 rounded-full" style={{ backgroundColor: `${accentColor}55` }} />
      <div className="absolute -bottom-16 right-[-40px] h-48 w-48 rounded-full border border-slate-300/50" />
      <div className="absolute right-[-20px] top-[360px] h-32 w-32 rounded-full" style={{ backgroundColor: `${accentColor}66` }} />
      <div className="absolute left-[-40px] top-[640px] h-28 w-28 rounded-full" style={{ backgroundColor: `${accentColor}55` }} />

      <header className="relative z-10 grid grid-cols-[1fr_160px_1fr] items-center gap-6 px-5 py-6" style={{ backgroundColor: `${accentColor}88` }}>
        <div>
          <h1 className="text-[42px] font-light uppercase leading-[0.9] text-white">
            {data.personal_info.full_name || "Lisa Lindsey"}
          </h1>
        </div>

        <div className="justify-self-center">
          <div className="h-40 w-36 overflow-hidden bg-slate-300 shadow-md">
            {photo ? <img src={photo} alt="Profile" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-slate-300" />}
          </div>
          <div className="-mt-1 bg-[#5b544f] py-2 text-center text-[13px] uppercase tracking-[0.12em] text-white">
            {data.personal_info.profession || "Marketing Manager"}
          </div>
        </div>

        <div className="justify-self-end max-w-[180px] space-y-2 text-right text-[12px] text-white">
          <p>{data.personal_info.location || "123 Street Address"}</p>
          <p>{data.personal_info.phone || "123 456 789 000"}</p>
          <p>{data.personal_info.email || "contact@domain.com"}</p>
          <p>{data.personal_info.website || "www.yourlink.com"}</p>
        </div>
      </header>

      <div className="relative z-10 mt-8 grid grid-cols-[220px_1fr] gap-8">
        <aside className="space-y-8">
          <section>
            <h2 className="text-[22px] font-light uppercase tracking-[0.2em] text-slate-700">Expertise</h2>
            <div className="mt-4 space-y-2.5 text-[13px] uppercase tracking-[0.12em] text-slate-700">
              {data.skills.slice(0, 4).map((skill) => (
                <p key={skill}>{skill}</p>
              ))}
            </div>
          </section>

          <section className="border-t-4 border-slate-500 pt-6">
            <h2 className="text-[22px] font-light uppercase tracking-[0.2em] text-slate-700">Skills</h2>
            <div className="mt-4 space-y-4 text-[13px] uppercase text-slate-700">
              {data.skills.slice(0, 4).map((skill, index) => (
                <div key={skill}>
                  <p>{skill}</p>
                  {skillBar(index, accentColor)}
                </div>
              ))}
            </div>
          </section>

          <section className="border-t-4 border-slate-500 pt-6">
            <h2 className="text-[22px] font-light uppercase tracking-[0.2em] text-slate-700">Interest</h2>
            <div className="resume-copy mt-4 space-y-4 text-slate-600">
              <p>{data.project[0]?.description || "Describe your main professional interests and personal focus areas here."}</p>
              <p>{data.project[1]?.description || "Use short supporting notes to keep the poster-like structure from the reference design."}</p>
            </div>
          </section>
        </aside>

        <main className="space-y-8">
          <section>
            <h2 className="text-[22px] font-light uppercase tracking-[0.2em] text-slate-700">Profile</h2>
            <div className="mt-3 h-[3px] w-full bg-slate-700" />
            <p className="resume-copy mt-4 text-slate-700">
              {data.professional_summary ||
                "Use this space for a strong profile statement, keeping the airy editorial feel of the original poster-inspired layout."}
            </p>
          </section>

          <section>
            <h2 className="text-[22px] font-light uppercase tracking-[0.2em] text-slate-700">Experience</h2>
            <div className="mt-3 space-y-5">
              {data.experience.slice(0, 4).map((exp, index) => (
                <div key={`${exp.company}-${index}`} className="resume-copy text-slate-700">
                  <p className="font-semibold uppercase" style={{ color: accentColor }}>
                    ({String(exp.start_date).slice(0, 4)} - {exp.is_current ? "Present" : String(exp.end_date).slice(0, 4)}) {exp.company || "Company"}
                  </p>
                  <p>{exp.description || exp.position || "Add text here to mirror the magazine-style resume structure."}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[22px] font-light uppercase tracking-[0.2em] text-slate-700">Education</h2>
            <div className="mt-3 space-y-5">
              {data.education.slice(0, 4).map((edu, index) => (
                <div key={`${edu.institution}-${index}`} className="resume-copy text-slate-700">
                  <p className="font-semibold uppercase" style={{ color: accentColor }}>
                    {edu.degree || "Degree"}
                  </p>
                  <p>{edu.institution || "University"} / {String(edu.graduation_date).slice(0, 4)}</p>
                  <p>{edu.field || "Optional short text here, describe your achievements or volunteer work."}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

