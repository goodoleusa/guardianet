import { useState, useEffect, useRef, useCallback } from "react";
import { useMissions } from "@/hooks/use-missions";
import { MissionCard } from "@/components/MissionCard";
import type { Mission } from "@shared/schema";
import { CreateMissionDialog } from "@/components/CreateMissionDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Shield,
  CircleDot,
  CheckCircle2,
  Vote,
  Megaphone,
  Users,
  Globe,
  Heart,
  HandCoins,

} from "lucide-react";

const titleFont = "'Special Elite', cursive";
const sectionFont = "'Courier Prime', monospace";
const bodyFont = "'Inter', sans-serif";

const missionCategories = [
  {
    title: "Learn About Elections",
    description:
      "Track important election dates and compare candidates' political records and campaign finance contributions.",
    icon: Vote,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    hoverBorder: "hover:border-blue-400/40",
  },
  {
    title: "Take Political Action",
    description:
      "Attend town hall meetings, protests, and rallies; submit FOIA requests; or lobby politicians directly.",
    icon: Megaphone,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    hoverBorder: "hover:border-orange-400/40",
  },
  {
    title: "Strengthen Community Resilience",
    description:
      "Establish emergency communications, promote food and water security, or assemble an off-grid power system.",
    icon: Users,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    hoverBorder: "hover:border-emerald-400/40",
  },
  {
    title: "Digitally Defend Democracy",
    description:
      "Scrape the web to preserve historical records, set up an IPFS node, or conduct OSINT investigations.",
    icon: Globe,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    hoverBorder: "hover:border-violet-400/40",
  },
  {
    title: "Volunteer",
    description: "Find local community organizations and offer your time.",
    icon: Heart,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    hoverBorder: "hover:border-rose-400/40",
  },
  {
    title: "Donate",
    description: "Identify organizations aligned with your community goals.",
    icon: HandCoins,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    hoverBorder: "hover:border-amber-400/40",
  },
];

const INTRO_SEEN_KEY = "mdd_intro_seen";
const titleWords = ["Mission", "Defend", "Democracy"];
const briefingText =
  "A socially connected, physically resilient, and politically informed populace is equipped to withstand fascism and enshrine democratic rights. Choose your mission.";

