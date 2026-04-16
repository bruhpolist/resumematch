import type { ResumeData } from "../../models";
import { resolveImageSrc } from "../../lib/resolveImageSrc";



const MiniBar = ({ value, accentColor }: { value: number; accentColor: string }) => (
  <div className="h-1.5 rounded-full bg-white/20">
    <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: accentColor }} />
  </div>
);

export default function TealStripeTemplate({
  data,
  accentColor,
}: {
  data: ResumeData;
  accentColor: string;
}) {
  const photo = resolveImageSrc(data.personal_info.image);
  return (
    <div className="resume-page mx-auto grid max-w-4xl grid-cols-[220px_1fr] bg-white text-slate-800">
      <aside className="relative overflow-hidden px-5 py-7 text-white" style={{ backgroundColor: "#214355" }}>
        <div className="absolute left-0 top-0 h-28 w-28" style={{ backgroundColor: `${accentColor}70`, clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
        <div className="absolute left-6 top-3 h-14 w-24 rounded-full border-[6px]" style={{ borderColor: `${accentColor}95` }} />
        <div className="absolute left-0 top-20 h-8 w-28 rotate-[-30deg] rounded-full" style={{ backgroundColor: `${accentColor}aa` }} />

        <div className="relative z-10 mt-24 h-28 w-28 overflow-hidden rounded-full border-[4px] border-white/70 bg-white/10">
          {photo ? <img src={photo} alt="profile" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-slate-300" />}
        </div>

        <div className="relative z-10 mt-5 space-y-5 text-[12px]">
          <section>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.18em]">Contact</h3>
            <div className="mt-2 space-y-1 text-white/80">
              <p>{data.personal_info.phone}</p>
              <p>{data.personal_info.email}</p>
              <p>{data.personal_info.location}</p>
            </div>
          </section>
          <section>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.18em]">Skills</h3>
            <div className="mt-2 space-y-2">
              {data.skills.slice(0, 6).map((skill, i) => (
                <div key={skill}>
                  <p className="mb-1">{skill}</p>
                  <MiniBar value={50 + ((i * 13) % 35)} accentColor={accentColor} />
                </div>
              ))}
            </div>
          </section>
          <section>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.18em]">Software</h3>
            <div className="mt-2 space-y-2">
              {["Photoshop", "Illustrator", "Figma", "InDesign"].map((item, i) => (
                <div key={item}>
                  <p className="mb-1">{item}</p>
                  <MiniBar value={58 + ((i * 11) % 28)} accentColor={accentColor} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>

      <main className="px-7 py-7">
        <h1 className="text-[40px] font-black uppercase tracking-tight" style={{ color: "#1f3342" }}>
          {data.personal_info.full_name || "Marko Keviners"}
        </h1>
        <p className="text-[18px] uppercase tracking-[0.15em] text-slate-500">
          {data.personal_info.profession || "Graphic Designer"}
        </p>

        <div className="mt-7 space-y-7">
          <section>
            <h2 className="text-[18px] font-bold uppercase tracking-[0.18em]" style={{ color: accentColor }}>
              About
            </h2>
            <p className="resume-copy mt-2 text-slate-600">{data.professional_summary}</p>
          </section>
          <section>
            <h2 className="text-[18px] font-bold uppercase tracking-[0.18em]" style={{ color: accentColor }}>
              Experience
            </h2>
            <div className="mt-3 space-y-4">
              {data.experience.slice(0, 4).map((exp, i) => (
                <div key={i} className="border-t border-dotted border-slate-300 pt-3">
                  <p className="font-bold uppercase text-slate-700">{exp.position}</p>
                  <p className="text-sm text-slate-500">{exp.company} / {String(exp.start_date).slice(0, 4)}-{exp.is_current ? "Now" : String(exp.end_date).slice(0, 4)}</p>
                  <p className="resume-copy mt-1 text-slate-600">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-[18px] font-bold uppercase tracking-[0.18em]" style={{ color: accentColor }}>
              Education
            </h2>
            <div className="mt-3 space-y-4">
              {data.education.slice(0, 4).map((edu, i) => (
                <div key={i} className="border-t border-dotted border-slate-300 pt-3">
                  <p className="font-bold uppercase text-slate-700">{edu.degree}</p>
                  <p className="text-sm text-slate-500">{edu.institution}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

