'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Brain, CheckCircle, XCircle, Clock, ChevronRight, 
  ChevronLeft, FileText, Lightbulb, Target, TrendingUp,
  BookOpen, AlertCircle, Sparkles, ArrowRight, RotateCcw
} from 'lucide-react';

// Question types
type QuestionType = 'multiple-choice' | 'multiple-answer' | 'fill-blank' | 'true-false' | 'essay';

interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[] | number | number[];
  explanation?: string;
  points: number;
  category?: string;
}

interface QuizResult {
  questionId: string;
  userAnswer: string | string[] | number | number[];
  isCorrect: boolean;
  pointsEarned: number;
  feedback: string;
  suggestions: string[];
}

// Dynamic quiz generation based on source document
const generateQuizFromSource = (sourceDocument: string, title: string): Question[] => {
  // In a real application, this would analyze the document content
  // and generate relevant questions. Here we simulate it based on the source.
  
  const sourceLower = sourceDocument.toLowerCase();
  const titleLower = title.toLowerCase();
  
  // Determine subject based on source document
  let subject = 'General';
  if (sourceLower.includes('quantum') || sourceLower.includes('physics')) {
    subject = 'Quantum Physics';
  } else if (sourceLower.includes('neural') || sourceLower.includes('deep learning') || sourceLower.includes('ai')) {
    subject = 'Machine Learning';
  } else if (sourceLower.includes('crypto') || sourceLower.includes('cryptography')) {
    subject = 'Cryptography';
  } else if (sourceLower.includes('bio') || sourceLower.includes('cell') || sourceLower.includes('mitosis')) {
    subject = 'Biology';
  } else if (sourceLower.includes('python') || sourceLower.includes('algorithm')) {
    subject = 'Computer Science';
  }
  
  // Generate questions based on subject
  const questions: Question[] = [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: `What is a key concept covered in "${title}"?`,
      options: [
        `The fundamental principles of ${subject}`,
        'Unrelated mathematical concepts',
        'Historical events in technology',
        'Artistic movements in the Renaissance'
      ],
      correctAnswer: 0,
      explanation: `This question tests understanding of the core concepts from the ${sourceDocument} document.`,
      points: 10,
      category: subject
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      question: `Which terminology from "${sourceDocument}" is correctly defined?`,
      options: [
        'Key term: The primary mechanism discussed in the document',
        'Key term: An unrelated concept from a different field',
        'Key term: A historical period',
        'Key term: A geographical location'
      ],
      correctAnswer: 0,
      explanation: 'This tests knowledge of key terminology from the source document.',
      points: 10,
      category: subject
    },
    {
      id: 'q3',
      type: 'multiple-answer',
      question: `Based on "${sourceDocument}", which of the following are main ideas? (Select all that apply)`,
      options: [
        'Core principles and theories',
        'Practical applications',
        'Unrelated anecdotes',
        'Key methodologies'
      ],
      correctAnswer: [0, 1, 3],
      explanation: `The main ideas from ${sourceDocument} include core principles, applications, and methodologies.`,
      points: 15,
      category: subject
    },
    {
      id: 'q4',
      type: 'fill-blank',
      question: `The document "${sourceDocument}" primarily discusses ________ in the context of ${subject}.`,
      correctAnswer: ['fundamentals', 'concepts', 'principles', 'basics'],
      explanation: `This fill-in-the-blank tests comprehension of the main topic from the document.`,
      points: 10,
      category: subject
    },
    {
      id: 'q5',
      type: 'true-false',
      question: `The concepts in "${sourceDocument}" are applicable to real-world scenarios in ${subject}.`,
      correctAnswer: 'true',
      explanation: `The document provides practical knowledge that can be applied in ${subject} contexts.`,
      points: 10,
      category: subject
    },
    {
      id: 'q6',
      type: 'essay',
      question: `Explain the main ideas presented in "${sourceDocument}" and how they relate to ${subject}. Provide specific examples to demonstrate your understanding of the document's key concepts.`,
      correctAnswer: '',
      explanation: 'This essay question tests comprehensive understanding of the document.',
      points: 25,
      category: subject
    }
  ];
  
  return questions;
};

// Sample quiz data (fallback when no source is provided)
const sampleQuiz: Question[] = [];

