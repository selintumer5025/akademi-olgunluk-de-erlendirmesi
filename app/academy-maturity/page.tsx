"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { DIMENSIONS, AnswerMap } from "@/data/questions";
import { calculateResults, Results } from "@/lib/scoring";
import Stepper from "@/components/Stepper";
import LikertQuestion from "@/components/LikertQuestion";
import RadarResults from "@/components/RadarResults";

const STORAGE_KEY = "akademi_olgunluk_answers";
const STEP_KEY = "akademi_olgunluk_step";

type Screen = "welcome" | "survey" | "results";

export default function AcademyMaturityPage() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [results, setResults] = useState<Results | null>(null);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [validationError, setValidationError] = useState(false);
  const radarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedAnswers = localStorage.getItem(STORAGE_KEY);
    const savedStep = localStorage.getItem(STEP_KEY);
    if (savedAnswers) {
      try {
        const parsed = JSON.parse(savedAnswers);
        setAnswers(parsed);
      } catch {}
    }
    if (savedStep) {
      const step = parseInt(savedStep, 10);
      if (step >= 1 && step <= 6) {
        setCurrentStep(step);
      }
    }
  }, []);

  const saveToStorage = useCallback(
    (newAnswers: AnswerMap, step: number) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAnswers));
      localStorage.setItem(STEP_KEY, step.toString());
    },
    []
  );

  const handleAnswer = (questionId: string, value: number) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    saveToStorage(newAnswers, currentStep);
    setValidationError(false);
  };

  const currentDimension = DIMENSIONS[currentStep - 1];
  const currentQuestions = currentDimension?.questions || [];
  const allCurrentAnswered = currentQuestions.every(
    (q) => answers[q.id] !== undefined
  );

  const handleNext = () => {
    if (!allCurrentAnswered) {
      setValidationError(true);
      return;
    }
    if (currentStep < DIMENSIONS.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      saveToStorage(answers, nextStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Calculate results
      const r = calculateResults(answers);
      setResults(r);
      setScreen("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      saveToStorage(answers, prevStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setScreen("welcome");
    }
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STEP_KEY);
    setAnswers({});
    setCurrentStep(1);
    setResults(null);
    setScreen("welcome");
    setEmail("");
    setConsent(false);
    setEmailSent(false);
    setEmailError(false);
  };

  const handleDownloadPDF = async () => {
    if (!results) return;
    const { downloadPDF } = await import("@/lib/pdf");
    await downloadPDF(results, radarRef as React.RefObject<HTMLElement>);
  };

  const handleEmailSubmit = async () => {
    if (!email || !consent || !results) return;
    setEmailLoading(true);
    setEmailError(false);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          consent,
          results,
        }),
      });
      if (res.ok) {
        setEmailSent(true);
      } else {
        setEmailError(true);
      }
    } catch {
      setEmailError(true);
    } finally {
      setEmailLoading(false);
    }
  };

  const totalQuestions = DIMENSIONS.reduce((sum, d) => sum + d.questions.length, 0);

  const hasSavedProgress =
    Object.keys(answers).length > 0 &&
    Object.keys(answers).length < totalQuestions;

  if (screen === "welcome") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 text-sm font-medium px-4 py-2 rounded-full mb-6 border border-blue-500/30">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l-3-3 1.5-1.5L9 9l4.5-4.5L15 6l-6 6z"/>
              </svg>
              Ücretsiz Değerlendirme
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Kurumsal Akademi<br />
              <span className="text-blue-400">Olgunluk Testi</span>
            </h1>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Strateji, Yetkinlik ve Dijital Entegrasyon perspektifinden<br className="hidden md:inline" />
              6 boyutta hızlı değerlendirme.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">30</div>
                <div className="text-slate-300 text-sm mt-1">Soru</div>
              </div>
              <div className="text-center border-x border-white/10">
                <div className="text-3xl font-bold text-blue-400">6</div>
                <div className="text-slate-300 text-sm mt-1">Boyut</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">~5</div>
                <div className="text-slate-300 text-sm mt-1">Dakika</div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Paylaştığınız veriler yalnızca size sonuç raporunu sunmak ve talep ederseniz sizinle iletişime geçmek için kullanılır. Dilediğiniz zaman silinmesini talep edebilirsiniz.
                </p>
              </div>
            </div>

            {hasSavedProgress && (
              <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-4 mb-4 flex items-center justify-between">
                <div>
                  <p className="text-amber-200 font-medium text-sm">Kaldığınız yerden devam edin</p>
                  <p className="text-amber-300/70 text-xs mt-1">{Object.keys(answers).length} / {totalQuestions} soru tamamlandı</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setScreen("survey")}
                    className="bg-amber-500 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-amber-600 transition-colors"
                  >
                    Devam Et
                  </button>
                  <button
                    onClick={handleReset}
                    className="bg-white/10 text-amber-200 text-sm px-3 py-2 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => { handleReset(); setScreen("survey"); }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg py-4 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.99]"
            >
              {hasSavedProgress ? "Yeniden Başla" : "Teste Başla"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (screen === "survey") {
    return (
      <main className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-slate-800">
              Kurumsal Akademi Olgunluk Testi
            </h1>
            <button
              onClick={handleReset}
              className="text-sm text-slate-400 hover:text-red-500 transition-colors"
            >
              Sıfırla
            </button>
          </div>

          <Stepper
            totalSteps={DIMENSIONS.length}
            currentStep={currentStep}
            stepLabels={DIMENSIONS.map((d) => d.name)}
          />

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {currentStep}. {currentDimension.name}
            </h2>
            <p className="text-slate-500 text-sm">
              Bu bölümdeki tüm soruları yanıtlayın.
            </p>
          </div>

          <div className="space-y-4">
            {currentQuestions.map((question, idx) => (
              <LikertQuestion
                key={question.id}
                questionId={question.id}
                questionText={question.text}
                questionNumber={(currentStep - 1) * 5 + idx + 1}
                value={answers[question.id]}
                onChange={handleAnswer}
              />
            ))}
          </div>

          {validationError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm font-medium">
                Lütfen bu bölümdeki tüm soruları yanıtlayın.
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-8 mb-8">
            <button
              onClick={handleBack}
              className="flex-1 bg-white text-slate-700 font-semibold py-3 rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-colors"
            >
              ← Geri
            </button>
            <button
              onClick={handleNext}
              className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-500 transition-colors"
            >
              {currentStep < DIMENSIONS.length ? "Devam Et →" : "Sonuçları Gör →"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (screen === "results" && results) {
    return (
      <main className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Değerlendirme Sonuçlarınız
            </h1>
            <p className="text-slate-500">Kurumsal Akademi Olgunluk Testi</p>
          </div>

          {/* Score cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white text-center">
              <div className="text-5xl font-bold mb-1">{results.totalScore}</div>
              <div className="text-blue-100 text-sm">Toplam Skor (150 üzerinden)</div>
            </div>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white text-center md:col-span-2">
              <div className="text-sm text-slate-400 mb-1">Olgunluk Seviyesi</div>
              <div className="text-2xl font-bold mb-1">
                Seviye {results.level} – {results.levelName}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                {results.levelDescription}
              </p>
            </div>
          </div>

          {/* Radar chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Boyut Analizi</h2>
            <div ref={radarRef}>
              <RadarResults dimensionScores={results.dimensionScores} />
            </div>
          </div>

          {/* Dimension table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-6 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Boyut Detayları</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left p-4 text-slate-600 font-semibold text-sm">Boyut</th>
                    <th className="text-center p-4 text-slate-600 font-semibold text-sm">Ort.</th>
                    <th className="text-center p-4 text-slate-600 font-semibold text-sm">%</th>
                    <th className="text-left p-4 text-slate-600 font-semibold text-sm">Değerlendirme</th>
                  </tr>
                </thead>
                <tbody>
                  {results.dimensionScores.map((ds, i) => (
                    <tr key={ds.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                      <td className="p-4 text-slate-800 font-medium text-sm">{ds.name}</td>
                      <td className="p-4 text-center">
                        <span className={`font-bold text-sm ${ds.average >= 4 ? "text-green-600" : ds.average >= 3 ? "text-amber-600" : "text-red-500"}`}>
                          {ds.average}/5
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${ds.average >= 4 ? "bg-green-500" : ds.average >= 3 ? "bg-amber-500" : "bg-red-500"}`}
                              style={{ width: `${ds.percentage}%` }}
                            />
                          </div>
                          <span className="text-slate-500 text-xs w-8">{ds.percentage}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-500 text-sm">{ds.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Strong / Development areas */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="font-bold text-slate-800">Güçlü Alanlarınız</h3>
              </div>
              {results.strongAreas.map((area) => (
                <div key={area.id} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                  <span className="text-slate-700 text-sm">{area.name}</span>
                  <span className="font-bold text-green-600 text-sm">{area.average}/5</span>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="font-bold text-slate-800">Gelişim Alanlarınız</h3>
              </div>
              {results.developmentAreas.map((area) => (
                <div key={area.id} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                  <span className="text-slate-700 text-sm">{area.name}</span>
                  <span className="font-bold text-amber-600 text-sm">{area.average}/5</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action plan */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">90 Günlük Aksiyon Planı</h2>
            <div className="space-y-3">
              {results.actionPlan.map((action, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">{action}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Email section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Raporu E-posta ile Al</h2>
            {emailSent ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-green-700 font-medium">✓ Rapor e-posta adresinize gönderildi!</p>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresiniz"
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-blue-500 focus:outline-none transition-colors"
                />
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-blue-600"
                  />
                  <span className="text-sm text-slate-600">
                    Paylaştığım veriler yalnızca sonuç raporunu almak ve talep etmem halinde iletişime geçilmesi için kullanılacaktır. KVKK kapsamındaki haklarımı biliyorum.
                  </span>
                </label>
                <button
                  onClick={handleEmailSubmit}
                  disabled={!email || !consent || emailLoading}
                  className="w-full bg-slate-800 text-white font-semibold py-3 rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {emailLoading ? "Gönderiliyor..." : "Raporu Gönder"}
                </button>
                {emailError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-red-600 text-sm">E-posta gönderilemedi. Lütfen tekrar deneyin veya PDF olarak indirin.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CTA buttons */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-500 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
              Raporu PDF İndir
            </button>
            <a
              href="https://www.kolektif360.com/iletisim"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-slate-900 text-white font-semibold py-4 rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
              </svg>
              Uzmanla Görüş
            </a>
          </div>

          <div className="text-center">
            <button
              onClick={handleReset}
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              Testi Yeniden Başlat
            </button>
          </div>
        </div>
      </main>
    );
  }

  return null;
}
