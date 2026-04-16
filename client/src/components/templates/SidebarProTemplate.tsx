import type { ResumeData } from "../../models";
import { resolveImageSrc } from "../../lib/resolveImageSrc";



const SkillChart = ({ accentColor, items }: { accentColor: string; items: string[] }) => (
  <div className="mt-4 grid h-28 grid-cols-6 items-end gap-3">
    {items.slice(0, 6).map((item, index) => {
      const height = 28 + ((index * 17) % 60);
      return (
        <div key={item} className="flex flex-col items-center gap-2">
          <div
            className="w-7 rounded-t-md"
            style={{
              height: `${height}px`,
              background: `linear-gradient(180deg, ${accentColor}, #7b3ff2)`,
            }}
          />
          <span className="text-[9px] uppercase text-slate-400">{item.slice(0, 3)}</span>
        </div>
      );
    })}
  </div>
);

const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-white/5 bg-[#171a28] px-5 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
    <h3 className="text-[18px] font-bold uppercase tracking-[0.18em] text-slate-200">{title}</h3>
    <div className="mt-3">{children}</div>
  </div>
);

export default function SidebarProTemplate({
  data,
  accentColor,
}: {
  data: ResumeData;
  accentColor: string;
}) {
  const photo = resolveImageSrc(data.personal_info.image);

  return (
    <div className="resume-page mx-auto grid max-w-4xl grid-cols-[235px_1fr] bg-[#0d1018] text-white">
      <aside className="border-r border-white/5 bg-[#111522] px-6 py-7">
        <div className="flex flex-col items-center text-center">
          <div className="relative h-36 w-36 overflow-hidden rounded-full border-[6px] border-transparent">
            <div
              className="absolute inset-[-6px] rounded-full"
              style={{
                background: `conic-gradient(from 180deg, ${accentColor}, #7b3ff2, ${accentColor})`,
              }}
            />
            <div className="absolute inset-[6px] overflow-hidden rounded-full bg-[#0f1320]">
              {photo ? <img src={photo} alt="Profile" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-slate-500" />}
            </div>
          </div>
          <h1 className="mt-4 text-[30px] font-bold leading-tight">{data.personal_info.full_name || "John Smith"}</h1>
          <p className="text-sm text-slate-400">{data.personal_info.profession || "Web Developer"}</p>
        </div>

        <div className="mt-7 space-y-6 text-[13px] text-slate-300">
          <div>
            <h2 className="text-[18px] font-bold uppercase tracking-[0.16em]" style={{ color: accentColor }}>
              Profile
            </h2>
            <p className="resume-copy mt-2 text-slate-400">
              {data.professional_summary || "Short profile introduction that fits the compact side profile module."}
            </p>
          </div>
          <div>
            <h2 className="text-[18px] font-bold uppercase tracking-[0.16em]" style={{ color: accentColor }}>
              Contact
            </h2>
            <div className="mt-2 space-y-2 text-slate-400">
              <p>* {data.personal_info.phone || "+000 1234 5678"}</p>
              <p>* {data.personal_info.email || "email@email.com"}</p>
              <p>* {data.personal_info.location || "City, Country"}</p>
            </div>
          </div>
          <div>
            <h2 className="text-[18px] font-bold uppercase tracking-[0.16em]" style={{ color: accentColor }}>
              Social
            </h2>
            <div className="mt-2 space-y-2 text-slate-400">
              <p>* {data.personal_info.linkedin || "linkedin.com/in/you"}</p>
              <p>* {data.personal_info.website || "portfolio.com"}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="space-y-5 bg-[#0d1018] px-6 py-7">
        <Panel title="Work Experience">
          <div className="space-y-5">
            {data.experience.slice(0, 3).map((exp, index) => (
              <div key={`${exp.company}-${index}`} className="relative pl-6">
                <span className="absolute left-0 top-1 h-3 w-3 rounded-full" style={{ backgroundColor: accentColor }} />
                <p className="text-[18px] font-bold uppercase text-slate-100">{exp.company || "Company Name"}</p>
                <p className="text-sm font-semibold" style={{ color: accentColor }}>
                  {exp.position || "Role"}
                </p>
                <p className="text-xs text-slate-500">
                  {String(exp.start_date).slice(0, 7)} - {exp.is_current ? "Present" : String(exp.end_date).slice(0, 7)}
                </p>
                <p className="resume-copy mt-2 text-slate-400">
                  {exp.description || "Compact dark card copy to mirror the poster-like UI from the reference."}
                </p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Education">
          <div className="space-y-4">
            {data.education.slice(0, 3).map((edu, index) => (
              <div key={`${edu.institution}-${index}`} className="border-l-2 pl-4" style={{ borderColor: accentColor }}>
                <p className="text-[18px] font-bold uppercase text-slate-100">{edu.degree || "Master Degree"}</p>
                <p className="text-sm" style={{ color: accentColor }}>
                  {edu.institution || "School Name"}
                </p>
                <p className="text-xs text-slate-500">{String(edu.graduation_date).slice(0, 7)}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Skills">
          <SkillChart accentColor={accentColor} items={data.skills.length ? data.skills : ["HTML", "CSS", "JS", "UI", "Figma", "PM"]} />
        </Panel>
      </main>
    </div>
  );
}

