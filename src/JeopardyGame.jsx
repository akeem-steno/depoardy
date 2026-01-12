import React, { useState, useEffect } from 'react';

const JeopardyGame = () => {
  const [screen, setScreen] = useState('start');
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [gameMode, setGameMode] = useState(null); // null, 'speed', or 'streak'
  const [timeLeft, setTimeLeft] = useState(10);
  const [timerActive, setTimerActive] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [showPracticeAnswer, setShowPracticeAnswer] = useState(false);
  const [masteredQuestions, setMasteredQuestions] = useState(new Set());

  // Guru card links for each question
  const guruLinks = {
    'tech-100': 'https://app.getguru.com/card/TGe8gpMc/Provider-Dashboard-Job-Details-Overview',
    'tech-200': null,
    'tech-300': 'https://app.getguru.com/card/TrgGjqnc/Videographer-Equipment-Use-Policy-and-Expectations',
    'tech-400': 'https://app.getguru.com/card/TrgGjqnc/Videographer-Equipment-Use-Policy-and-Expectations',
    'tech-500': 'https://app.getguru.com/card/TrgGjqnc/Videographer-Equipment-Use-Policy-and-Expectations',
    'depo-100': 'https://app.getguru.com/card/TkyKkoac/Time-Reporting-and-Punctuality-Requirements',
    'depo-200': 'https://app.getguru.com/card/TkyKkoac/Time-Reporting-and-Punctuality-Requirements',
    'depo-300': 'https://app.getguru.com/card/TkyKkoac/Time-Reporting-and-Punctuality-Requirements',
    'depo-400': 'https://app.getguru.com/card/TkyKkoac/Time-Reporting-and-Punctuality-Requirements',
    'depo-500': 'https://app.getguru.com/card/cqxnG6Ai/Video-Specialist-Job-Codes-Comprehensive-Guide',
    'trouble-100': 'https://app.getguru.com/card/i7xnGpoT/Quality-Rubric-Breakdown',
    'trouble-200': 'https://app.getguru.com/card/TkyKkoac/Time-Reporting-and-Punctuality-Requirements',
    'trouble-300': 'https://app.getguru.com/card/TkyKkoac/Time-Reporting-and-Punctuality-Requirements',
    'trouble-400': 'https://app.getguru.com/card/TX5je4dc/Common-AWSOBS-Recording-Issues-Impact-Resolution-Guide',
    'trouble-500': 'https://app.getguru.com/card/iBKpLE8T/Private-Manager-Channels-PMCs',
    'policy-100': 'https://app.getguru.com/card/cEeBoxXi/End-Your-Day-Here-Deposition-Assignments-Schedule',
    'policy-200': 'https://app.getguru.com/card/Tjx8XkLc/Cancellation-Fee-Policy-Overview',
    'policy-300': 'https://app.getguru.com/card/c67E9jGi/Enter-Videographer-Availability-via-Provider-Dashboard',
    'policy-400': 'https://app.getguru.com/card/Tjx8XkLc/Cancellation-Fee-Policy-Overview',
    'policy-500': 'https://app.getguru.com/card/cqxnG6Ai/Video-Specialist-Job-Codes-Comprehensive-Guide',
    'breaks-100': 'https://app.getguru.com/card/cb5zK4ki/Rest-and-Meal-Breaks-Policy-for-Vid-Squad',
    'breaks-200': 'https://app.getguru.com/card/cb5zK4ki/Rest-and-Meal-Breaks-Policy-for-Vid-Squad',
    'breaks-300': 'https://app.getguru.com/card/cb5zK4ki/Rest-and-Meal-Breaks-Policy-for-Vid-Squad',
    'breaks-400': 'https://app.getguru.com/card/TEry8X7c/Video-Team-Meeting-Attendance-and-Professionalism',
    'breaks-500': 'https://app.getguru.com/card/ToyKogzc/11-with-Supervisor-as-a-Video-Specialist'
  };

  // Flatten all questions for practice mode
  const getAllPracticeQuestions = () => {
    const allQuestions = [];
    categories.forEach((category, catIndex) => {
      category.questions.forEach((question, qIndex) => {
        const categoryKey = ['tech', 'depo', 'trouble', 'policy', 'breaks'][catIndex];
        allQuestions.push({
          ...question,
          categoryName: category.name,
          categoryColor: category.color,
          guruLink: guruLinks[`${categoryKey}-${question.points}`]
        });
      });
    });
    return allQuestions;
  };

  // Timer logic for speed round
  useEffect(() => {
    let interval;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up - treat as wrong answer
            setTimerActive(false);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const handleTimeUp = () => {
    playSound('incorrect');
    setShowResult(true);
    if (gameMode === 'streak') {
      setCurrentStreak(0);
    }
    setTimeout(() => {
      handleAnswerWrong();
    }, 1500);
  };

  // Confetti Effect
  const Confetti = () => {
    const confettiColors = ['#fdba74', '#5eead4', '#c084fc', '#93c5fd', '#f9a8d4', '#fde047'];
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)]
    }));

    return (
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <style>{`
          @keyframes confetti-fall {
            0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }
        `}</style>
        {pieces.map(piece => (
          <div
            key={piece.id}
            className="absolute w-3 h-3 rounded-sm"
            style={{
              left: `${piece.left}%`,
              backgroundColor: piece.color,
              animation: `confetti-fall ${piece.duration}s linear ${piece.delay}s`,
              top: '-10px'
            }}
          />
        ))}
      </div>
    );
  };

  // Sound Effects
  const playSound = (type) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'click') {
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === 'correct') {
      // Happy ascending notes
      [523, 659, 784].forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3, audioContext.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.3);
        osc.start(audioContext.currentTime + i * 0.1);
        osc.stop(audioContext.currentTime + i * 0.1 + 0.3);
      });
    } else if (type === 'incorrect') {
      // Descending buzz
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } else if (type === 'tile') {
      oscillator.frequency.value = 1200;
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } else if (type === 'streak') {
      // Celebration sound for streak
      [784, 988, 1175].forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.25, audioContext.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.08 + 0.2);
        osc.start(audioContext.currentTime + i * 0.08);
        osc.stop(audioContext.currentTime + i * 0.08 + 0.2);
      });
    }
  };

  // Game data
  const categories = [
    {
      name: "TECH SYSTEMS",
      color: "bg-orange-300",
      tileColor: "bg-orange-400",
      questions: [
        { 
          points: 100, 
          question: "What platform do you use to access your schedule and deposition assignments?", 
          correctAnswer: "What is Provider Dashboard?",
          options: ["What is Steno Portal?", "What is Workforce Manager?", "What is Provider Dashboard?"]
        },
        { 
          points: 200, 
          question: "What software do we use to record depositions?", 
          correctAnswer: "What is OBS (Open Broadcaster Software)?",
          options: ["What is Zoom Recording?", "What is OBS (Open Broadcaster Software)?", "What is StreamLabs?"]
        },
        { 
          points: 300, 
          question: "What's the minimum internet speed required for videographers? (Download and Upload)", 
          correctAnswer: "What is at least 100 mbps download and at least 20 mbps upload?",
          options: ["What is at least 100 mbps download and at least 20 mbps upload?", "What is at least 50 mbps download and 10 mbps upload?", "What is at least 200 mbps download and 50 mbps upload?"]
        },
        { 
          points: 400, 
          question: "When should you initiate system and application updates?", 
          correctAnswer: "What is at the end of each workday during your 15-minute end-of-day buffer?",
          options: ["What is first thing in the morning?", "What is during your lunch break?", "What is at the end of each workday during your 15-minute end-of-day buffer?"]
        },
        { 
          points: 500, 
          question: "You arrive to your shift and Windows needs to install critical security updates. What's the proper procedure according to policy?", 
          correctAnswer: "What is notify your direct manager via PMC for guidance?",
          options: ["What is install them immediately regardless of timing?", "What is notify your direct manager via PMC for guidance?", "What is skip them until the weekend?"]
        }
      ]
    },
    {
      name: "DEPOSITION BASICS",
      color: "bg-teal-300",
      tileColor: "bg-teal-400",
      questions: [
        { 
          points: 100, 
          question: "How many minutes before the scheduled start time must you check in and join the remote meeting room?", 
          correctAnswer: "What is 30 minutes?",
          options: ["What is 15 minutes?", "What is 20 minutes?", "What is 30 minutes?"]
        },
        { 
          points: 200, 
          question: "As a new hire with 90 days or less of tenure, how early can you clock in before your FIRST job of the day?", 
          correctAnswer: "What is up to 30 minutes before the scheduled join time?",
          options: ["What is up to 30 minutes before the scheduled join time?", "What is up to 15 minutes before check-in time?", "What is up to 30 minutes before check-in time?"]
        },
        { 
          points: 300, 
          question: "You're a videographer with more than 90 days of tenure. How early can you clock in before your first job vs. subsequent jobs?", 
          correctAnswer: "What is no more than 15 minutes before the first job, and no more than 5 minutes before subsequent jobs?",
          options: ["What is no more than 30 minutes before the first job, and no more than 15 minutes before subsequent jobs?", "What is no more than 15 minutes before the first job, and no more than 5 minutes before subsequent jobs?", "What is no more than 5 minutes before all jobs?"]
        },
        { 
          points: 400, 
          question: "How much wrap-up time do you get after each job versus after your FINAL job of the day?", 
          correctAnswer: "What is 5 minutes after each job, but 15 minutes after your final job?",
          options: ["What is 15 minutes after each job?", "What is 10 minutes after each job?", "What is 5 minutes after each job, but 15 minutes after your final job?"]
        },
        { 
          points: 500, 
          question: "You need to transfer a job to another videographer mid-deposition due to an emergency. What must you document on your timecard?", 
          correctAnswer: "What is '[Job Code]: Job [#####] transfer to/from Video Specialist Name'?",
          options: ["What is '[Job Code]: Job transfer [#####] - emergency'?", "What is '[Job Code]: Job [#####] transfer to/from Video Specialist Name'?", "What is 'Job [#####] transferred to [VS Name]' in timecard notes?"]
        }
      ]
    },
    {
      name: "TROUBLESHOOTING",
      color: "bg-purple-300",
      tileColor: "bg-purple-400",
      questions: [
        { 
          points: 100, 
          question: "In your OBS recording, where must the Zoom gallery be positioned relative to the deponent's video?", 
          correctAnswer: "What is above the deponent, including non-video participants?",
          options: ["What is beside the deponent in grid view?", "What is above the deponent, including non-video participants?", "What is below the deponent with speaker view active?"]
        },
        { 
          points: 200, 
          question: "What should you do if you're running late and won't make the check-in time?", 
          correctAnswer: "What is notify your direct manager via PMC at least one hour before your scheduled start time?",
          options: ["What is just join as soon as possible?", "What is call the client directly?", "What is notify your direct manager via PMC at least one hour before your scheduled start time?"]
        },
        { 
          points: 300, 
          question: "You wake up sick on a day you're scheduled to work. What's the earliest you must notify your direct manager to have it considered excused?", 
          correctAnswer: "What is at least one hour before your scheduled start time via PMC?",
          options: ["What is at least 30 minutes before check-in time via PMC or Slack?", "What is at least one hour before your scheduled start time via PMC?", "What is immediately upon waking, before your scheduled start time?"]
        },
        { 
          points: 400, 
          question: "You're reviewing your backup footage and notice the screen is frozen on one frame while audio is clear. What most likely happened?", 
          correctAnswer: "What is Zoom was minimized within AWS?",
          options: ["What is Zoom was minimized within AWS?", "What is OBS stopped recording video but continued audio?", "What is the participant's camera froze but their microphone kept working?"]
        },
        { 
          points: 500, 
          question: "You're experiencing recurring audio issues affecting job performance. What's the proper escalation procedure before your next shift?", 
          correctAnswer: "What is communicate with direct manager via PMC, then submit IT support ticket, and schedule IT meeting?",
          options: ["What is submit IT support ticket, notify manager via PMC, then schedule IT meeting?", "What is communicate with direct manager via PMC, schedule IT meeting, then document in ticket?", "What is communicate with direct manager via PMC, then submit IT support ticket, and schedule IT meeting?"]
        }
      ]
    },
    {
      name: "STENO POLICIES",
      color: "bg-blue-300",
      tileColor: "bg-blue-400",
      questions: [
        { 
          points: 100, 
          question: "What's the new time when job assignments are finalized each day?", 
          correctAnswer: "What is 6:00 PM PT?",
          options: ["What is 5:00 PM PT?", "What is 6:00 PM PT?", "What is 6:00 PM ET?"]
        },
        { 
          points: 200, 
          question: "If a VID job cancels after 6pm PT but before your scheduled start time, how much is the cancellation fee?", 
          correctAnswer: "What is $50?",
          options: ["What is $25?", "What is $75?", "What is $50?"]
        },
        { 
          points: 300, 
          question: "How far in advance must you submit your availability through Provider Dashboard?", 
          correctAnswer: "What is at least 7 business days in advance?",
          options: ["What is at least 7 business days in advance?", "What is at least 5 business days in advance?", "What is at least 7 calendar days in advance?"]
        },
        { 
          points: 400, 
          question: "What's the difference in cancellation fees between a canceled Standard STA job versus a Complex Case STA job?", 
          correctAnswer: "What is $25 for Standard STA, $50 for Complex Case STA?",
          options: ["What is $50 for both?", "What is $25 for Standard STA, $50 for Complex Case STA?", "What is $25 for both?"]
        },
        { 
          points: 500, 
          question: "As a VS2, you're assigned to a Complex Case STA role and introduce 4 exhibits during the proceeding. What job code and rate should you use?", 
          correctAnswer: "What is Complex Case/STA with Premium Pay rate and comment '[Number] exhibits introduced'?",
          options: ["What is Complex Case/STA with Premium Pay rate and comment '[Number] exhibits introduced'?", "What is Complex Case/STA with Premium Pay only if 5+ exhibits introduced?", "What is Complex Case with Premium Pay since it includes STA duties?"]
        }
      ]
    },
    {
      name: "BREAKS & TIME MANAGEMENT",
      color: "bg-pink-300",
      tileColor: "bg-pink-400",
      questions: [
        { 
          points: 100, 
          question: "Steno now encourages all team members to clock at least one of these per day, regardless of state. What is it?", 
          correctAnswer: "What is a paid rest break?",
          options: ["What is a 10-minute break?", "What is a wellness break?", "What is a paid rest break?"]
        },
        { 
          points: 200, 
          question: "How long should a meal break be?", 
          correctAnswer: "What is minimum of 30 minutes, maximum of 60 minutes?",
          options: ["What is minimum of 30 minutes, maximum of 45 minutes?", "What is minimum of 30 minutes, maximum of 60 minutes?", "What is exactly 30 minutes unless extended by proceeding break?"]
        },
        { 
          points: 300, 
          question: "What's the maximum total duration for rest breaks per day?", 
          correctAnswer: "What is 29 minutes total per day?",
          options: ["What is 30 minutes total per day?", "What is 20 minutes total per day?", "What is 29 minutes total per day?"]
        },
        { 
          points: 400, 
          question: "After 90 days of tenure, are you still required to attend Daily Video Meeting (DVM)?", 
          correctAnswer: "What is no - DVM is only required for first 90 days?",
          options: ["What is yes - DVM is always required?", "What is no - DVM is only required for first 90 days?", "What is only on Mondays?"]
        },
        { 
          points: 500, 
          question: "When are you required to complete your monthly 1:1 with your direct manager, and what happens if you don't?", 
          correctAnswer: "What is on days with assigned depositions - failure may result in disciplinary action?",
          options: ["What is anytime during the month with no consequences?", "What is only if you have performance issues?", "What is on days with assigned depositions - failure may result in disciplinary action?"]
        }
      ]
    }
  ];

  const handleTileClick = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    if (!answeredQuestions.has(key)) {
      setCurrentQuestion({
        ...categories[categoryIndex].questions[questionIndex],
        key,
        categoryIndex
      });
      setSelectedAnswer(null);
      setShowResult(false);
      if (gameMode === 'speed') {
        setTimeLeft(10);
        setTimerActive(true);
      }
      setScreen('question');
    }
  };

  const handleAnswerCorrect = () => {
    setScore(score + currentQuestion.points);
    setAnsweredQuestions(new Set([...answeredQuestions, currentQuestion.key]));
    if (gameMode === 'streak') {
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      if (newStreak > longestStreak) {
        setLongestStreak(newStreak);
      }
    }
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimerActive(false);
    setScreen('board');
  };

  const handleAnswerWrong = () => {
    setAnsweredQuestions(new Set([...answeredQuestions, currentQuestion.key]));
    if (gameMode === 'streak') {
      setCurrentStreak(0);
    }
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimerActive(false);
    setScreen('board');
  };

  const getResultMessage = () => {
    if (score < 2000) {
      return {
        title: "Less than 2000 points",
        message: "Wow, it seems like this wasn't your day... but don't give up! Every attempt is an opportunity to learn more"
      };
    } else if (score < 4000) {
      return {
        title: "Between 2000 and 4000 points",
        message: "You're on the right track! You know quite a bit, but there is still room for improvement. Keep trying!"
      };
    } else if (score < 6000) {
      return {
        title: "Between 4000 and 6000 points",
        message: "Wow, impressive! You have great knowledge and it shows that you know what you're talking about. Keep it up!"
      };
    } else {
      return {
        title: "More than 6000 points",
        message: "Congratulations! Your knowledge is admirable, you could compete with the best."
      };
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start Screen
  if (screen === 'start') {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#2d2456' }}>
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-30px) rotate(5deg); }
          }
          @keyframes floatSlow {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            50% { transform: translateY(-40px) translateX(20px); }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.1); }
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.5); }
            50% { box-shadow: 0 0 40px rgba(251, 191, 36, 0.8), 0 0 60px rgba(251, 191, 36, 0.4); }
          }
          .float { animation: float 6s ease-in-out infinite; }
          .float-slow { animation: floatSlow 8s ease-in-out infinite; }
          .spin-slow { animation: spin 20s linear infinite; }
          .pulse { animation: pulse 2s ease-in-out infinite; }
          .glow { animation: glow 2s ease-in-out infinite; }
        `}</style>
        
        {/* Animated decorative shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-pink-300 rounded-full opacity-70 float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-40 right-20 w-64 h-64 bg-pink-300 opacity-50 float-slow" style={{ borderRadius: '50% 50% 0 50%', animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-32 w-48 h-48 bg-teal-300 opacity-60 float" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 right-40 w-40 h-40 bg-orange-300 opacity-60 spin-slow" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}></div>
        <div className="absolute top-1/3 left-20 float-slow" style={{ width: '0', height: '0', borderLeft: '60px solid transparent', borderRight: '60px solid transparent', borderBottom: '100px solid #fdba74', opacity: 0.6, animationDelay: '1.5s' }}></div>
        <svg className="absolute top-20 left-1/4 w-24 h-24 pulse" viewBox="0 0 51 48" style={{ animationDelay: '0.5s' }}>
          <path d="m25,1 6,17h18l-14,11 5,17-15-10-15,10 5-17-14-11h18z" fill="#f9a8d4" opacity="0.7"/>
        </svg>
        
        {/* Game show lights */}
        <div className="absolute top-10 left-1/4 w-4 h-4 bg-yellow-300 rounded-full pulse" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-32 left-1/3 w-3 h-3 bg-pink-300 rounded-full pulse" style={{ animationDelay: '0.3s' }}></div>
        <div className="absolute top-20 right-1/4 w-5 h-5 bg-purple-300 rounded-full pulse" style={{ animationDelay: '0.6s' }}></div>
        <div className="absolute top-48 right-1/3 w-3 h-3 bg-blue-300 rounded-full pulse" style={{ animationDelay: '0.9s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-4 h-4 bg-teal-300 rounded-full pulse" style={{ animationDelay: '1.2s' }}></div>
        <div className="absolute bottom-40 right-1/4 w-5 h-5 bg-orange-300 rounded-full pulse" style={{ animationDelay: '1.5s' }}></div>
        
        <div className="absolute inset-0 border-8 border-indigo-300 opacity-30 m-12 float" style={{ borderRadius: '20px' }}></div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
          <div className="mb-4 px-8 py-2 rounded-full text-sm font-bold uppercase tracking-wider pulse" style={{ backgroundColor: '#c7d2fe', color: '#2d2456' }}>
            GAME
          </div>
          <h1 className="text-8xl font-black text-white mb-8 tracking-tight" style={{ fontFamily: 'Impact, sans-serif', letterSpacing: '0.05em' }}>
            DEPOARDY
          </h1>
          <p className="text-2xl mb-3" style={{ color: '#c7d2fe' }}>Five categories, five levels...</p>
          <p className="text-2xl mb-12" style={{ color: '#c7d2fe' }}>How many points can you accumulate?</p>
          
          {/* Game mode selection */}
          <div className="mb-6">
            <p className="text-xl mb-6 text-center font-bold uppercase tracking-wide" style={{ color: '#c7d2fe' }}>Choose Your Mode:</p>
            <div className="flex flex-col gap-4 items-center">
              <button
                onClick={() => {
                  playSound('click');
                  setGameMode(null);
                  setScreen('board');
                }}
                className="px-16 py-5 text-2xl font-bold rounded-full hover:scale-105 transition-all shadow-2xl uppercase tracking-wide glow"
                style={{ backgroundColor: '#fde047', color: '#2d2456' }}
              >
                CLASSIC MODE
              </button>
              
              <div className="text-lg font-bold uppercase tracking-wider" style={{ color: '#c7d2fe' }}>— OR CHOOSE A CHALLENGE —</div>
              
              <div className="flex gap-6">
                <button
                  onClick={() => {
                    playSound('click');
                    setGameMode('speed');
                    setStartTime(Date.now());
                    setScreen('board');
                  }}
                  className="px-10 py-4 text-lg font-bold rounded-full hover:scale-105 transition-all shadow-xl"
                  style={{ backgroundColor: '#93c5fd', color: '#1e293b' }}
                >
                  ⚡ SPEED ROUND<br/><span className="text-sm">(10 sec per question)</span>
                </button>
                <button
                  onClick={() => {
                    playSound('click');
                    setGameMode('streak');
                    setScreen('board');
                  }}
                  className="px-10 py-4 text-lg font-bold rounded-full hover:scale-105 transition-all shadow-xl"
                  style={{ backgroundColor: '#f9a8d4', color: '#831843' }}
                >
                  🔥 STREAK COUNTER<br/><span className="text-sm">(Build your streak!)</span>
                </button>
              </div>
              
              <div className="text-lg font-bold uppercase tracking-wider mt-4" style={{ color: '#c7d2fe' }}>— OR STUDY FIRST —</div>
              
              <button
                onClick={() => {
                  playSound('click');
                  setPracticeMode(true);
                  setPracticeIndex(0);
                  setShowPracticeAnswer(false);
                  setScreen('practice');
                }}
                className="px-12 py-4 text-xl font-bold rounded-full hover:scale-105 transition-all shadow-xl"
                style={{ backgroundColor: '#c084fc', color: '#1e1b3f' }}
              >
                🧠 PRACTICE MODE<br/><span className="text-sm">(Flashcard Review)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game Board
  if (screen === 'board') {
    return (
      <div className="min-h-screen p-8" style={{ backgroundColor: '#3d3564' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-5xl font-black text-white tracking-tight" style={{ fontFamily: 'Impact, sans-serif', letterSpacing: '0.1em' }}>
                DEPOARDY
              </h1>
              {gameMode && (
                <div className="mt-2 text-sm font-bold uppercase" style={{ color: '#c7d2fe' }}>
                  {gameMode === 'speed' && '⚡ Speed Round Mode'}
                  {gameMode === 'streak' && `🔥 Streak Counter Mode - Current: ${currentStreak}`}
                </div>
              )}
            </div>
            <div className="text-right">
              <div style={{ color: '#c7d2fe' }} className="text-sm mb-1 uppercase tracking-wider">Current Score</div>
              <div className="text-5xl font-black" style={{ color: '#fde047' }}>{score}</div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {categories.map((category, catIndex) => (
              <div key={catIndex} className="flex flex-col gap-4">
                <div className={`${category.color} p-6 rounded-lg text-center`}>
                  <h3 className="text-gray-900 font-black text-base uppercase leading-tight tracking-wide">
                    {category.name}
                  </h3>
                </div>
                {category.questions.map((question, qIndex) => {
                  const isAnswered = answeredQuestions.has(`${catIndex}-${qIndex}`);
                  return (
                    <button
                      key={qIndex}
                      onClick={() => {
                        if (!isAnswered) {
                          playSound('tile');
                          handleTileClick(catIndex, qIndex);
                        }
                      }}
                      disabled={isAnswered}
                      className={`${isAnswered ? 'opacity-40' : category.tileColor} p-8 rounded-lg font-black text-5xl transition-all ${
                        isAnswered
                          ? 'cursor-not-allowed'
                          : 'hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl'
                      }`}
                      style={{ 
                        color: '#fde047',
                        fontFamily: 'Impact, sans-serif',
                        letterSpacing: '0.05em'
                      }}
                    >
                      {isAnswered ? '✓' : question.points}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => {
                playSound('click');
                setScreen('results');
                // Trigger confetti for high scores
                if (score >= 6000) {
                  setShowConfetti(true);
                  setTimeout(() => setShowConfetti(false), 5000);
                }
              }}
              className="px-12 py-4 rounded-full text-xl font-bold uppercase tracking-wide hover:scale-105 transition-all shadow-xl"
              style={{ backgroundColor: '#fde047', color: '#2d2456' }}
            >
              View Final Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Question Screen
  if (screen === 'question' && currentQuestion) {
    const categoryInfo = categories[currentQuestion.categoryIndex];

    const handleAnswerSelect = (option) => {
      playSound('click');
      setSelectedAnswer(option);
    };

    const handleSubmit = () => {
      if (!selectedAnswer) return;
      playSound('click');
      setShowResult(true);
      setTimerActive(false);
      
      // Play correct/incorrect sound and auto-advance
      setTimeout(() => {
        if (selectedAnswer === currentQuestion.correctAnswer) {
          playSound('correct');
          // Streak celebration
          if (gameMode === 'streak' && currentStreak > 0 && (currentStreak + 1) % 5 === 0) {
            playSound('streak');
          }
          setTimeout(() => handleAnswerCorrect(), 500);
        } else {
          playSound('incorrect');
          setTimeout(() => handleAnswerWrong(), 500);
        }
      }, 100);
    };

    const handleBack = () => {
      playSound('click');
      setTimerActive(false);
      setCurrentQuestion(null);
      setSelectedAnswer(null);
      setShowResult(false);
      setScreen('board');
    };

    if (showResult) {
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      return (
        <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: '#3d3564' }}>
          <div className="max-w-4xl w-full rounded-3xl p-16 shadow-2xl text-center" style={{ backgroundColor: isCorrect ? '#86efac' : '#fca5a5' }}>
            <div className="text-gray-900 text-6xl font-black mb-8">
              {isCorrect ? '✓ CORRECT!' : '✗ INCORRECT'}
            </div>
            <div className="text-gray-900 text-3xl font-bold mb-4">
              {isCorrect ? `+${currentQuestion.points} points` : '+0 points'}
            </div>
            {gameMode === 'streak' && (
              <div className="text-gray-900 text-2xl font-bold mb-4">
                {isCorrect ? `🔥 Streak: ${currentStreak + 1}!` : '💔 Streak broken!'}
              </div>
            )}
            <div className="text-gray-900 text-xl font-semibold">
              Correct answer: {currentQuestion.correctAnswer}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen p-8 relative" style={{ backgroundColor: '#3d3564' }}>
        {/* Back button */}
        <button
          onClick={handleBack}
          className="absolute top-8 right-8 w-16 h-16 rounded-2xl flex items-center justify-center hover:scale-110 transition-all shadow-lg z-10"
          style={{ backgroundColor: '#fde047' }}
        >
          <svg className="w-8 h-8" style={{ color: '#2d2456' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        {/* Point indicator */}
        <div className="absolute top-8 left-8 px-8 py-4 rounded-2xl z-10" style={{ backgroundColor: '#c7d2fe' }}>
          <div className="text-5xl font-black" style={{ color: '#2d2456' }}>{currentQuestion.points}</div>
          <div className="text-sm font-bold uppercase" style={{ color: '#2d2456' }}>points</div>
        </div>

        {/* Timer for speed round */}
        {gameMode === 'speed' && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
            <div className={`px-8 py-4 rounded-2xl text-center ${timeLeft <= 3 ? 'animate-pulse' : ''}`} style={{ backgroundColor: timeLeft <= 3 ? '#fca5a5' : '#93c5fd' }}>
              <div className="text-5xl font-black" style={{ color: '#1e293b' }}>⏱️ {timeLeft}</div>
            </div>
          </div>
        )}

        {/* Streak indicator */}
        {gameMode === 'streak' && currentStreak > 0 && (
          <div className="absolute top-32 left-8 px-6 py-3 rounded-2xl z-10" style={{ backgroundColor: '#f9a8d4' }}>
            <div className="text-3xl font-black" style={{ color: '#831843' }}>🔥 {currentStreak}</div>
            <div className="text-xs font-bold uppercase" style={{ color: '#831843' }}>Streak</div>
          </div>
        )}

        <div className="max-w-6xl mx-auto pt-32">
          {/* Question box */}
          <div className={`${categoryInfo.color} rounded-3xl p-12 mb-8 shadow-2xl relative`}>
            <div className="text-gray-900 text-3xl font-bold leading-tight text-center">
              {currentQuestion.question}
            </div>
          </div>

          {/* Answer options */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={showResult}
                className={`p-8 rounded-2xl text-xl font-bold transition-all ${
                  selectedAnswer === option
                    ? 'ring-4 ring-white scale-105'
                    : 'hover:scale-105'
                }`}
                style={{ 
                  backgroundColor: '#fde047',
                  color: '#2d2456'
                }}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Send button */}
          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className={`px-16 py-5 rounded-full text-2xl font-black uppercase tracking-wider shadow-2xl transition-all ${
                selectedAnswer 
                  ? 'hover:scale-110 cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              style={{ 
                backgroundColor: '#fde047',
                color: '#2d2456'
              }}
            >
              SEND
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results Screen
  if (screen === 'results') {
    const result = getResultMessage();
    const totalTimeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : null;
    
    return (
      <div className="min-h-screen flex items-center justify-center p-8 relative" style={{ backgroundColor: '#3d3564' }}>
        {showConfetti && <Confetti />}
        
        <div className="max-w-2xl w-full text-center">
          <h2 className="text-6xl font-black mb-12 tracking-tight uppercase" style={{ fontFamily: 'Impact, sans-serif', color: '#fde047' }}>
            Final Results
          </h2>
          
          <div className="rounded-3xl p-12 shadow-2xl mb-8" style={{ backgroundColor: '#524473' }}>
            <div className="text-8xl font-black mb-6" style={{ color: '#fde047', fontFamily: 'Impact, sans-serif' }}>
              {score}
            </div>
            <div className="text-3xl font-black mb-6 uppercase tracking-wide" style={{ color: '#c7d2fe' }}>
              {result.title}
            </div>
            <div className="text-xl text-white leading-relaxed mb-8">
              {result.message}
            </div>
            
            {/* Challenge Mode Badges and Stats */}
            {gameMode && (
              <div className="mt-8 pt-8 border-t-2 border-indigo-300">
                <div className="text-2xl font-black mb-6 uppercase" style={{ color: '#fde047' }}>
                  Challenge Mode Stats
                </div>
                
                {gameMode === 'speed' && (
                  <div className="mb-4">
                    <div className="inline-block px-8 py-4 rounded-2xl mb-4" style={{ backgroundColor: '#93c5fd' }}>
                      <div className="text-4xl font-black text-gray-900">⚡</div>
                      <div className="text-lg font-bold text-gray-900">SPEED ROUND</div>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      Total Time: {formatTime(totalTimeSpent)}
                    </div>
                  </div>
                )}
                
                {gameMode === 'streak' && (
                  <div className="mb-4">
                    <div className="inline-block px-8 py-4 rounded-2xl mb-4" style={{ backgroundColor: '#f9a8d4' }}>
                      <div className="text-4xl font-black" style={{ color: '#831843' }}>🔥</div>
                      <div className="text-lg font-bold" style={{ color: '#831843' }}>STREAK COUNTER</div>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      Longest Streak: {longestStreak} {longestStreak === 1 ? 'Question' : 'Questions'}
                    </div>
                    {longestStreak >= 10 && (
                      <div className="text-xl font-bold mt-2" style={{ color: '#fde047' }}>
                        🏆 STREAK MASTER!
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {score >= 6000 && (
              <div className="mt-6 text-3xl font-black animate-pulse" style={{ color: '#fde047' }}>
                🎉 PERFECT SCORE! 🎉
              </div>
            )}
          </div>
          
          <button
            onClick={() => {
              playSound('click');
              setScreen('start');
              setScore(0);
              setAnsweredQuestions(new Set());
              setCurrentQuestion(null);
              setSelectedAnswer(null);
              setShowResult(false);
              setGameMode(null);
              setStartTime(null);
              setCurrentStreak(0);
              setLongestStreak(0);
              setShowConfetti(false);
            }}
            className="px-12 py-4 rounded-full text-xl font-bold uppercase tracking-wide hover:scale-105 transition-all shadow-lg"
            style={{ backgroundColor: '#fde047', color: '#2d2456' }}
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // Practice Mode
  if (screen === 'practice') {
    const practiceQuestions = getAllPracticeQuestions();
    const currentPracticeQ = practiceQuestions[practiceIndex];
    const isMastered = masteredQuestions.has(practiceIndex);

    return (
      <div className="min-h-screen p-8 relative" style={{ backgroundColor: '#3d3564' }}>
        <style>{`
          @keyframes sparkle {
            0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
            50% { opacity: 0.8; transform: scale(1.2) rotate(180deg); }
          }
          @keyframes bounce-gentle {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          .sparkle { animation: sparkle 2s ease-in-out infinite; }
          .bounce-gentle { animation: bounce-gentle 1.5s ease-in-out infinite; }
        `}</style>

        {/* Back button */}
        <button
          onClick={() => {
            playSound('click');
            setScreen('start');
            setPracticeMode(false);
          }}
          className="absolute top-8 right-8 w-16 h-16 rounded-2xl flex items-center justify-center hover:scale-110 transition-all shadow-lg z-10"
          style={{ backgroundColor: '#fde047' }}
        >
          <svg className="w-8 h-8" style={{ color: '#2d2456' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="max-w-4xl mx-auto pt-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-black mb-4" style={{ color: '#c084fc', fontFamily: 'Impact, sans-serif' }}>
              🧠 PRACTICE MODE
            </h1>
            <div className="text-2xl font-bold mb-2" style={{ color: '#c7d2fe' }}>
              Question {practiceIndex + 1} of {practiceQuestions.length}
            </div>
            <div className="text-lg" style={{ color: '#a5b4fc' }}>
              {masteredQuestions.size} Mastered ✨
            </div>
          </div>

          {/* Sparkly Guru Help Message */}
          <div className="mb-8 p-6 rounded-3xl relative overflow-hidden" style={{ backgroundColor: '#c084fc' }}>
            <div className="absolute top-2 right-2 text-3xl sparkle">✨</div>
            <div className="absolute bottom-2 left-2 text-3xl sparkle" style={{ animationDelay: '0.5s' }}>✨</div>
            <div className="absolute top-2 left-1/4 text-2xl sparkle" style={{ animationDelay: '1s' }}>⭐</div>
            <div className="absolute bottom-2 right-1/4 text-2xl sparkle" style={{ animationDelay: '1.5s' }}>⭐</div>
            
            <div className="text-center relative z-10 bounce-gentle">
              <div className="text-3xl mb-2">💡</div>
              <div className="text-xl font-bold mb-2" style={{ color: '#1e1b3f' }}>
                Need Help? We've Got You!
              </div>
              <div className="text-lg" style={{ color: '#1e1b3f' }}>
                Stuck on a question? Head to <span className="font-black">#guru-video-help</span> in Slack or use the <span className="font-black">Vid Helper Assistant</span> search feature on the Vid Squad Guru Homepage!
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className={`${currentPracticeQ.categoryColor} rounded-3xl p-8 mb-6 shadow-2xl`}>
            <div className="text-center mb-4">
              <div className="inline-block px-6 py-2 rounded-full mb-4" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                <div className="text-sm font-bold uppercase text-gray-900">{currentPracticeQ.categoryName}</div>
              </div>
              <div className="inline-block px-6 py-2 rounded-full ml-2" style={{ backgroundColor: '#fde047' }}>
                <div className="text-2xl font-black" style={{ color: '#2d2456' }}>{currentPracticeQ.points} pts</div>
              </div>
            </div>
            <div className="text-gray-900 text-2xl font-bold leading-tight text-center">
              {currentPracticeQ.question}
            </div>
          </div>

          {/* Show Answer / Answer Display */}
          {!showPracticeAnswer ? (
            <div className="text-center mb-8">
              <button
                onClick={() => {
                  playSound('click');
                  setShowPracticeAnswer(true);
                }}
                className="px-16 py-5 rounded-full text-2xl font-bold uppercase tracking-wide hover:scale-105 transition-all shadow-xl"
                style={{ backgroundColor: '#fde047', color: '#2d2456' }}
              >
                💡 SHOW ANSWER
              </button>
            </div>
          ) : (
            <div className="mb-8">
              <div className="rounded-3xl p-8 mb-6 shadow-xl" style={{ backgroundColor: '#86efac' }}>
                <div className="text-center mb-4">
                  <div className="text-3xl font-black mb-4 uppercase" style={{ color: '#065f46' }}>
                    ✓ Correct Answer:
                  </div>
                  <div className="text-2xl font-bold" style={{ color: '#064e3b' }}>
                    {currentPracticeQ.correctAnswer}
                  </div>
                </div>
              </div>

              {/* Guru Link and Mark as Mastered */}
              <div className="flex gap-4 justify-center">
                {currentPracticeQ.guruLink && (
                  <a
                    href={currentPracticeQ.guruLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => playSound('click')}
                    className="px-8 py-4 rounded-full text-lg font-bold hover:scale-105 transition-all shadow-lg"
                    style={{ backgroundColor: '#60a5fa', color: '#1e293b' }}
                  >
                    📘 Learn More on Guru
                  </a>
                )}
                <button
                  onClick={() => {
                    playSound('click');
                    if (isMastered) {
                      const newMastered = new Set(masteredQuestions);
                      newMastered.delete(practiceIndex);
                      setMasteredQuestions(newMastered);
                    } else {
                      setMasteredQuestions(new Set([...masteredQuestions, practiceIndex]));
                      playSound('correct');
                    }
                  }}
                  className={`px-8 py-4 rounded-full text-lg font-bold hover:scale-105 transition-all shadow-lg ${
                    isMastered ? 'ring-4 ring-yellow-300' : ''
                  }`}
                  style={{ backgroundColor: isMastered ? '#fde047' : '#a5b4fc', color: '#1e1b3f' }}
                >
                  {isMastered ? '✨ Mastered!' : '📌 Mark as Mastered'}
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                playSound('click');
                if (practiceIndex > 0) {
                  setPracticeIndex(practiceIndex - 1);
                  setShowPracticeAnswer(false);
                }
              }}
              disabled={practiceIndex === 0}
              className={`px-8 py-4 rounded-full text-xl font-bold transition-all ${
                practiceIndex === 0 
                  ? 'opacity-40 cursor-not-allowed' 
                  : 'hover:scale-105 shadow-lg'
              }`}
              style={{ backgroundColor: '#c7d2fe', color: '#2d2456' }}
            >
              ← PREVIOUS
            </button>

            <div className="text-2xl font-bold" style={{ color: '#c7d2fe' }}>
              {practiceIndex + 1} / {practiceQuestions.length}
            </div>

            <button
              onClick={() => {
                playSound('click');
                if (practiceIndex < practiceQuestions.length - 1) {
                  setPracticeIndex(practiceIndex + 1);
                  setShowPracticeAnswer(false);
                } else {
                  // Loop back to start
                  setPracticeIndex(0);
                  setShowPracticeAnswer(false);
                }
              }}
              className="px-8 py-4 rounded-full text-xl font-bold hover:scale-105 transition-all shadow-lg"
              style={{ backgroundColor: '#c7d2fe', color: '#2d2456' }}
            >
              {practiceIndex < practiceQuestions.length - 1 ? 'NEXT →' : 'RESTART →'}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-8">
            <div className="w-full h-4 rounded-full overflow-hidden" style={{ backgroundColor: '#524473' }}>
              <div 
                className="h-full transition-all duration-300"
                style={{ 
                  width: `${((practiceIndex + 1) / practiceQuestions.length) * 100}%`,
                  backgroundColor: '#c084fc'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default JeopardyGame;