export default function QuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sourceDocument = searchParams.get('source') || '';
  const quizTitle = searchParams.get('title') || '';
  const contentId = searchParams.get('id') || '';
  
  // Generate quiz based on source document or use default
  const quizQuestions = useMemo(() => {
    if (sourceDocument) {
      return generateQuizFromSource(sourceDocument, quizTitle);
    }
    return sampleQuiz;
  }, [sourceDocument, quizTitle]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number | number[]>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isGrading, setIsGrading] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});

  // Timer
  useEffect(() => {
    if (showResults) return;
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: string, answer: string | string[] | number | number[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  // AI Grading simulation
  const gradeAnswer = async (question: Question, userAnswer: string | string[] | number | number[]): Promise<QuizResult> => {
    // Simulate AI grading delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let isCorrect = false;
    let feedback = '';
    let suggestions: string[] = [];
    let pointsEarned = 0;

    switch (question.type) {
      case 'multiple-choice':
        isCorrect = userAnswer === question.correctAnswer;
        pointsEarned = isCorrect ? question.points : 0;
        feedback = isCorrect 
          ? 'Excellent! You selected the correct answer.' 
          : `Incorrect. The correct answer is: ${question.options?.[question.correctAnswer as number]}`;
        if (!isCorrect) {
          suggestions = ['Review the related concept in your study materials', 'Consider the context of the question more carefully'];
        }
        break;

      case 'multiple-answer':
        const userArr: number[] = Array.isArray(userAnswer) ? (userAnswer as number[]) : [];
        const correctArr: number[] = Array.isArray(question.correctAnswer) ? (question.correctAnswer as number[]) : [];
        isCorrect = userArr.length === correctArr.length && userArr.every((a) => correctArr.includes(a));
        pointsEarned = isCorrect ? question.points : Math.floor(question.points * 0.5);
        feedback = isCorrect
          ? 'Perfect! You identified all correct answers.'
          : `Partially correct. You got ${userArr.length} out of ${correctArr.length} correct.`;
        if (!isCorrect) {
          suggestions = ['Review all options carefully', 'Look for keywords that indicate correct answers'];
        }
        break;

      case 'fill-blank':
        const userAnswerStr = String(userAnswer).toLowerCase().trim();
        const correctAnswers: string[] = Array.isArray(question.correctAnswer) 
          ? (question.correctAnswer as string[]) 
          : [String(question.correctAnswer)];
        isCorrect = correctAnswers.some((ans) => ans.toLowerCase() === userAnswerStr);
        pointsEarned = isCorrect ? question.points : 0;
        feedback = isCorrect
          ? 'Correct! Your answer matches the expected response.'
          : `The expected answer is: ${correctAnswers[0]}`;
        if (!isCorrect) {
          suggestions = ['Pay attention to spelling and terminology', 'Review key definitions and concepts'];
        }
        break;

      case 'true-false':
        isCorrect = String(userAnswer).toLowerCase() === String(question.correctAnswer).toLowerCase();
        pointsEarned = isCorrect ? question.points : 0;
        feedback = isCorrect
          ? 'Correct! Your understanding is accurate.'
          : `Incorrect. The statement is ${question.correctAnswer}.`;
        if (!isCorrect) {
          suggestions = ['Review the fundamental concepts', 'Be careful with wording in true/false questions'];
        }
        break;

      case 'essay':
        // Simulate AI essay grading
        const essayLength = String(userAnswer).length;
        isCorrect = essayLength > 100;
        pointsEarned = isCorrect ? Math.min(question.points, Math.floor(essayLength / 20)) : 0;
        feedback = isCorrect
          ? 'Good response! You provided a detailed answer.'
          : 'Your response is too brief. Please provide more detailed explanations.';
        if (essayLength < 200) {
          suggestions = ['Expand on your points with more examples', 'Include more supporting evidence', 'Structure your answer with clear paragraphs'];
        } else {
          suggestions = ['Consider adding more specific examples', 'Review your answer for clarity and coherence'];
        }
        break;
    }

    return {
      questionId: question.id,
      userAnswer,
      isCorrect,
      pointsEarned,
      feedback,
      suggestions
    };
  };

  const submitQuiz = async () => {
    setIsGrading(true);
    const gradedResults: QuizResult[] = [];

    for (const question of quizQuestions) {
      const userAnswer = answers[question.id] ?? '';
      const result = await gradeAnswer(question, userAnswer);
      gradedResults.push(result);
    }

    setResults(gradedResults);
    setShowResults(true);
    setIsGrading(false);
  };

  const toggleExplanation = (questionId: string) => {
    setShowExplanation(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setResults([]);
    setTimeElapsed(0);
    setShowExplanation({});
  };

  const totalPoints = quizQuestions.reduce((sum, q) => sum + q.points, 0);
  const earnedPoints = results.reduce((sum, r) => sum + r.pointsEarned, 0);
  const percentage = Math.round((earnedPoints / totalPoints) * 100);

  const getPerformanceLevel = () => {
    if (percentage >= 90) return { level: 'Expert', color: 'text-green-400' };
    if (percentage >= 70) return { level: 'Proficient', color: 'text-cyan-400' };
    if (percentage >= 50) return { level: 'Developing', color: 'text-yellow-400' };
    return { level: 'Needs Improvement', color: 'text-red-400' };
  };

  const performance = getPerformanceLevel();

  if (showResults) {
    return (
      <div className="min-h-screen bg-[#090B13] p-8">
        <div className="max-w-4xl mx-auto">
          {/* Results Header */}
          <div className="bg-[#0D101A] rounded-3xl p-8 mb-8 border border-[#1E253A]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-black text-white mb-2">Quiz Results</h1>
                <p className="text-[#4B5563]">Comprehensive performance analysis</p>
              </div>
              <button
                onClick={restartQuiz}
                className="flex items-center gap-2 px-4 py-2 bg-[#1E253A] rounded-xl text-white hover:bg-[#2A3142] transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Retry Quiz
              </button>
            </div>

            {/* Score Display */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-[#111421] rounded-2xl p-6 text-center">
                <div className="text-4xl font-black text-cyan-400 mb-2">{percentage}%</div>
                <div className="text-xs text-[#4B5563] uppercase tracking-wider">Score</div>
              </div>
              <div className="bg-[#111421] rounded-2xl p-6 text-center">
                <div className="text-4xl font-black text-white mb-2">{earnedPoints}/{totalPoints}</div>
                <div className="text-xs text-[#4B5563] uppercase tracking-wider">Points</div>
              </div>
              <div className="bg-[#111421] rounded-2xl p-6 text-center">
                <div className="text-4xl font-black text-white mb-2">{formatTime(timeElapsed)}</div>
                <div className="text-xs text-[#4B5563] uppercase tracking-wider">Time</div>
              </div>
              <div className="bg-[#111421] rounded-2xl p-6 text-center">
                <div className={`text-4xl font-black mb-2 ${performance.color}`}>{performance.level}</div>
                <div className="text-xs text-[#4B5563] uppercase tracking-wider">Level</div>
              </div>
            </div>

            {/* Performance Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#4B5563]">Performance</span>
                <span className="text-white">{results.filter(r => r.isCorrect).length}/{results.length} correct</span>
              </div>
              <div className="h-3 bg-[#090B13] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500 transition-all duration-1000"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Question Results */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-white mb-4">Detailed Analysis</h2>
            {quizQuestions.map((question, index) => {
              const result = results[index];
              return (
                <div 
                  key={question.id}
                  className={`bg-[#0D101A] rounded-2xl p-6 border ${
                    result.isCorrect ? 'border-green-500/20' : 'border-red-500/20'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      result.isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {result.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-[#4B5563] uppercase">{question.category}</span>
                        <span className="text-xs text-[#4B5563]">•</span>
                        <span className="text-xs text-[#4B5563] uppercase">{question.type.replace('-', ' ')}</span>
                        <span className="text-xs text-cyan-400 ml-auto">{result.pointsEarned}/{question.points} pts</span>
                      </div>
                      <h3 className="text-white font-medium mb-3">{question.question}</h3>
                      
                      {/* User Answer */}
                      <div className="bg-[#111421] rounded-xl p-4 mb-3">
                        <div className="text-xs text-[#4B5563] uppercase tracking-wider mb-2">Your Answer</div>
                        <div className="text-white">
                          {Array.isArray(result.userAnswer) 
                            ? (result.userAnswer as number[]).map((i) => question.options?.[i]).join(', ')
                            : String(result.userAnswer) || '(No answer provided)'
                          }
                        </div>
                      </div>

                      {/* Correct Answer */}
                      {!result.isCorrect && (
                        <div className="bg-green-500/10 rounded-xl p-4 mb-3">
                          <div className="text-xs text-green-400 uppercase tracking-wider mb-2">Correct Answer</div>
                          <div className="text-white">
                            {question.type === 'multiple-choice' || question.type === 'multiple-answer'
                              ? (Array.isArray(question.correctAnswer) 
                                  ? (question.correctAnswer as number[]).map((i) => question.options?.[i]).join(', ')
                                  : question.options?.[question.correctAnswer as number])
                              : String(question.correctAnswer)
                            }
                          </div>
                        </div>
                      )}

                      {/* Feedback */}
                      <div className="bg-cyan-500/10 rounded-xl p-4 mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs text-cyan-400 uppercase tracking-wider">AI Feedback</span>
                        </div>
                        <p className="text-white text-sm">{result.feedback}</p>
                      </div>

                      {/* Suggestions */}
                      {result.suggestions.length > 0 && (
                        <div className="bg-[#111421] rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-4 h-4 text-yellow-400" />
                            <span className="text-xs text-yellow-400 uppercase tracking-wider">Suggestions</span>
                          </div>
                          <ul className="space-y-1">
                            {result.suggestions.map((suggestion, i) => (
                              <li key={i} className="text-[#9CA3AF] text-sm flex items-center gap-2">
                                <ArrowRight className="w-3 h-3 text-[#4B5563]" />
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Areas for Improvement */}
          <div className="bg-[#0D101A] rounded-2xl p-6 border border-[#1E253A] mt-8">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-black text-white">Areas for Further Study</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {results.filter(r => !r.isCorrect).map((r, i) => {
                const question = quizQuestions.find(q => q.id === r.questionId);
                return (
                  <div key={i} className="bg-[#111421] rounded-xl p-4">
                    <div className="text-xs text-red-400 uppercase tracking-wider mb-2">Needs Improvement</div>
                    <p className="text-white text-sm line-clamp-2">{question?.question}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  // Show empty state if no quiz questions available
  if (quizQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-[#090B13] p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
              <FileText className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">No quiz available</h3>
            <p className="text-slate-500 text-sm max-w-md mb-6">
              Upload documents to your vault and generate quizzes from your study materials.
            </p>
            <button 
              onClick={() => router.push('/dashboard/vault')}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
            >
              Go to Vault
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090B13] p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">Interactive Quiz</h1>
            <p className="text-[#4B5563]">Test your knowledge with AI-powered grading</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#0D101A] px-4 py-2 rounded-xl border border-[#1E253A]">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-white font-mono">{formatTime(timeElapsed)}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-[#0D101A] rounded-2xl p-6 mb-6 border border-[#1E253A]">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-[#4B5563]">Question {currentQuestion + 1} of {quizQuestions.length}</span>
            <span className="text-cyan-400">{Math.round(progress)}% Complete</span>
          </div>
          <div className="h-2 bg-[#090B13] rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-[#0D101A] rounded-3xl p-8 border border-[#1E253A]">
          {/* Question Type Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-cyan-400/10 text-cyan-400 text-xs font-bold uppercase tracking-wider rounded-full">
              {question.type.replace('-', ' ')}
            </span>
            <span className="px-3 py-1 bg-[#1E253A] text-[#4B5563] text-xs font-bold uppercase tracking-wider rounded-full">
              {question.points} pts
            </span>
            {question.category && (
              <span className="px-3 py-1 bg-[#1E253A] text-[#4B5563] text-xs font-bold uppercase tracking-wider rounded-full">
                {question.category}
              </span>
            )}
          </div>

          {/* Question Text */}
          <h2 className="text-xl font-medium text-white mb-8">{question.question}</h2>

          {/* Answer Options */}
          {question.type === 'multiple-choice' && (
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(question.id, index)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    answers[question.id] === index
                      ? 'bg-cyan-400/10 border-cyan-400 text-white'
                      : 'bg-[#111421] border-[#1E253A] text-[#9CA3AF] hover:border-[#2A3142]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[question.id] === index
                        ? 'border-cyan-400 bg-cyan-400'
                        : 'border-[#4B5563]'
                    }`}>
                      {answers[question.id] === index && (
                        <div className="w-2 h-2 bg-[#090B13] rounded-full" />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {question.type === 'multiple-answer' && (
            <div className="space-y-3">
              {question.options?.map((option, index) => {
                const selected = Array.isArray(answers[question.id]) 
                  ? (answers[question.id] as number[]).includes(index)
                  : false;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      const current = Array.isArray(answers[question.id]) ? answers[question.id] as number[] : [];
                      const newAnswer = selected
                        ? current.filter(i => i !== index)
                        : [...current, index];
                      handleAnswer(question.id, newAnswer);
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selected
                        ? 'bg-cyan-400/10 border-cyan-400 text-white'
                        : 'bg-[#111421] border-[#1E253A] text-[#9CA3AF] hover:border-[#2A3142]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                        selected
                          ? 'border-cyan-400 bg-cyan-400'
                          : 'border-[#4B5563]'
                      }`}>
                        {selected && (
                          <CheckCircle className="w-4 h-4 text-[#090B13]" />
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                );
              })}
              <p className="text-xs text-[#4B5563] mt-2">Select all that apply</p>
            </div>
          )}

          {question.type === 'fill-blank' && (
            <div>
              <input
                type="text"
                value={answers[question.id] as string || ''}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                placeholder="Type your answer here..."
                className="w-full bg-[#111421] border border-[#1E253A] rounded-xl px-5 py-4 text-white placeholder:text-[#4B5563] focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 outline-none transition-all"
              />
            </div>
          )}

          {question.type === 'true-false' && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleAnswer(question.id, 'true')}
                className={`p-6 rounded-xl border transition-all ${
                  answers[question.id] === 'true'
                    ? 'bg-cyan-400/10 border-cyan-400 text-white'
                    : 'bg-[#111421] border-[#1E253A] text-[#9CA3AF] hover:border-[#2A3142]'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">✓</div>
                  <div className="font-medium">True</div>
                </div>
              </button>
              <button
                onClick={() => handleAnswer(question.id, 'false')}
                className={`p-6 rounded-xl border transition-all ${
                  answers[question.id] === 'false'
                    ? 'bg-cyan-400/10 border-cyan-400 text-white'
                    : 'bg-[#111421] border-[#1E253A] text-[#9CA3AF] hover:border-[#2A3142]'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">✗</div>
                  <div className="font-medium">False</div>
                </div>
              </button>
            </div>
          )}

          {question.type === 'essay' && (
            <div>
              <textarea
                value={answers[question.id] as string || ''}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                placeholder="Write your detailed answer here..."
                rows={8}
                className="w-full bg-[#111421] border border-[#1E253A] rounded-xl px-5 py-4 text-white placeholder:text-[#4B5563] focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 outline-none transition-all resize-none"
              />
              <p className="text-xs text-[#4B5563] mt-2">Provide a comprehensive answer with examples</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 px-4 py-3 bg-[#0D101A] border border-[#1E253A] rounded-xl text-white hover:bg-[#111421] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {currentQuestion === quizQuestions.length - 1 ? (
            <button
              onClick={submitQuiz}
              disabled={isGrading}
              className="flex items-center gap-2 px-6 py-3 bg-cyan-400 text-[#090B13] rounded-xl font-bold hover:brightness-110 disabled:opacity-50 transition-all"
            >
              {isGrading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#090B13] border-t-transparent rounded-full animate-spin" />
                  AI Grading...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Submit Quiz
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(prev => Math.min(quizQuestions.length - 1, prev + 1))}
              className="flex items-center gap-2 px-6 py-3 bg-cyan-400 text-[#090B13] rounded-xl font-bold hover:brightness-110 transition-all"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="mt-8 bg-[#0D101A] rounded-2xl p-4 border border-[#1E253A]">
          <div className="text-xs text-[#4B5563] uppercase tracking-wider mb-3">Question Navigator</div>
          <div className="flex flex-wrap gap-2">
            {quizQuestions.map((q, index) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = index === currentQuestion;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                    isCurrent
                      ? 'bg-cyan-400 text-[#090B13]'
                      : isAnswered
                        ? 'bg-[#1E253A] text-cyan-400 border border-cyan-400/30'
                        : 'bg-[#111421] text-[#4B5563] hover:bg-[#1E253A]'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
