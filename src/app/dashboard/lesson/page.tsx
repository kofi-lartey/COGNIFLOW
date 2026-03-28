'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Play, Pause, ChevronRight, ChevronLeft, BookOpen, 
  Video, FileText, Download, Bookmark, BookmarkCheck,
  Clock, CheckCircle, Circle, ArrowRight, Search,
  PenTool, Lightbulb, RotateCcw, Volume2, Maximize2,
  Brain, Sparkles, Star, Share2, MoreHorizontal
} from 'lucide-react';

// Types
interface LessonSection {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'interactive' | 'quiz' | 'diagram';
  content: string;
  duration?: string;
  completed: boolean;
  resources?: Resource[];
}

interface Resource {
  id: string;
  name: string;
  type: 'pdf' | 'video' | 'link' | 'document';
  url: string;
}

interface Note {
  id: string;
  sectionId: string;
  content: string;
  timestamp: string;
  createdAt: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  sections: LessonSection[];
  relatedLessons: { id: string; title: string; subject: string }[];
}

// Sample lesson data (fallback when no source is provided)
const sampleLesson: Lesson | null = null;

export default function LessonPage() {
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(sampleLesson);
  const [currentSection, setCurrentSection] = useState(0);
  const [progress, setProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [savedSections, setSavedSections] = useState<string[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);

  // Show empty state if no lesson is available
  if (!lesson) {
    return (
      <div className="min-h-screen bg-[#090B13] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
              <BookOpen className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">No lesson available</h3>
            <p className="text-slate-500 text-sm max-w-md mb-6">
              Upload documents to your vault and generate vivid lessons from your study materials.
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

  const section = lesson.sections[currentSection];
  const completedSections = lesson.sections.filter(s => s.completed).length;
  const progressPercent = Math.round((completedSections / lesson.sections.length) * 100);

  useEffect(() => {
    const completed = lesson.sections.filter(s => s.completed).length;
    setProgress(Math.round((completed / lesson.sections.length) * 100));
  }, [lesson.sections]);

  const markComplete = () => {
    const updatedSections = [...lesson.sections];
    updatedSections[currentSection] = { ...updatedSections[currentSection], completed: true };
    setLesson({ ...lesson, sections: updatedSections });
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    const note: Note = {
      id: `n${Date.now()}`,
      sectionId: section.id,
      content: newNote,
      timestamp: new Date().toLocaleTimeString(),
      createdAt: new Date().toISOString()
    };
    setNotes([...notes, note]);
    setNewNote('');
  };

  const toggleSaveSection = () => {
    if (savedSections.includes(section.id)) {
      setSavedSections(savedSections.filter(id => id !== section.id));
    } else {
      setSavedSections([...savedSections, section.id]);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5" />;
      case 'reading': return <FileText className="w-5 h-5" />;
      case 'interactive': return <Sparkles className="w-5 h-5" />;
      case 'quiz': return <Brain className="w-5 h-5" />;
      case 'diagram': return <BookOpen className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'text-cyan-400 bg-cyan-400/10';
      case 'reading': return 'text-purple-400 bg-purple-400/10';
      case 'interactive': return 'text-green-400 bg-green-400/10';
      case 'quiz': return 'text-yellow-400 bg-yellow-400/10';
      case 'diagram': return 'text-pink-400 bg-pink-400/10';
      default: return 'text-[#4B5563] bg-[#1E253A]';
    }
  };

  return (
    <div className="min-h-screen bg-[#090B13]">
      {/* Header */}
      <div className="bg-[#0D101A] border-b border-[#1E253A] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 rounded-lg bg-[#111421] text-[#4B5563] hover:text-white transition-colors"
              >
                <BookOpen className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-black text-white">{lesson.title}</h1>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-cyan-400">{lesson.subject}</span>
                  <span className="text-[#4B5563]">•</span>
                  <span className="text-[#4B5563] capitalize">{lesson.difficulty}</span>
                  <span className="text-[#4B5563]">•</span>
                  <span className="text-[#4B5563] flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {lesson.duration}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#111421] rounded-xl">
                <div className="w-24 h-2 bg-[#090B13] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-400 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-white text-sm font-medium">{progressPercent}%</span>
              </div>
              <button className="p-2 rounded-lg bg-[#111421] text-[#4B5563] hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg bg-[#111421] text-[#4B5563] hover:text-white transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Lesson Navigation */}
        {showSidebar && (
          <div className="w-80 bg-[#0D101A] border-r border-[#1E253A] h-[calc(100vh-73px)] overflow-y-auto sticky top-[73px]">
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563]" />
                <input
                  type="text"
                  placeholder="Search lessons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#111421] border border-[#1E253A] rounded-xl pl-10 pr-4 py-2 text-white text-sm placeholder:text-[#4B5563] focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                {lesson.sections.map((sec, index) => (
                  <button
                    key={sec.id}
                    onClick={() => setCurrentSection(index)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      currentSection === index
                        ? 'bg-cyan-400/10 border border-cyan-400/30'
                        : 'bg-[#111421] hover:bg-[#1E253A]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTypeColor(sec.type)}`}>
                      {sec.completed ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        getTypeIcon(sec.type)
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`text-sm font-medium ${currentSection === index ? 'text-white' : 'text-[#9CA3AF]'}`}>
                        {sec.title}
                      </div>
                      <div className="text-xs text-[#4B5563] flex items-center gap-2">
                        <span className="capitalize">{sec.type}</span>
                        {sec.duration && <span>• {sec.duration}</span>}
                      </div>
                    </div>
                    {savedSections.includes(sec.id) && (
                      <BookmarkCheck className="w-4 h-4 text-cyan-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Related Lessons */}
            <div className="p-4 border-t border-[#1E253A]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Related Lessons</h3>
              <div className="space-y-2">
                {lesson.relatedLessons.map(related => (
                  <button
                    key={related.id}
                    className="w-full flex items-center justify-between p-3 bg-[#111421] rounded-xl hover:bg-[#1E253A] transition-colors"
                  >
                    <div>
                      <div className="text-sm text-white">{related.title}</div>
                      <div className="text-xs text-[#4B5563]">{related.subject}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#4B5563]" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Section Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getTypeColor(section.type)}`}>
                  {section.type}
                </span>
                {section.duration && (
                  <span className="flex items-center gap-1 text-xs text-[#4B5563]">
                    <Clock className="w-3 h-3" /> {section.duration}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black text-white">{section.title}</h2>
            </div>

            {/* Content Area */}
            <div className="bg-[#0D101A] rounded-3xl border border-[#1E253A] overflow-hidden mb-6">
              {/* Video/Interactive Content Area */}
              {section.type === 'video' && (
                <div className="relative aspect-video bg-[#090B13] flex items-center justify-center">
                  {/* Simulated video player */}
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-cyan-400/20 flex items-center justify-center mb-4 mx-auto">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-16 h-16 rounded-full bg-cyan-400 flex items-center justify-center hover:brightness-110 transition-all"
                      >
                        {isPlaying ? (
                          <Pause className="w-8 h-8 text-[#090B13]" />
                        ) : (
                          <Play className="w-8 h-8 text-[#090B13] ml-1" />
                        )}
                      </button>
                    </div>
                    <p className="text-[#4B5563]">Click to {isPlaying ? 'pause' : 'play'} video lesson</p>
                  </div>
                  
                  {/* Video controls overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center gap-4">
                      <button className="text-white hover:text-cyan-400">
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>
                      <div className="flex-1 h-1 bg-[#1E253A] rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400 w-1/3" />
                      </div>
                      <span className="text-white text-sm">3:45 / {section.duration}</span>
                      <button className="text-white hover:text-cyan-400">
                        <Volume2 className="w-5 h-5" />
                      </button>
                      <button className="text-white hover:text-cyan-400">
                        <Maximize2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {section.type === 'interactive' && (
                <div className="p-8">
                  {/* Interactive simulation placeholder */}
                  <div className="bg-[#111421] rounded-2xl p-8 border border-[#1E253A]">
                    <div className="flex items-center justify-center gap-8 mb-8">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400/30 to-purple-400/30 flex items-center justify-center border-2 border-cyan-400/30">
                        <span className="text-cyan-400 font-bold">Phospholipid</span>
                      </div>
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400/30 to-cyan-400/30 flex items-center justify-center border-2 border-green-400/30">
                        <span className="text-green-400 font-bold">Protein</span>
                      </div>
                    </div>
                    <p className="text-center text-[#9CA3AF] mb-4">
                      Interactive: Cell Membrane Structure
                    </p>
                    <div className="flex justify-center">
                      <button className="px-4 py-2 bg-cyan-400 text-[#090B13] rounded-xl font-bold text-sm">
                        Launch Interactive Simulation
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {section.type === 'diagram' && (
                <div className="p-8">
                  {/* Interactive diagram */}
                  <div className="bg-[#111421] rounded-2xl p-8 border border-[#1E253A] min-h-[400px] flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-4">
                      {['Nucleus', 'Mitochondria', 'Ribosome', 'ER', 'Golgi', 'Lysosome'].map((organelle, i) => (
                        <button
                          key={organelle}
                          className="p-4 bg-[#0D101A] rounded-xl border border-[#1E253A] hover:border-cyan-400 hover:bg-cyan-400/5 transition-all group"
                        >
                          <div className="w-12 h-12 rounded-full bg-cyan-400/20 mx-auto mb-2 flex items-center justify-center group-hover:bg-cyan-400/30">
                            <span className="text-cyan-400 text-xs font-bold">{i + 1}</span>
                          </div>
                          <div className="text-white text-sm font-medium">{organelle}</div>
                          <div className="text-xs text-[#4B5563] mt-1">Click to learn</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {section.type === 'quiz' && (
                <div className="p-8">
                  <div className="bg-[#111421] rounded-2xl p-6 border border-[#1E253A] mb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Brain className="w-6 h-6 text-yellow-400" />
                      <span className="text-white font-bold">Knowledge Check</span>
                    </div>
                    <p className="text-[#9CA3AF] mb-6">Test your understanding of the previous sections</p>
                    <button className="w-full py-3 bg-cyan-400 text-[#090B13] rounded-xl font-bold">
                      Start Quiz
                    </button>
                  </div>
                </div>
              )}

              {section.type === 'reading' && (
                <div className="p-8">
                  <div className="prose prose-invert max-w-none">
                    <p className="text-[#9CA3AF] leading-relaxed">{section.content}</p>
                    
                    {/* Key Points */}
                    <div className="mt-6 bg-[#111421] rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                        <span className="text-white font-bold">Key Points</span>
                      </div>
                      <ul className="space-y-2">
                        <li className="text-[#9CA3AF] flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-cyan-400 mt-1" />
                          <span>Cells are the fundamental units of life</span>
                        </li>
                        <li className="text-[#9CA3AF] flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-cyan-400 mt-1" />
                          <span>The cell membrane controls what enters and exits the cell</span>
                        </li>
                        <li className="text-[#9CA3AF] flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-cyan-400 mt-1" />
                          <span>Mitochondria produce energy through cellular respiration</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Text Content (for all types) */}
              <div className="p-6 border-t border-[#1E253A]">
                <p className="text-[#9CA3AF] leading-relaxed">{section.content}</p>
              </div>
            </div>

            {/* Resources */}
            {section.resources && section.resources.length > 0 && (
              <div className="bg-[#0D101A] rounded-2xl p-6 border border-[#1E253A] mb-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5 text-cyan-400" />
                  Supplementary Resources
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {section.resources.map(resource => (
                    <a
                      key={resource.id}
                      href={resource.url}
                      className="flex items-center gap-3 p-3 bg-[#111421] rounded-xl hover:bg-[#1E253A] transition-colors"
                    >
                      <FileText className="w-5 h-5 text-[#4B5563]" />
                      <span className="text-white text-sm flex-1">{resource.name}</span>
                      <Download className="w-4 h-4 text-[#4B5563]" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Notes Section */}
            <div className="bg-[#0D101A] rounded-2xl border border-[#1E253A] mb-6">
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <PenTool className="w-5 h-5 text-cyan-400" />
                  <span className="text-white font-bold">My Notes</span>
                  <span className="text-xs text-[#4B5563]">({notes.filter(n => n.sectionId === section.id).length} notes)</span>
                </div>
                {showNotes ? (
                  <ChevronRight className="w-5 h-5 text-[#4B5563] rotate-90" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-[#4B5563]" />
                )}
              </button>
              
              {showNotes && (
                <div className="px-4 pb-4">
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note..."
                      className="flex-1 bg-[#111421] border border-[#1E253A] rounded-xl px-4 py-2 text-white text-sm placeholder:text-[#4B5563] focus:border-cyan-400 focus:outline-none"
                      onKeyPress={(e) => e.key === 'Enter' && addNote()}
                    />
                    <button
                      onClick={addNote}
                      className="px-4 py-2 bg-cyan-400 text-[#090B13] rounded-xl font-bold text-sm"
                    >
                      Add
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {notes.filter(n => n.sectionId === section.id).map(note => (
                      <div key={note.id} className="p-3 bg-[#111421] rounded-xl">
                        <p className="text-white text-sm">{note.content}</p>
                        <span className="text-xs text-[#4B5563]">{note.timestamp}</span>
                      </div>
                    ))}
                    {notes.filter(n => n.sectionId === section.id).length === 0 && (
                      <p className="text-[#4B5563] text-sm text-center py-4">No notes yet. Add your first note above.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                disabled={currentSection === 0}
                className="flex items-center gap-2 px-4 py-3 bg-[#0D101A] border border-[#1E253A] rounded-xl text-white hover:bg-[#111421] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                onClick={toggleSaveSection}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-colors ${
                  savedSections.includes(section.id)
                    ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/30'
                    : 'bg-[#0D101A] border border-[#1E253A] text-[#4B5563] hover:text-white'
                }`}
              >
                {savedSections.includes(section.id) ? (
                  <>
                    <BookmarkCheck className="w-4 h-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    Save
                  </>
                )}
              </button>

              {currentSection === lesson.sections.length - 1 ? (
                <button className="flex items-center gap-2 px-6 py-3 bg-green-400 text-[#090B13] rounded-xl font-bold hover:brightness-110 transition-all">
                  <CheckCircle className="w-4 h-4" />
                  Complete Lesson
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  {!section.completed && (
                    <button
                      onClick={markComplete}
                      className="flex items-center gap-2 px-4 py-3 bg-[#0D101A] border border-[#1E253A] rounded-xl text-[#4B5563] hover:text-white transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Complete
                    </button>
                  )}
                  <button
                    onClick={() => setCurrentSection(Math.min(lesson.sections.length - 1, currentSection + 1))}
                    className="flex items-center gap-2 px-6 py-3 bg-cyan-400 text-[#090B13] rounded-xl font-bold hover:brightness-110 transition-all"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