let audioCtx: AudioContext | null = null;
function getAudioContext(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function ensureAudioUnlocked() {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") ctx.resume();
}

if (typeof window !== "undefined") {
  const unlock = () => {
    ensureAudioUnlocked();
    window.removeEventListener("click", unlock);
    window.removeEventListener("keydown", unlock);
    window.removeEventListener("touchstart", unlock);
  };
  window.addEventListener("click", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
  window.addEventListener("touchstart", unlock, { once: true });
}

function playStampSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const totalDuration = 1.8;

    const impactLen = Math.ceil(ctx.sampleRate * 0.06);
    const impactBuf = ctx.createBuffer(1, impactLen, ctx.sampleRate);
    const iData = impactBuf.getChannelData(0);
    for (let i = 0; i < impactLen; i++) {
      const t = i / ctx.sampleRate;
      iData[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.004) * 0.8;
    }
    const impact = ctx.createBufferSource();
    impact.buffer = impactBuf;
    const impactFilter = ctx.createBiquadFilter();
    impactFilter.type = "lowpass";
    impactFilter.frequency.setValueAtTime(600, now);
    impactFilter.frequency.exponentialRampToValueAtTime(80, now + 0.03);
    const impactGain = ctx.createGain();
    impactGain.gain.setValueAtTime(1.8, now);
    impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    const body = ctx.createOscillator();
    body.type = "sine";
    body.frequency.setValueAtTime(50, now);
    body.frequency.exponentialRampToValueAtTime(18, now + 0.15);
    const bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(1.6, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    const thud = ctx.createOscillator();
    thud.type = "sine";
    thud.frequency.setValueAtTime(35, now);
    thud.frequency.exponentialRampToValueAtTime(10, now + 0.6);
    const thudGain = ctx.createGain();
    thudGain.gain.setValueAtTime(1.4, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.setValueAtTime(22, now);
    sub.frequency.exponentialRampToValueAtTime(8, now + 1.0);
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(1.0, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    const resonance = ctx.createOscillator();
    resonance.type = "sine";
    resonance.frequency.setValueAtTime(65, now);
    const resGain = ctx.createGain();
    resGain.gain.setValueAtTime(0.5, now);
    resGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

    const reverbLen = Math.ceil(ctx.sampleRate * totalDuration);
    const reverbBuf = ctx.createBuffer(1, reverbLen, ctx.sampleRate);
    const rData = reverbBuf.getChannelData(0);
    for (let i = 0; i < reverbLen; i++) {
      const t = i / ctx.sampleRate;
      rData[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.35) * 0.2;
    }
    const reverb = ctx.createBufferSource();
    reverb.buffer = reverbBuf;
    const reverbFilter = ctx.createBiquadFilter();
    reverbFilter.type = "lowpass";
    reverbFilter.frequency.setValueAtTime(300, now);
    reverbFilter.frequency.exponentialRampToValueAtTime(60, now + 1.2);
    const reverbGain = ctx.createGain();
    reverbGain.gain.setValueAtTime(0.5, now);
    reverbGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-20, now);
    compressor.ratio.setValueAtTime(12, now);
    compressor.knee.setValueAtTime(3, now);
    compressor.attack.setValueAtTime(0.001, now);
    compressor.release.setValueAtTime(0.3, now);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(1.6, now);

    impact.connect(impactFilter);
    impactFilter.connect(impactGain);
    impactGain.connect(compressor);
    body.connect(bodyGain);
    bodyGain.connect(compressor);
    thud.connect(thudGain);
    thudGain.connect(compressor);
    sub.connect(subGain);
    subGain.connect(compressor);
    resonance.connect(resGain);
    resGain.connect(compressor);
    reverb.connect(reverbFilter);
    reverbFilter.connect(reverbGain);
    reverbGain.connect(compressor);
    compressor.connect(masterGain);
    masterGain.connect(ctx.destination);

    impact.start(now);
    impact.stop(now + 0.06);
    body.start(now);
    body.stop(now + 0.2);
    thud.start(now);
    thud.stop(now + 0.8);
    sub.start(now);
    sub.stop(now + 1.2);
    resonance.start(now);
    resonance.stop(now + 1.0);
    reverb.start(now);
    reverb.stop(now + totalDuration);
  } catch (e) {}
}

function playTypeSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(180 + Math.random() * 40, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.04);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  } catch (e) {}
}

