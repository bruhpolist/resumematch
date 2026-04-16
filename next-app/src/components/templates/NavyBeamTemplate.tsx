import type { ResumeData } from "../../models";
import { resolveImageSrc } from "../../lib/resolveImageSrc";



const DotRow = ({ count, accentColor }: { count: number; accentColor: string }) => (
  <div className="flex flex-wrap gap-2">
    {Array.from({ length: 7 }).map((_, i) => (
      <span
        key={i}
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: i < count ? accentColor : "#c9d6eb" }}
      />
    ))}
  </div>
);

const Pill = ({ title }: { title: string }) => (
  <div className="inline-flex rounded-full bg-[#103f7c] px-6 py-2 text-[18px] font-black uppercase text-white shadow-sm">
    {title}
  </div>
);

export default function NavyBeamTemplate({
  data,
  accentColor,
}: {
  data: ResumeData;
  accentColor: string;
}) {
  const photo = resolveImageSrc(data.personal_info.image);

  return (
    <div className="resume-page mx-auto overflow-hidden bg-[#f4f4f4] text-slate-800">
      <header className="relative h-60 overflow-hidden bg-[#103f7c]">
        <div className="absolute inset-x-0 top-0 h-6" style={{ background: `linear-gradient(90deg, ${accentColor}, #35d0ff)` }} />
        <div className="absolute bottom-0 left-0 h-28 w-full bg-white" style={{ clipPath: "polygon(0 58%, 100% 0, 100% 100%, 0 100%)" }} />
        <div className="absolute right-8 top-10 max-w-[50%] text-right text-white">
          <h1 className="text-[40px] font-black uppercase leading-none">{data.personal_info.full_name || "Harry Nelson"}</h1>
          <p className="mt-3 text-[18px] uppercase tracking-[0.16em] text-white/90">{data.personal_info.profession || "Graphic Designer"}</p>
        </div>
      </header>

      <div className="-mt-24 grid grid-cols-[250px_1fr] gap-8 px-7 pb-8 z-index-10 relative">
        <aside className="rounded-t-[150px] bg-[#ececec] px-5 pb-8 pt-4">
          <div className="mx-auto h-44 w-44 overflow-hidden rounded-full border-[9px] border-white shadow-lg">
            {photo ? <img src={photo} alt="profile" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-slate-300" />}
          </div>

          <section className="mt-8">
            <h2 className="text-[22px] font-black uppercase text-[#103f7c]">Contact</h2>
            <div className="resume-copy mt-3 space-y-2 text-slate-700">
              <p>{data.personal_info.email || "hello@reallygreatsite.com"}</p>
              <p>{data.personal_info.phone || "+123-456-7890"}</p>
              <p>{data.personal_info.location || "123 Anywhere St., Any City"}</p>
              <p>{data.personal_info.website || "www.reallygreatsite.com"}</p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-[22px] font-black uppercase text-[#103f7c]">Skills</h2>
            <div className="mt-4 space-y-4">
              {data.skills.slice(0, 5).map((skill, i) => (
                <div key={skill} className="grid grid-cols-[96px_1fr] items-center gap-3 text-[13px]">
                  <span className="truncate">{skill}</span>
                  <DotRow count={3 + (i % 4)} accentColor={accentColor} />
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-[22px] font-black uppercase text-[#103f7c]">Hobbies</h2>
            <p className="resume-copy mt-3 text-slate-700">
              {data.project[0]?.name || "Football"}, {data.project[1]?.name || "Travel"}, Music, Writing
            </p>
          </section>
        </aside>

        <main className="space-y-8 pt-16">
          <section>
            <Pill title="About Me" />
            <p className="resume-copy mt-4 text-slate-700">
              {data.professional_summary || "Summarize your strengths, specializations, and the kind of value you bring to teams and clients."}
            </p>
          </section>

          <section>
            <Pill title="Education" />
            <div className="relative mt-6 space-y-6 pl-10 before:absolute before:left-[15px] before:top-0 before:h-full before:w-[3px] before:bg-[#103f7c]">
              {data.education.slice(0, 3).map((edu, i) => (
                <div key={i} className="relative">
                  <span className="absolute -left-10 top-1 h-4 w-4 rounded-full bg-[#103f7c]" />
                  <div className="grid grid-cols-[86px_1fr] gap-4">
                    <p className="font-bold text-[#103f7c]">{String(edu.graduation_date).slice(0, 4)}</p>
                    <div>
                      <p className="font-black uppercase">{edu.institution || "University"}</p>
                      <p className="text-[13px] text-slate-600">{edu.degree} {edu.field}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <Pill title="Experience" />
            <div className="relative mt-6 space-y-6 pl-10 before:absolute before:left-[15px] before:top-0 before:h-full before:w-[3px] before:bg-[#103f7c]">
              {data.experience.slice(0, 3).map((exp, i) => (
                <div key={i} className="relative">
                  <span className="absolute -left-10 top-1 h-4 w-4 rounded-full bg-[#103f7c]" />
                  <div className="grid grid-cols-[86px_1fr] gap-4">
                    <p className="font-bold text-[#103f7c]">{String(exp.start_date).slice(0, 4)}-{exp.is_current ? "Now" : String(exp.end_date).slice(0, 4)}</p>
                    <div>
                      <p className="font-black uppercase">{exp.company || "Company"}</p>
                      <p className="text-[13px] text-slate-600">{exp.position}</p>
                      <p className="resume-copy mt-1 text-slate-700">{exp.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

