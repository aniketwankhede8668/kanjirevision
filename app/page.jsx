"use client";
import { useEffect, useState } from "react";
import { parsePptx } from "@/lib/pptx";
import { shuffle } from "@/lib/shuffle";
import { useSlideshow } from "@/hooks/useSlideshow";
import { useAnswers } from "@/hooks/useAnswers";
import LoginForm from "@/components/LoginForm";
import Header from "@/components/Header";
import UploadPanel from "@/components/UploadPanel";
import SlidePlayer from "@/components/SlidePlayer";
import AnswersTable from "@/components/AnswersTable";

export default function Page() {
  const [user, setUser] = useState("");
  const [slides, setSlides] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const show = useSlideshow(slides.length);
  const answers = useAnswers(setSlides);

  // Files sirf memory me hain: logout, tab close ya refresh par sab saaf.
  const logout = () => {
    setSlides([]); setUser(""); setUploadError("");
    show.reset(); answers.reset();
  };
  useEffect(() => {
    window.addEventListener("pagehide", logout);
    return () => window.removeEventListener("pagehide", logout);
  }, []);

  const onFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setUploadError("");
    try {
      const data = await parsePptx(f);
      if (!data.length) throw new Error("empty");
      setSlides(shuffle(data));
      answers.enrich(data);
    } catch (err) {
      console.error("PPTX parse error:", err);
      setUploadError(
        err.message === "empty"
          ? "No slide text found. The text may be embedded in an image."
          : `Unable to read this .pptx file (${err.message}). Please upload a PowerPoint 2007+ (.pptx) file.`
      );
    }
    e.target.value = "";
  };

  // Maru / Batsu / Not attend: mark save karke agli slide par.
  const mark = (m) => {
    setSlides((prev) => prev.map((s, i) => (i === show.idx ? { ...s, mark: m } : s)));
    show.next();
  };

  if (!user) return <main className="center"><LoginForm onLogin={setUser} /></main>;

  return (
    <main className="wrap">
      <Header user={user} onLogout={logout} />
      {show.idx === -1 && (
        <UploadPanel
          count={slides.length} seconds={show.seconds} onSeconds={show.setSeconds}
          aiLoading={answers.status === "loading"} error={uploadError || (answers.status === "error" ? answers.error : "")}
          onFile={onFile} onStart={show.start}
        />
      )}
      {show.playing && (
        <SlidePlayer
          slide={slides[show.idx]} index={show.idx} total={slides.length} seconds={show.seconds}
          paused={show.paused} onTogglePause={show.togglePause} onMark={mark}
        />
      )}
      {show.done && (
        <AnswersTable
          user={user} slides={slides} status={answers.status} error={answers.error}
          onRetry={() => answers.enrich(slides)}
          onRestart={() => { setSlides(shuffle(slides).map((s) => ({ ...s, mark: "" }))); show.restart(); }}
        />
      )}
    </main>
  );
}