function useIntroAnimation() {
  const [introSeen] = useState(() => {
    try {
      return localStorage.getItem(INTRO_SEEN_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [visibleWords, setVisibleWords] = useState<number>(introSeen ? titleWords.length : 0);
  const [panelsVisible, setPanelsVisible] = useState(introSeen);
  const [typedText, setTypedText] = useState(introSeen ? briefingText : "");
  const [typingDone, setTypingDone] = useState(introSeen);
  const [visibleBoxes, setVisibleBoxes] = useState<number>(introSeen ? missionCategories.length + 1 : 0);
  const [introComplete, setIntroComplete] = useState(introSeen);
  const timersRef = useRef<number[]>([]);
  const intervalsRef = useRef<number[]>([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      timersRef.current.forEach((id) => clearTimeout(id));
      intervalsRef.current.forEach((id) => clearInterval(id));
      timersRef.current = [];
      intervalsRef.current = [];
    };
  }, []);

  const addTimer = useCallback((fn: () => void, delay: number) => {
    const id = window.setTimeout(fn, delay);
    timersRef.current.push(id);
    return id;
  }, []);

  const addInterval = useCallback((fn: () => void, delay: number) => {
    const id = window.setInterval(fn, delay);
    intervalsRef.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    if (introSeen) return;

    addTimer(() => {
      let wordIndex = 0;
      const stampId = addInterval(() => {
        if (!mountedRef.current) return;
        wordIndex++;
        playStampSound();
        setVisibleWords(wordIndex);
        if (wordIndex >= titleWords.length) {
          clearInterval(stampId);
          addTimer(() => {
            if (!mountedRef.current) return;
            setPanelsVisible(true);
            addTimer(() => {
              if (!mountedRef.current) return;
              let charIndex = 0;
              const typeId = addInterval(() => {
                if (!mountedRef.current) return;
                charIndex++;
                const ch = briefingText.charAt(charIndex - 1);
                if (ch !== " ") playTypeSound();
                setTypedText(briefingText.slice(0, charIndex));
                if (charIndex >= briefingText.length) {
                  clearInterval(typeId);
                  setTypingDone(true);
                  let boxIndex = 0;
                  const totalBoxes = missionCategories.length + 1;
                  const boxId = addInterval(() => {
                    if (!mountedRef.current) return;
                    boxIndex++;
                    setVisibleBoxes(boxIndex);
                    if (boxIndex >= totalBoxes) {
                      clearInterval(boxId);
                      setIntroComplete(true);
                      try {
                        localStorage.setItem(INTRO_SEEN_KEY, "true");
                      } catch {}
                    }
                  }, 400);
                }
              }, 30);
            }, 600);
          }, 800);
        }
      }, 500);
    }, 400);
  }, [introSeen, addTimer, addInterval]);

  const skipIntro = useCallback(() => {
    if (introComplete) return;
    timersRef.current.forEach((id) => clearTimeout(id));
    intervalsRef.current.forEach((id) => clearInterval(id));
    timersRef.current = [];
    intervalsRef.current = [];
    setVisibleWords(titleWords.length);
    setPanelsVisible(true);
    setTypedText(briefingText);
    setTypingDone(true);
    const totalBoxes = missionCategories.length + 1;
    setVisibleBoxes(totalBoxes);
    setIntroComplete(true);
    try { localStorage.setItem(INTRO_SEEN_KEY, "true"); } catch {}
  }, [introComplete]);

  return {
    introSeen,
    introComplete,
    visibleWords,
    panelsVisible,
    typedText,
    typingDone,
    visibleBoxes,
    skipIntro,
  };
}

function MissionsPanel({
  activeMissions,
  completedMissions,
  isLoading,
  intro,
}: {
  activeMissions: Mission[];
  completedMissions: Mission[];
  isLoading: boolean;
  intro: ReturnType<typeof useIntroAnimation>;
}) {
  const [tab, setTab] = useState<"active" | "completed">("active");
  const missions = tab === "active" ? activeMissions : completedMissions;

  return (
    <section
      className="flex flex-col min-h-0 h-full rounded-md border border-slate-800 bg-slate-900 overflow-hidden transition-opacity duration-700"
      style={{ opacity: intro.panelsVisible ? 1 : 0 }}
    >
      <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
        <div className="flex items-center gap-1 flex-1">
          <button
            data-testid="tab-active-missions"
            onClick={() => setTab("active")}
            className={`flex-1 flex items-center justify-center gap-1.5 text-sm uppercase tracking-wider px-2 py-1 rounded-md transition-colors cursor-pointer ${
              tab === "active"
                ? "text-emerald-400 bg-emerald-500/10"
                : "text-slate-500 hover:text-slate-300"
            }`}
            style={{ fontFamily: sectionFont }}
          >
            <CircleDot className="w-3.5 h-3.5" />
            <span className="text-glow-red-subtle font-semibold">Active</span>
          </button>
          <button
            data-testid="tab-completed-missions"
            onClick={() => setTab("completed")}
            className={`flex-1 flex items-center justify-center gap-1.5 text-sm uppercase tracking-wider px-2 py-1 rounded-md transition-colors cursor-pointer ${
              tab === "completed"
                ? "text-slate-300 bg-slate-800"
                : "text-slate-500 hover:text-slate-300"
            }`}
            style={{ fontFamily: sectionFont }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-glow-red-subtle font-semibold">Completed</span>
          </button>
        </div>
        <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded-md">
          {missions.length}
        </span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {isLoading ? (
            Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-24 w-full bg-slate-800 rounded-md"
                />
              ))
          ) : missions.length === 0 ? (
            <div className="text-center py-10">
              {tab === "active" ? (
                <>
                  <Target className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                  <p className="text-xs text-slate-400">No active missions</p>
                  <p className="text-[10px] mt-1 text-slate-500">
                    Choose a mission to begin
                  </p>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                  <p className="text-xs text-slate-400">
                    No completed missions yet
                  </p>
                </>
              )}
            </div>
          ) : (
            missions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))
          )}
        </div>
      </ScrollArea>

      <div
        className="p-3 border-t border-slate-800 transition-all duration-700 ease-out"
        style={{
          opacity: intro.visibleBoxes > missionCategories.length ? 1 : 0,
          transform: intro.visibleBoxes > missionCategories.length ? "translateY(0)" : "translateY(8px)",
        }}
      >
        <CreateMissionDialog />
      </div>
    </section>
  );
}

