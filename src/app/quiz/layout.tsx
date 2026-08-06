import { QuizProvider } from "@/lib/quiz-store";
import { QuizChrome } from "@/components/quiz/QuizChrome";

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return (
    <QuizProvider>
      <QuizChrome>{children}</QuizChrome>
    </QuizProvider>
  );
}
