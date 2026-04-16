import type { ResumeData } from "../../models";
import { resolveImageSrc } from "../../lib/resolveImageSrc";



export default function AquaOrbitTemplate({
  data,
  accentColor,
}: {
  data: ResumeData;
  accentColor: string;
}) {
  const photo = resolveImageSrc(data.personal_info.image);
  return (
    <div className="resume-page relative mx-auto max-w-4xl overflow-hidden bg-[#f8f8f5] px-10 py-8 text-slate-800">
      <div className="absolute -left-20 top-0 h-72 w-72 rounded-full" style={{ backgroundColor: `${accentColor}55` }} />
      <div className="absolute bottom-0 left-[-20px] top-14 w-[230px]" style={{ backgroundColor: "#35386c" }} />
      <div className="absolute -right-8 bottom-40 h-28 w-28 rounded-full" style={{ backgroundColor: `${accentColor}88` }} />
      <div className="absolute left-[-40px] bottom-[-30px] h-40 w-40 rounded-full" style={{ backgroundColor: "#e1b6c2" }} />

      <header className="relative z-10 grid grid-cols-[1fr_165px_1fr] items-center gap-6 px-6 py-6" style={{ backgroundColor: `${accentColor}88` }}>
        <div>
          <h1 className="text-[40px] font-light uppercase leading-[0.9] text-white">
            {data.personal_info.full_name || "Name Surname"}
          </h1>
          <p className="mt-3 text-[17px] uppercase tracking-[0.16em] text-white">
            {data.personal_info.profession}
          </p>
        </div>
        <div className="h-40 w-36 overflow-hidden bg-slate-200 shadow-lg">
          {photo ? <img src={photo} alt="profile" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-slate-300" />}
        </div>
        <div className="justify-self-end max-w-[180px] space-y-2 text-right text-[12px] text-white">
          <p>{data.personal_info.location}</p>
          <p>{data.personal_info.phone}</p>
          <p>{data.personal_info.email}</p>
          <p>{data.personal_info.website}</p>
        </div>
      </header>

      <div className="relative z-10 mt-8 grid grid-cols-[220px_1fr] gap-8">
        <aside className="text-white">
          <section>
            <h2 className="text-[22px] font-light uppercase tracking-[0.16em]">Expertise</h2>
            <div className="mt-4 space-y-2.5 text-[13px] uppercase">
              {data.skills.slice(0, 4).map((skill) => (
                <p key={skill}>{skill}</p>
              ))}
            </div>
          </section>
          <section className="mt-8 border-t-4 border-white/60 pt-6">
            <h2 className="text-[22px] font-light uppercase tracking-[0.16em]">Skills</h2>
            <div className="mt-4 space-y-3 text-[13px] uppercase">
              {data.skills.slice(0, 4).map((skill, i) => {
                const value = 58 + ((i * 13) % 26);
                return (
                  <div key={skill}>
                    <p>{skill}</p>
                    <div className="mt-2 h-4 border border-white/70 bg-white/20">
                      <div className="h-full bg-white" style={{ width: `${value}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          <section className="mt-8 border-t-4 border-white/60 pt-6">
            <h2 className="text-[22px] font-light uppercase tracking-[0.16em]">Interest</h2>
            <div className="resume-copy mt-4 space-y-4 text-white/80">
              <p>{data.project[0]?.description || "Optional small text here, describe your interests or volunteer work."}</p>
              <p>{data.project[1]?.description || "Optional small text here, describe another meaningful activity or focus area."}</p>
            </div>
          </section>
        </aside>

        <main className="space-y-8">
          <section>
            <h2 className="text-[22px] font-light uppercase tracking-[0.16em] text-slate-700">Profile</h2>
            <div className="mt-2 h-[3px] w-full bg-slate-700" />
            <p className="resume-copy mt-4 text-slate-700">{data.professional_summary}</p>
          </section>
          <section>
            <h2 className="text-[22px] font-light uppercase tracking-[0.16em] text-slate-700">Experience</h2>
            <div className="resume-copy mt-4 space-y-4 text-slate-700">
              {data.experience.slice(0, 4).map((exp, i) => (
                <div key={i}>
                  <p className="font-semibold uppercase" style={{ color: accentColor }}>
                    ({String(exp.start_date).slice(0, 4)} - {exp.is_current ? "Present" : String(exp.end_date).slice(0, 4)}) {exp.company}
                  </p>
                  <p>{exp.description || exp.position}</p>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-[22px] font-light uppercase tracking-[0.16em] text-slate-700">Education</h2>
            <div className="resume-copy mt-4 space-y-4 text-slate-700">
              {data.education.slice(0, 4).map((edu, i) => (
                <div key={i}>
                  <p className="font-semibold uppercase" style={{ color: accentColor }}>
                    {edu.degree}
                  </p>
                  <p>{edu.institution} / {String(edu.graduation_date).slice(0, 4)}</p>
                  <p>{edu.field || "Optional small text here, describe your achievements or volunteer work."}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}


