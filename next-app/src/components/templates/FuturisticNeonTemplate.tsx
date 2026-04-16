import type { ResumeData } from "../../models";
import { resolveImageSrc } from "../../lib/resolveImageSrc";



const InfoCard = ({ title, children, accentColor }: { title: string; children: React.ReactNode; accentColor: string }) => (
  <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f1726]/90 px-5 py-4 shadow-[0_0_30px_rgba(0,0,0,0.35)] backdrop-blur-sm">
    <div className="absolute right-0 top-0 h-12 w-12 border-r border-t border-white/10" />
    <div className="mb-3 flex items-center gap-3">
      <span className="h-2.5 w-2.5 rounded-full shadow-[0_0_12px_currentColor]" style={{ backgroundColor: accentColor, color: accentColor }} />
      <h3 className="text-[13px] font-bold uppercase tracking-[0.28em] text-white/80">{title}</h3>
    </div>
    {children}
  </section>
);

export default function FuturisticNeonTemplate({
  data,
  accentColor,
}: {
  data: ResumeData;
  accentColor: string;
}) {
  const photo = resolveImageSrc(data.personal_info.image);
  const cyan = accentColor;
  const violet = "#7c3aed";

  return (
    <div className="resume-page relative mx-auto overflow-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
      <div className="absolute -left-24 top-14 h-72 w-72 rounded-full blur-3xl" style={{ backgroundColor: `${cyan}33` }} />
      <div className="absolute right-[-60px] top-[-20px] h-80 w-80 rounded-full blur-3xl" style={{ backgroundColor: `${violet}2e` }} />
      <div className="absolute bottom-[-120px] left-1/3 h-72 w-72 rounded-full blur-3xl" style={{ backgroundColor: `${cyan}22` }} />
      <div className="absolute left-10 top-12 h-20 w-48 border border-white/15" style={{ clipPath: "polygon(0 0, 88% 0, 100% 30%, 100% 100%, 0 100%)" }} />
      <div className="absolute bottom-10 right-10 h-28 w-28 border border-white/15" style={{ clipPath: "polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)" }} />

      <div className="relative z-10 grid h-full grid-cols-[230px_1fr] gap-6 px-7 py-7">
        <aside className="space-y-5">
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#081221]/90 px-5 py-5 shadow-[0_0_30px_rgba(0,0,0,0.35)]">
            <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${cyan}, ${violet})` }} />
            <div className="mx-auto h-40 w-40 overflow-hidden rounded-full border-[6px] border-[#0e1e34] shadow-[0_0_0_2px_rgba(255,255,255,0.08),0_0_35px_rgba(59,130,246,0.25)]">
              {photo ? <img src={photo} alt="Profile" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-slate-700" />}
            </div>
            <div className="mt-4 text-center">
              <h1 className="text-[24px] font-black uppercase tracking-[0.12em] text-white">{data.personal_info.full_name || "Nova Candidate"}</h1>
              <p className="mt-2 text-[12px] uppercase tracking-[0.35em] text-cyan-200">{data.personal_info.profession || "Future Systems Designer"}</p>
            </div>
          </div>

          <InfoCard title="Contact" accentColor={cyan}>
            <div className="resume-meta space-y-2 text-white/75">
              <p>{data.personal_info.email || "hello@futuremail.dev"}</p>
              <p>{data.personal_info.phone || "+1 555 010 2026"}</p>
              <p>{data.personal_info.location || "Neo City, Earth"}</p>
              <p>{data.personal_info.website || "portfolio.dev"}</p>
            </div>
          </InfoCard>

          <InfoCard title="Skills Matrix" accentColor={cyan}>
            <div className="space-y-3">
              {data.skills.slice(0, 5).map((skill, index) => {
                const value = 55 + ((index * 11) % 35);
                return (
                  <div key={skill}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-white/70">
                      <span className="truncate">{skill}</span>
                      <span>{value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div className="h-full rounded-full shadow-[0_0_20px_currentColor]" style={{ width: `${value}%`, background: `linear-gradient(90deg, ${cyan}, ${violet})`, color: cyan }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </InfoCard>
        </aside>

        <main className="space-y-5">
          <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#0a1526]/90 px-7 py-6 shadow-[0_0_30px_rgba(0,0,0,0.35)]">
            <div className="absolute right-6 top-6 h-16 w-16 rounded-full border border-white/10" />
            <div className="absolute right-10 top-10 h-8 w-8 rounded-full" style={{ backgroundColor: `${cyan}44` }} />
            <p className="text-[12px] uppercase tracking-[0.45em] text-white/50">Identity Block</p>
            <div className="mt-4 grid gap-6">
              <div>
                <h2 className="text-[52px] font-black uppercase leading-[0.9] tracking-[0.06em] text-white">{data.personal_info.full_name || "Nova Candidate"}</h2>
                <p className="mt-3 text-[14px] uppercase tracking-[0.45em]" style={{ color: cyan }}>{data.personal_info.profession || "Future Systems Designer"}</p>
                <p className="resume-copy mt-5 max-w-2xl text-white/72">{data.professional_summary || "A futuristic resume concept inspired by neon UI systems, cyberpunk dashboards, and editorial sci-fi interfaces."}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="grid grid-cols-2 gap-3 text-[11px] uppercase tracking-[0.18em] text-white/60">
                  <div className="rounded-xl border border-white/10 p-3">
                    <p>Mode</p>
                    <p className="mt-2 text-white">Active</p>
                  </div>
                  <div className="rounded-xl border border-white/10 p-3">
                    <p>Tier</p>
                    <p className="mt-2 text-white">Pro</p>
                  </div>
                  <div className="rounded-xl border border-white/10 p-3">
                    <p>Focus</p>
                    <p className="mt-2 text-white">Design</p>
                  </div>
                  <div className="rounded-xl border border-white/10 p-3">
                    <p>Status</p>
                    <p className="mt-2 text-white">Ready</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-5">
            <InfoCard title="Experience Log" accentColor={cyan}>
              <div className="space-y-4">
                {data.experience.slice(0, 4).map((exp, index) => (
                  <div key={`${exp.company}-${index}`} className="relative pl-5 before:absolute before:left-0 before:top-2 before:h-2.5 before:w-2.5 before:rounded-full before:bg-cyan-400">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[14px] font-bold uppercase tracking-[0.12em] text-white">{exp.position || "Lead Interface Architect"}</p>
                        <p className="text-[12px] uppercase tracking-[0.18em]" style={{ color: cyan }}>{exp.company || "Future Lab"}</p>
                      </div>
                      <p className="text-[11px] uppercase tracking-[0.15em] text-white/50">{String(exp.start_date).slice(0, 4)}-{exp.is_current ? "Now" : String(exp.end_date).slice(0, 4)}</p>
                    </div>
                    <p className="resume-copy mt-2 text-white/68">{exp.description || "Describe impact, systems built, leadership scope, and measurable outcomes."}</p>
                  </div>
                ))}
              </div>
            </InfoCard>

            <div className="space-y-5">
              <InfoCard title="Education" accentColor={violet}>
                <div className="space-y-4">
                  {data.education.slice(0, 3).map((edu, index) => (
                    <div key={`${edu.institution}-${index}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-white">{edu.degree || "Master Degree"}</p>
                      <p className="mt-1 text-[12px] uppercase tracking-[0.18em] text-white/60">{edu.institution || "Academy"}</p>
                      <p className="mt-2 text-[12px] text-white/68">{edu.field || "Advanced systems and interface design"}</p>
                    </div>
                  ))}
                </div>
              </InfoCard>

              <InfoCard title="Projects" accentColor={cyan}>
                <div className="flex flex-wrap gap-2">
                  {(data.project.length ? data.project.slice(0, 6).map((project) => project.name || project.type) : ["Motion UI", "XR System", "Design Ops", "AI Tooling"]).map((item, index) => (
                    <span key={`${item}-${index}`} className="rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/75" style={{ borderColor: index % 2 === 0 ? `${cyan}88` : `${violet}88`, boxShadow: index % 2 === 0 ? `0 0 18px ${cyan}22` : `0 0 18px ${violet}22` }}>
                      {item}
                    </span>
                  ))}
                </div>
              </InfoCard>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

