import type { ResumeData } from "../../models";
import { resolveImageSrc } from "../../lib/resolveImageSrc";



const HeadingLine = ({
  title,
  accentColor,
}: {
  title: string;
  accentColor: string;
}) => (
  <div className="flex items-center gap-5">
    <h2 className="min-w-fit text-[24px] font-black uppercase tracking-wide text-slate-800">{title}</h2>
    <div className="h-[2px] w-full" style={{ backgroundColor: `${accentColor}99` }} />
  </div>
);

export default function ElegantTemplate({
  data,
  accentColor,
}: {
  data: ResumeData;
  accentColor: string;
}) {
  const photo = resolveImageSrc(data.personal_info.image);

  return (
    <div className="resume-page mx-auto grid max-w-4xl grid-cols-[240px_1fr] bg-white text-slate-800">
      <aside className="px-7 py-8" style={{ backgroundColor: "#dddddd" }}>
        <div className="mx-auto h-48 w-48 overflow-hidden rounded-t-[110px] rounded-b-[26px] bg-white">
          {photo ? <img src={photo} alt="Profile" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-slate-300" />}
        </div>

        <div className="mt-8">
          <HeadingLine title="Education" accentColor={accentColor} />
          <div className="resume-copy mt-5 space-y-5 text-slate-700">
            {data.education.slice(0, 3).map((edu, index) => (
              <div key={`${edu.institution}-${index}`}>
                <p className="text-[16px]">{String(edu.graduation_date).slice(0, 4)} - {String(edu.graduation_date).slice(0, 4)}</p>
                <p className="font-black uppercase">{edu.degree || "Bachelor Of Design"}</p>
                <p className="font-black uppercase">{edu.institution || "University"}</p>
                <p className="mt-1 text-[13px]">* {edu.field || "Graduated in professional specialization."}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <HeadingLine title="Skills" accentColor={accentColor} />
          <ul className="mt-5 space-y-2.5 text-[14px] tracking-[0.12em] text-slate-700">
            {data.skills.slice(0, 6).map((skill) => (
              <li key={skill}>* {skill}</li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <HeadingLine title="Contact" accentColor={accentColor} />
          <div className="resume-copy mt-5 space-y-3 text-slate-700">
            <p>{data.personal_info.phone || "+123-456-7890"}</p>
            <p>{data.personal_info.email || "hello@reallygreatsite.com"}</p>
            <p>{data.personal_info.location || "123 Anywhere St., Any City"}</p>
            <p>{data.personal_info.website || "www.reallygreatsite.com"}</p>
          </div>
        </div>
      </aside>

      <main>
        <header className="px-8 py-10 text-white" style={{ backgroundColor: "#7d7a73" }}>
          <h1 className="text-[56px] font-light uppercase leading-[0.9]">
            {data.personal_info.full_name || "Jonathan Patterson"}
          </h1>
          <p className="mt-3 text-[22px] font-light tracking-[0.14em]">
            {data.personal_info.profession || "Art Director"}
          </p>
        </header>

        <div className="px-8 py-8 space-y-8">
          <section>
            <HeadingLine title="Profile Info" accentColor={accentColor} />
            <p className="resume-copy mt-4 text-slate-700">
              {data.professional_summary ||
                "Write a substantial overview paragraph here so the layout keeps the same editorial rhythm and whitespace as the reference."}
            </p>
          </section>

          <section>
            <HeadingLine title="Experience" accentColor={accentColor} />
            <div className="relative mt-6 space-y-8 pl-8 before:absolute before:left-[11px] before:top-0 before:h-full before:w-[3px] before:bg-slate-700">
              {data.experience.slice(0, 3).map((exp, index) => (
                <div key={`${exp.company}-${index}`} className="relative">
                  <span className="absolute -left-8 top-1 h-6 w-6 rounded-full border-[3px] border-slate-700 bg-white" />
                  <div className="grid grid-cols-[1fr_110px] gap-4">
                    <div>
                      <p className="text-[17px] font-black uppercase">{exp.position || "Senior Graphic Designer"}</p>
                      <p className="text-[17px] font-black uppercase">{exp.company || "Company Name"}</p>
                      <p className="resume-copy mt-2 text-slate-700">
                        {exp.description || "Describe responsibilities and impact with a fuller paragraph to keep the same proportions."}
                      </p>
                    </div>
                    <p className="text-right text-[14px] text-slate-600">
                      {String(exp.start_date).slice(0, 4)} - {exp.is_current ? "Present" : String(exp.end_date).slice(0, 4)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <HeadingLine title="Achievement" accentColor={accentColor} />
            <div className="resume-copy mt-5 grid grid-cols-2 gap-6 text-slate-700">
              <div>
                <p className="font-black">* 2013 - 2015</p>
                <p>{data.project[0]?.description || "Reduced cost and improved output through focused process changes."}</p>
              </div>
              <div>
                <p className="font-black">* 2015 - 2020</p>
                <p>{data.project[1]?.description || "Managed multiple projects and delivered consistent business value."}</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

