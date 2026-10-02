export const canSpeak = () => typeof window !== "undefined" && "speechSynthesis" in window;

export function speak(text) {
  if (!canSpeak() || !text) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  u.rate = 0.8;
  window.speechSynthesis.speak(u);
}