export default function MissionControl() {
  const { data: missions, isLoading, error } = useMissions();
  const intro = useIntroAnimation();

  const activeMissions = missions?.filter((m) => m.status === "active") || [];
  const completedMissions =
    missions?.filter((m) => m.status === "completed") || [];

  if (error) {
    return (
      <div
        className="min-h-screen bg-slate-950 text-red-400 flex items-center justify-center"
        style={{ fontFamily: bodyFont }}
      >
        <div className="border border-red-500/30 p-8 text-center bg-red-950/10 rounded-md">
          <h1 className="text-xl font-semibold mb-2">Connection Failed</h1>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen bg-slate-950 text-slate-200 relative flex flex-col overflow-hidden"
      style={{ fontFamily: bodyFont }}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button, a, [role='dialog']")) return;
        if (!intro.introComplete) intro.skipIntro();
      }}
    >
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-3.5 sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto flex flex-col items-center justify-center">
          <h1
            style={{ fontFamily: titleFont }}
            className="text-xl md:text-3xl font-bold tracking-widest uppercase text-white text-glow-red-subtle"
          >
            {titleWords.map((word, i) => (
              <span
                key={word}
                className="inline-block transition-all duration-100"
                style={{
                  opacity: i < intro.visibleWords ? 1 : 0,
                  transform: i < intro.visibleWords ? "scale(1)" : "scale(1.8)",
                  marginRight: i < titleWords.length - 1 ? "0.35em" : 0,
                }}
              >
                {word}
              </span>
            ))}
          </h1>
          <div
            className="text-[10px] text-slate-500 tracking-wider uppercase flex items-center gap-1.5 mt-0.5 transition-opacity duration-500"
            style={{ opacity: intro.panelsVisible ? 1 : 0 }}
          >
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            Secure Uplink Established
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-4 md:p-5 max-w-[1600px] mx-auto w-full z-10">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_minmax(220px,300px)] xl:grid-cols-[minmax(200px,260px)_1fr_minmax(200px,260px)] gap-4 h-full">
          <section
            className="hidden xl:flex flex-col min-h-0 rounded-md border border-slate-800 bg-slate-900 overflow-hidden transition-opacity duration-700"
            style={{ opacity: intro.panelsVisible ? 1 : 0 }}
          >
            <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
              <CircleDot className="w-3.5 h-3.5 text-emerald-400" />
              <h2
                style={{ fontFamily: sectionFont }}
                className="font-semibold text-sm text-slate-300 uppercase tracking-wider text-glow-red-subtle"
              >
                Active Missions
              </h2>
              <span className="ml-auto text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded-md">
                {activeMissions.length}
              </span>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full bg-slate-800 rounded-md" />
                  ))
                ) : activeMissions.length === 0 ? (
                  <div className="text-center py-10">
                    <Target className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                    <p className="text-xs text-slate-400">No active missions</p>
                    <p className="text-[10px] mt-1 text-slate-500">Choose a mission to begin</p>
                  </div>
                ) : (
                  activeMissions.map((mission) => (
                    <MissionCard key={mission.id} mission={mission} />
                  ))
                )}
              </div>
            </ScrollArea>
            <div
              className="p-3 border-t border-slate-800 transition-all duration-700 ease-out"
              style={{
                opacity: intro.visibleBoxes > missionCategories.length ? 1 : 0,
                transform: intro.visibleBoxes > missionCategories.length ? "translateY(0)" : "translateY(8px)",
              }}
            >
              <CreateMissionDialog />
            </div>
          </section>

          <section
            className="flex flex-col min-h-0 rounded-md border border-slate-800 bg-slate-900 overflow-hidden transition-opacity duration-700"
            style={{ opacity: intro.panelsVisible ? 1 : 0 }}
          >
            <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-slate-400" />
              <h2
                style={{ fontFamily: sectionFont }}
                className="font-semibold text-sm text-slate-300 uppercase tracking-wider text-glow-red-subtle"
              >
                Mission Briefing
              </h2>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-5 md:p-6">
                <p
                  style={{ fontFamily: "'Share Tech Mono', monospace" }}
                  className="text-slate-300 text-sm leading-relaxed mb-6 select-none"
                  data-testid="text-briefing"
                >
                  {intro.typedText}
                  {!intro.typingDone && (
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6 }}
                      className="inline-block w-2 h-4 bg-slate-400 ml-0.5 align-middle"
                    />
                  )}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {missionCategories.map((cat, i) => (
                    <button
                      key={cat.title}
                      data-testid={`mission-category-${cat.title.toLowerCase().replace(/\s+/g, "-")}`}
                      className={`w-full text-left rounded-md border ${cat.border} ${cat.hoverBorder} px-3 py-2.5 bg-slate-900 hover:bg-slate-800 transition-all duration-700 ease-out group cursor-pointer`}
                      style={{
                        opacity: i < intro.visibleBoxes ? 1 : 0,
                        transform: i < intro.visibleBoxes ? "translateY(0)" : "translateY(12px)",
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-md ${cat.bg} flex items-center justify-center shrink-0`}
                        >
                          <cat.icon className={`w-3.5 h-3.5 ${cat.color}`} />
                        </div>
                        <h3 className="text-slate-200 font-semibold text-[13px] group-hover:text-white transition-colors">
                          {cat.title}
                        </h3>
                      </div>
                      <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300">
                        <div className="overflow-hidden">
                          <p className="text-slate-400 text-xs pt-1.5 pl-[38px] leading-snug group-hover:text-slate-300 transition-colors">
                            {cat.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </section>

          <div className="xl:hidden flex flex-col min-h-0 h-full">
            <MissionsPanel
              activeMissions={activeMissions}
              completedMissions={completedMissions}
              isLoading={isLoading}
              intro={intro}
            />
          </div>

          <section
            className="hidden xl:flex flex-col min-h-0 rounded-md border border-slate-800 bg-slate-900 overflow-hidden transition-opacity duration-700"
            style={{ opacity: intro.panelsVisible ? 1 : 0 }}
          >
            <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
              <h2
                style={{ fontFamily: sectionFont }}
                className="font-semibold text-sm text-slate-300 uppercase tracking-wider text-glow-red-subtle"
              >
                Completed Missions
              </h2>
              <span className="ml-auto text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded-md">
                {completedMissions.length}
              </span>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {isLoading ? (
                  Array(2).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full bg-slate-800 rounded-md" />
                  ))
                ) : completedMissions.length === 0 ? (
                  <div className="text-center py-10">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                    <p className="text-xs text-slate-400">No completed missions yet</p>
                  </div>
                ) : (
                  completedMissions.map((mission) => (
                    <MissionCard key={mission.id} mission={mission} />
                  ))
                )}
              </div>
            </ScrollArea>
          </section>
        </div>
      </main>
    </div>
  );
}
