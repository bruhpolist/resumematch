import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { ResumeData } from "../models";
import { getResumeById } from "../lib/resumeStorage";

const Preview = () => {
  const { resumeId } = useParams();

  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  useEffect(() => {
    let isMounted = true;

    const loadResume = async () => {
      if (!resumeId) return;
      const resume = await getResumeById(resumeId);
      if (isMounted) {
        setResumeData(resume);
      }
    };

    loadResume();

    return () => {
      isMounted = false;
    };
  }, [resumeId]);

  return (
    <div>
      <h1>{resumeData?.title || "Preview Page"}</h1>
    </div>
  );
};

export default Preview;
