'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Target, BookOpen, TrendingUp, Plus, 
  ChevronRight, ChevronDown, Edit2, Trash2, CheckCircle,
  Circle, AlertCircle, Sparkles, Brain, Zap, ArrowRight,
  BarChart3, Users, FileText, Video, Download, Star
} from 'lucide-react';

// Types
interface StudySubject {
  id: string;
  name: string;
  color: string;
  icon: string;
  totalHours: number;
  completedHours: number;
  topics: StudyTopic[];
}

interface StudyTopic {
  id: string;
  name: string;
  status: 'not-started' | 'in-progress' | 'completed';
  dueDate?: string;
  studyTime: number;
  resources: Resource[];
  spacedRepetitionData?: {
    nextReview: string;
    interval: number;
    easeFactor: number;
  };
}

interface Resource {
  id: string;
  type: 'video' | 'document' | 'quiz' | 'link';
  name: string;
  url: string;
  duration?: string;
}

interface StudySession {
  id: string;
  subject: string;
  topic: string;
  duration: number;
  completed: boolean;
  date: string;
}

interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  completed: boolean;
  subjectId: string;
}

// Sample data
const initialSubjects: StudySubject[] = [
  {
    id: 's1',
    name: 'Biology',
    color: '#22D3EE',
    icon: '🧬',
    totalHours: 40,
    completedHours: 12,
    topics: [
      {
        id: 't1',
        name: 'Cell Structure',
        status: 'completed',
        studyTime: 8,
        dueDate: '2026-03-20',
        resources: [
          { id: 'r1', type: 'video', name: 'Cell Structure Overview', url: '#', duration: '15 min' },
          { id: 'r2', type: 'document', name: 'Cell Organelles Guide', url: '#' }
        ],
        spacedRepetitionData: { nextReview: '2026-03-28', interval: 7, easeFactor: 2.5 }
      },
      {
        id: 't2',
        name: 'DNA & Genetics',
        status: 'in-progress',
        studyTime: 4,
        dueDate: '2026-03-25',
        resources: [
          { id: 'r3', type: 'video', name: 'DNA Replication', url: '#', duration: '20 min' },
          { id: 'r4', type: 'quiz', name: 'Genetics Practice', url: '#' }
        ]
      },
      {
        id: 't3',
        name: 'Evolution',
        status: 'not-started',
        studyTime: 0,
        dueDate: '2026-04-01',
        resources: [
          { id: 'r5', type: 'document', name: 'Evolution Theory', url: '#' }
        ]
      }
    ]
  },
  {
    id: 's2',
    name: 'Chemistry',
    color: '#A78BFA',
    icon: '⚗️',
    totalHours: 35,
    completedHours: 8,
    topics: [
      {
        id: 't4',
        name: 'Atomic Structure',
        status: 'completed',
        studyTime: 6,
        dueDate: '2026-03-18',
        resources: [
          { id: 'r6', type: 'video', name: 'Atoms & Elements', url: '#', duration: '18 min' }
        ]
      },
      {
        id: 't5',
        name: 'Chemical Bonding',
        status: 'in-progress',
        studyTime: 2,
        dueDate: '2026-03-27',
        resources: [
          { id: 'r7', type: 'video', name: 'Bonding Types', url: '#', duration: '25 min' }
        ]
      }
    ]
  },
  {
    id: 's3',
    name: 'Physics',
    color: '#F472B6',
    icon: '⚡',
    totalHours: 45,
    completedHours: 3,
    topics: [
      {
        id: 't6',
        name: 'Mechanics',
        status: 'in-progress',
        studyTime: 3,
        dueDate: '2026-03-30',
        resources: [
          { id: 'r8', type: 'video', name: 'Newton\'s Laws', url: '#', duration: '30 min' }
        ]
      }
    ]
  }
];

const initialMilestones: Milestone[] = [
  { id: 'm1', title: 'Complete Cell Structure Unit', targetDate: '2026-03-25', completed: false, subjectId: 's1' },
  { id: 'm2', title: 'Pass Biology Midterm', targetDate: '2026-04-15', completed: false, subjectId: 's1' },
  { id: 'm3', title: 'Finish Chemistry Basics', targetDate: '2026-04-01', completed: false, subjectId: 's2' }
];

