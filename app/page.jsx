"use client";
import AnswersTable from "@/components/AnswersTable";
import Header from "@/components/Header";
import LoginForm from "@/components/LoginForm";
import Practice from "@/components/Practice";
import SlidePlayer from "@/components/SlidePlayer";
import UploadPanel from "@/components/UploadPanel";
import WeakWords from "@/components/WeakWords";
import { useAnswers } from "@/hooks/useAnswers";
import { useExtract } from "@/hooks/useExtract";
import { useSlideshow } from "@/hooks/useSlideshow";
import { useWeak } from "@/hooks/useWeak";
import { loadFile } from "@/lib/loadFile";
import { shuffle } from "@/lib/shuffle";
import { useEffect, useState } from "react";

export default function Page() {
  const [user, setUser] = useState("");
  const [slides, setSlides] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const [notice, setNotice] = useState("");
  const [practice, setPractice] = useState(null);
  const [showWeak, setShowWeak] = useState(false);
  const show = useSlideshow(slides.length);
  const answers = useAnswers(setSlides);
  const extract = useExtract();
  const weak = useWeak();

  const logout = () => {
    setSlides([]); setUser(""); setUploadError(""); setNotice(""); setPractice(null); setShowWeak(false);
    show.reset(); answers.reset(); extract.reset(); weak.clear();
  };
  useEffect(() => {
    window.addEventListener("pagehide", logout);
    return () => window.removeEventListener("pagehide", logout);
  }, []);

  const onFile = async (e) => {
    const f = e.target.files[0];
    e.target.value = "";
    if (!f) return;
    setUploadError("");
    if (f.type.startsWith("image/")) {
      const items = await extract.run(f);
      if (items && !items.length) setUploadError("Image me Japanese vocabulary nahi mili.");
      else if (items) { setSlides(shuffle(items)); answers.enrich(items); }
      return;
    }
    try {
      const data = await loadFile(f);
      if (!data.length) throw new Error("empty");
      setSlides(shuffle(data));
      answers.enrich(data);
    } catch (err) {
      console.error("File parse error:", err);
      setUploadError(
        err.message === "empty"
          ? "Is file me kanji nahi mila (PPT me text image ho sakta hai, ya Excel/CSV me Kanji column nahi hai)."
          : `Ye file padhi nahi ja saki (${err.message}). Sirf .pptx, .xlsx, .csv ya image upload karein.`
      );
    }
  };

  const startPractice = (type, list = slides) => {
    const pool = type === "flash" ? list : list.filter((s) => s.meaning);
    if (pool.length < (type === "flash" ? 1 : 2)) {
      setNotice("Quiz/Listening ke liye meaning ke saath kam se kam 2 words chahiye.");
      return;
    }
    setNotice(""); setShowWeak(false);
    setPractice({ type, words: shuffle(pool), id: Date.now() });
  };

  const mark = (m) => {
    const w = slides[show.idx];
    if (m === "batsu") weak.add(w);
    if (m === "maru") weak.remove(w.question);
    setSlides((prev) => prev.map((s, i) => (i === show.idx ? { ...s, mark: m } : s)));
    show.next();
  };

  if (!user) return <main className="center"><LoginForm onLogin={setUser} /></main>;

  return (
    <main className="wrap">
      <Header user={user} onLogout={logout} />
      {notice && <p className="err">{notice}</p>}

      {practice && (
        <Practice key={practice.id} user={user} type={practice.type} words={practice.words}
          onWeak={weak.add} onKnown={(w) => weak.remove(w.question)}
          onReview={(list) => startPractice(practice.type, list)} onExit={() => setPractice(null)} />
      )}

      {!practice && showWeak && (
        <WeakWords user={user} list={weak.list} onRemove={weak.remove} onClear={weak.clear}
          onPractice={startPractice} onBack={() => setShowWeak(false)} />
      )}

      {!practice && !showWeak && show.idx === -1 && (
        <UploadPanel
          count={slides.length} seconds={show.seconds} onSeconds={show.setSeconds}
          aiLoading={answers.status === "loading"} extracting={extract.status === "loading"}
          error={uploadError || (extract.status === "error" ? extract.error : "") || (answers.status === "error" ? answers.error : "")}
          onFile={onFile} onStart={show.start} onPractice={(t) => startPractice(t)}
          weakCount={weak.list.length} onWeak={() => setShowWeak(true)}
        />
      )}
      {!practice && !showWeak && show.playing && (
        <SlidePlayer
          slide={slides[show.idx]} index={show.idx} total={slides.length} seconds={show.seconds}
          paused={show.paused} onTogglePause={show.togglePause} onMark={mark}
          onExit={show.reset}
        />
      )}
      {!practice && !showWeak && show.done && (
        <AnswersTable
          user={user} slides={slides} status={answers.status} error={answers.error}
          onRetry={() => answers.enrich(slides)}
          onRestart={() => { setSlides(shuffle(slides).map((s) => ({ ...s, mark: "" }))); show.restart(); }}
          onExit={show.reset}
        />
      )}
    </main>
  );
}
