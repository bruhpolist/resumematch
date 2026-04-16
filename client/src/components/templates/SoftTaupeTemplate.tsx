import type { ResumeData } from "../../models";
import { resolveImageSrc } from "../../lib/resolveImageSrc";



const Heading = ({ title, accentColor }: { title: string; accentColor: string }) => (
  <div className="flex items-center gap-4">
    <h2 className="text-[24px] font-black uppercase tracking-wide text-slate-800">{title}</h2>
    <div className="h-[2px] w-full" style={{ backgroundColor: `${accentColor}88` }} />
  </div>
);

export default function SoftTaupeTemplate({
  data,
  accentColor,
}: {
  data: ResumeData;
  accentColor: string;
}) {
  const photo = resolveImageSrc(data.personal_info.image);
  return (
    <div className="resume-page mx-auto grid max-w-4xl grid-cols-[225px_1fr] bg-white text-slate-800">
      <aside className="px-7 py-8" style={{ backgroundColor: "#eadfd9" }}>
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#4b3c47] text-[38px] text-white">
          {photo ? <img src={photo} alt="profile" className="h-full w-full rounded-full object-cover" /> : "CV"}
        </div>

        <div className="mt-8 space-y-8">
          <section>
            <Heading title="Contact" accentColor={accentColor} />
            <div className="resume-meta mt-4 space-y-2 text-slate-700">
              <p>{data.personal_info.location}</p>
              <p>{data.personal_info.email}</p>
              <p>{data.personal_info.phone}</p>
              <p>{data.personal_info.linkedin}</p>
            </div>
          </section>

          <section>
            <Heading title="Education" accentColor={accentColor} />
            <div className="resume-meta mt-4 space-y-4 text-slate-700">
              {data.education.slice(0, 3).map((edu, i) => (
                <div key={i}>
                  <p className="font-semibold">{String(edu.graduation_date).slice(0, 4)} - {String(edu.graduation_date).slice(0, 4)}</p>
                  <p className="font-bold uppercase">{edu.degree}</p>
                  <p>{edu.institution}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <Heading title="Languages" accentColor={accentColor} />
            <div className="resume-meta mt-4 space-y-3 text-slate-700">
              <p>English ........</p>
              <p>Spanish ......</p>
              <p>German ....</p>
            </div>
          </section>
        </div>
      </aside>

      <main>
        <header className="px-8 py-10 text-white" style={{ backgroundColor: "#4b3c47" }}>
          <h1 className="text-[48px] font-light uppercase leading-[0.95]">
            {data.personal_info.full_name || "Name Surname"}
          </h1>
          <p className="mt-2 text-[18px] tracking-[0.14em] text-white/80">{data.personal_info.profession}</p>
        </header>

        <div className="space-y-8 px-8 py-8">
          <section>
            <Heading title="Professional Profile" accentColor={accentColor} />
            <p className="resume-copy mt-4 text-slate-700">{data.professional_summary}</p>
          </section>

          <section>
            <Heading title="Work Experience" accentColor={accentColor} />
            <div className="resume-copy mt-4 space-y-4 text-slate-700">
              {data.experience.slice(0, 4).map((exp, i) => (
                <div key={i} className="grid grid-cols-[82px_1fr] gap-4">
                  <p className="text-[12px] text-slate-500">{String(exp.start_date).slice(0, 7)} - {exp.is_current ? "Now" : String(exp.end_date).slice(0, 7)}</p>
                  <div>
                    <p className="font-bold">{exp.position}</p>
                    <p className="text-slate-600">{exp.company}</p>
                    <p>{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <Heading title="Main Specialization" accentColor={accentColor} />
            <div className="mt-5 flex flex-wrap gap-3">
              {data.skills.slice(0, 4).map((skill, i) => (
                <span
                  key={skill}
                  className="flex h-16 w-16 items-center justify-center rounded-full px-2 text-center text-[10px] font-semibold text-white"
                  style={{ backgroundColor: i % 2 === 0 ? accentColor : "#bcaeb8" }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