const initialSessions: StudySession[] = [
  { id: 'sess1', subject: 'Biology', topic: 'DNA & Genetics', duration: 45, completed: true, date: '2026-03-24' },
  { id: 'sess2', subject: 'Chemistry', topic: 'Chemical Bonding', duration: 30, completed: true, date: '2026-03-24' },
  { id: 'sess3', subject: 'Biology', topic: 'Cell Structure', duration: 60, completed: true, date: '2026-03-23' }
];

export default function StudySchemePage() {
  const [subjects, setSubjects] = useState<StudySubject[]>(initialSubjects);
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [sessions, setSessions] = useState<StudySession[]>(initialSessions);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'progress'>('overview');
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  // Calculate stats
  const totalStudyHours = subjects.reduce((sum, s) => sum + s.completedHours, 0);
  const totalTargetHours = subjects.reduce((sum, s) => sum + s.totalHours, 0);
  const overallProgress = Math.round((totalStudyHours / totalTargetHours) * 100);
  const completedTopics = subjects.reduce((sum, s) => sum + s.topics.filter(t => t.status === 'completed').length, 0);
  const totalTopics = subjects.reduce((sum, s) => sum + s.topics.length, 0);
  const upcomingMilestones = milestones.filter(m => !m.completed).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in-progress': return 'text-cyan-400';
      default: return 'text-[#4B5563]';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-400/10';
      case 'in-progress': return 'bg-cyan-400/10';
      default: return 'bg-[#111421]';
    }
  };

  const toggleTopicExpand = (topicId: string) => {
    setExpandedTopic(expandedTopic === topicId ? null : topicId);
  };

  const toggleMilestone = (id: string) => {
    setMilestones(prev => prev.map(m => 
      m.id === id ? { ...m, completed: !m.completed } : m
    ));
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'quiz': return <Brain className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#090B13] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">Study Scheme</h1>
            <p className="text-[#4B5563]">Personalized learning pathway generator</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddSubject(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-400 text-[#090B13] rounded-xl font-bold text-sm hover:brightness-110 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Subject
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-[#0D101A] rounded-2xl p-6 border border-[#1E253A]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-[#4B5563] text-sm">Study Time</span>
            </div>
            <div className="text-3xl font-black text-white">{totalStudyHours}h</div>
            <div className="text-xs text-[#4B5563] mt-1">of {totalTargetHours}h target</div>
          </div>

          <div className="bg-[#0D101A] rounded-2xl p-6 border border-[#1E253A]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-[#4B5563] text-sm">Progress</span>
            </div>
            <div className="text-3xl font-black text-white">{overallProgress}%</div>
            <div className="text-xs text-[#4B5563] mt-1">Overall completion</div>
          </div>

          <div className="bg-[#0D101A] rounded-2xl p-6 border border-[#1E253A]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-[#4B5563] text-sm">Topics</span>
            </div>
            <div className="text-3xl font-black text-white">{completedTopics}/{totalTopics}</div>
            <div className="text-xs text-[#4B5563] mt-1">Topics completed</div>
          </div>

          <div className="bg-[#0D101A] rounded-2xl p-6 border border-[#1E253A]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="text-[#4B5563] text-sm">Milestones</span>
            </div>
            <div className="text-3xl font-black text-white">{upcomingMilestones}</div>
            <div className="text-xs text-[#4B5563] mt-1">Upcoming goals</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {['overview', 'schedule', 'progress'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? 'bg-cyan-400 text-[#090B13]'
                  : 'bg-[#0D101A] text-[#4B5563] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-3 gap-6">
            {/* Subjects */}
            <div className="col-span-2 space-y-4">
              <h2 className="text-lg font-black text-white mb-4">Your Subjects</h2>
              {subjects.map(subject => (
                <div 
                  key={subject.id}
                  className="bg-[#0D101A] rounded-2xl p-6 border border-[#1E253A] hover:border-[#2A3142] transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${subject.color}20` }}
                      >
                        {subject.icon}
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{subject.name}</h3>
                        <p className="text-xs text-[#4B5563]">{subject.topics.length} topics</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-white">{Math.round((subject.completedHours / subject.totalHours) * 100)}%</div>
                      <div className="text-xs text-[#4B5563]">complete</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 bg-[#090B13] rounded-full overflow-hidden mb-4">
                    <div 
                      className="h-full transition-all duration-500"
                      style={{ 
                        width: `${(subject.completedHours / subject.totalHours) * 100}%`,
                        backgroundColor: subject.color
                      }}
                    />
                  </div>

                  {/* Topics */}
                  <div className="space-y-2">
                    {subject.topics.map(topic => (
                      <div key={topic.id}>
                        <button
                          onClick={() => toggleTopicExpand(topic.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl ${getStatusBg(topic.status)} hover:brightness-110 transition-all`}
                        >
                          <div className="flex items-center gap-3">
                            {topic.status === 'completed' ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : topic.status === 'in-progress' ? (
                              <Circle className="w-4 h-4 text-cyan-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-[#4B5563]" />
                            )}
                            <span className={`text-sm font-medium ${getStatusColor(topic.status)}`}>
                              {topic.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            {topic.dueDate && (
                              <span className="text-xs text-[#4B5563]">Due: {topic.dueDate}</span>
                            )}
                            {expandedTopic === topic.id ? (
                              <ChevronDown className="w-4 h-4 text-[#4B5563]" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-[#4B5563]" />
                            )}
                          </div>
                        </button>

                        {/* Expanded Topic Details */}
                        {expandedTopic === topic.id && (
                          <div className="mt-2 pl-10 pr-4 pb-4">
                            <div className="bg-[#111421] rounded-xl p-4">
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <div className="text-xs text-[#4B5563] uppercase tracking-wider mb-1">Study Time</div>
                                  <div className="text-white font-medium">{topic.studyTime} hours</div>
                                </div>
                                {topic.spacedRepetitionData && (
                                  <div>
                                    <div className="text-xs text-[#4B5563] uppercase tracking-wider mb-1">Next Review</div>
                                    <div className="text-white font-medium">{topic.spacedRepetitionData.nextReview}</div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-xs text-[#4B5563] uppercase tracking-wider mb-2">Resources</div>
                              <div className="space-y-2">
                                {topic.resources.map(resource => (
                                  <a
                                    key={resource.id}
                                    href={resource.url}
                                    className="flex items-center gap-3 p-2 rounded-lg bg-[#090B13] hover:bg-[#1E253A] transition-colors"
                                  >
                                    <div className="text-[#4B5563]">{getResourceIcon(resource.type)}</div>
                                    <span className="text-white text-sm flex-1">{resource.name}</span>
                                    {resource.duration && (
                                      <span className="text-xs text-[#4B5563]">{resource.duration}</span>
                                    )}
                                    <Download className="w-4 h-4 text-[#4B5563]" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowAddTopic(true)}
                    className="w-full mt-3 flex items-center justify-center gap-2 p-2 rounded-xl border border-dashed border-[#1E253A] text-[#4B5563] hover:text-white hover:border-[#2A3142] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Add Topic</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Milestones */}
            <div className="space-y-4">
              <h2 className="text-lg font-black text-white mb-4">Milestones</h2>
              <div className="bg-[#0D101A] rounded-2xl p-6 border border-[#1E253A] space-y-3">
                {milestones.map(milestone => {
                  const subject = subjects.find(s => s.id === milestone.subjectId);
                  return (
                    <button
                      key={milestone.id}
                      onClick={() => toggleMilestone(milestone.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                        milestone.completed 
                          ? 'bg-green-400/10' 
                          : 'bg-[#111421] hover:bg-[#1E253A]'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        milestone.completed
                          ? 'border-green-400 bg-green-400'
                          : 'border-[#4B5563]'
                      }`}>
                        {milestone.completed && <CheckCircle className="w-3 h-3 text-[#090B13]" />}
                      </div>
                      <div className="flex-1 text-left">
                        <div className={`text-sm font-medium ${milestone.completed ? 'text-green-400 line-through' : 'text-white'}`}>
                          {milestone.title}
                        </div>
                        <div className="text-xs text-[#4B5563]">
                          {subject?.name} • Due {milestone.targetDate}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Spaced Repetition */}
              <div className="bg-[#0D101A] rounded-2xl p-6 border border-[#1E253A]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Spaced Repetition</h3>
                    <p className="text-xs text-[#4B5563]">AI-optimized review schedule</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-[#111421] rounded-xl">
                    <span className="text-sm text-white">Due for review today</span>
                    <span className="text-cyan-400 font-bold">2 topics</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#111421] rounded-xl">
                    <span className="text-sm text-white">Review streak</span>
                    <span className="text-green-400 font-bold">5 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-white mb-4">Weekly Schedule</h2>
            
            {/* Week View */}
            <div className="bg-[#0D101A] rounded-2xl p-6 border border-[#1E253A]">
              <div className="grid grid-cols-7 gap-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <div key={day} className="text-center">
                    <div className="text-xs text-[#4B5563] uppercase tracking-wider mb-3">{day}</div>
                    <div className="space-y-2">
                      {index < 5 && (
                        <>
                          <div className="p-2 bg-cyan-400/10 rounded-lg border border-cyan-400/20">
                            <div className="text-xs text-cyan-400 font-medium">Biology</div>
                            <div className="text-[10px] text-[#4B5563]">45 min</div>
                          </div>
                          {index % 2 === 0 && (
                            <div className="p-2 bg-purple-400/10 rounded-lg border border-purple-400/20">
                              <div className="text-xs text-purple-400 font-medium">Chemistry</div>
                              <div className="text-[10px] text-[#4B5563]">30 min</div>
                            </div>
                          )}
                        </>
                      )}
                      {index >= 5 && (
                        <div className="p-2 bg-[#111421] rounded-lg">
                          <div className="text-xs text-[#4B5563]">Free study</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Sessions */}
            <h2 className="text-lg font-black text-white mb-4">Today's Sessions</h2>
            <div className="space-y-3">
              {sessions.filter(s => s.date === '2026-03-24').map(session => (
                <div 
                  key={session.id}
                  className={`bg-[#0D101A] rounded-xl p-4 border border-[#1E253A] flex items-center justify-between ${
                    session.completed ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      session.completed ? 'bg-green-400/20' : 'bg-cyan-400/20'
                    }`}>
                      {session.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <Clock className="w-5 h-5 text-cyan-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-white font-medium">{session.topic}</div>
                      <div className="text-xs text-[#4B5563]">{session.subject} • {session.duration} min</div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-cyan-400 text-[#090B13] rounded-lg text-sm font-bold">
                    {session.completed ? 'Completed' : 'Start'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-white mb-4">Performance Analytics</h2>
            
            {/* Progress by Subject */}
            <div className="bg-[#0D101A] rounded-2xl p-6 border border-[#1E253A]">
              <h3 className="text-white font-bold mb-4">Progress by Subject</h3>
              <div className="space-y-4">
                {subjects.map(subject => (
                  <div key={subject.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{subject.icon}</span>
                        <span className="text-white font-medium">{subject.name}</span>
                      </div>
                      <span className="text-[#4B5563]">{subject.completedHours}/{subject.totalHours}h</span>
                    </div>
                    <div className="h-3 bg-[#090B13] rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500"
                        style={{ 
                          width: `${(subject.completedHours / subject.totalHours) * 100}%`,
                          backgroundColor: subject.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Study Streak */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#0D101A] rounded-2xl p-6 border border-[#1E253A]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Study Streak</h3>
                    <p className="text-xs text-[#4B5563]">Consecutive days</p>
                  </div>
                </div>
                <div className="text-4xl font-black text-white">5 <span className="text-lg text-[#4B5563]">days</span></div>
              </div>

              <div className="bg-[#0D101A] rounded-2xl p-6 border border-[#1E253A]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">This Week</h3>
                    <p className="text-xs text-[#4B5563]">Total study time</p>
                  </div>
                </div>
                <div className="text-4xl font-black text-white">12.5 <span className="text-lg text-[#4B5563]">hrs</span></div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-[#0D101A] rounded-2xl p-6 border border-[#1E253A]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold">AI Recommendations</h3>
                  <p className="text-xs text-[#4B5563]">Personalized study suggestions</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-[#111421] rounded-xl">
                  <Brain className="w-5 h-5 text-cyan-400 mt-0.5" />
                  <div>
                    <div className="text-white font-medium">Review Cell Structure</div>
                    <div className="text-sm text-[#4B5563]">Based on spaced repetition, you're due for a review</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-[#111421] rounded-xl">
                  <Target className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <div className="text-white font-medium">Focus on Chemical Bonding</div>
                    <div className="text-sm text-[#4B5563]">You've made good progress, keep it up!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
