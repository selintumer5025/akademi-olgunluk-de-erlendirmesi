"use client";

interface StepperProps {
  totalSteps: number;
  currentStep: number;
  stepLabels: string[];
}

export default function Stepper({
  totalSteps,
  currentStep,
  stepLabels,
}: StepperProps) {
  const progress = ((currentStep) / totalSteps) * 100;

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between text-xs text-slate-500 mb-2">
        <span>Bölüm {currentStep} / {totalSteps}</span>
        <span>{Math.round(progress)}% tamamlandı</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {stepLabels.map((label, i) => (
          <span
            key={i}
            className={`text-xs px-2 py-1 rounded-full ${
              i + 1 < currentStep
                ? "bg-blue-600 text-white"
                : i + 1 === currentStep
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
