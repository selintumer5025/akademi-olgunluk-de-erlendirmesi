"use client";
import { LIKERT_OPTIONS } from "@/data/questions";

interface LikertQuestionProps {
  questionId: string;
  questionText: string;
  questionNumber: number;
  value: number | undefined;
  onChange: (questionId: string, value: number) => void;
}

export default function LikertQuestion({
  questionId,
  questionText,
  questionNumber,
  value,
  onChange,
}: LikertQuestionProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
      <p className="text-slate-800 font-medium mb-4">
        <span className="text-blue-600 font-bold mr-2">{questionNumber}.</span>
        {questionText}
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        {LIKERT_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium ${
              value === option.value
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-slate-200 hover:border-blue-300 text-slate-600"
            }`}
          >
            <input
              type="radio"
              name={questionId}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(questionId, option.value)}
              className="sr-only"
            />
            <span className="font-bold text-xs">{option.value}</span>
            <span className="text-xs">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
