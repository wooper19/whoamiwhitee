'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getGameQuestions } from '@/lib/questions';

// --- 常數部分保持不變 ---
const TIME_PER_QUESTION = 10;
const TOTAL_QUESTIONS = 7;
const CORRECT_FEEDBACK_DURATION = 1000;

export default function GamePage() {
  // --- 您的所有 Hooks 和函式邏輯都保持不變 ---
  const router = useRouter();
  const [gameQuestions, setGameQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(score);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [questionAnsweredCorrectlyThisTurn, setQuestionAnsweredCorrectlyThisTurn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const timerIntervalRef = useRef(null);
  const inputRef = useRef(null);
  const advanceTimeoutRef = useRef(null);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    const selectedQuestions = getGameQuestions(TOTAL_QUESTIONS);
    setGameQuestions(selectedQuestions);
    if (inputRef.current) {
      inputRef.current.focus();
    }
    return () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    }
  }, []);

  const currentQuestion = gameQuestions[currentQuestionIndex];
  const currentAnswerLength = currentQuestion ? currentQuestion.answer.length : 0;

  const advanceToNextQuestion = useCallback((scoreAsArgument) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    setFeedbackMessage('');
    setUserAnswer('');
    setQuestionAnsweredCorrectlyThisTurn(false);
    if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      router.push(`/loading-results?score=${scoreAsArgument}`);
    }
  }, [currentQuestionIndex, router]);

  useEffect(() => {
    if (!currentQuestion) return;
    setTimeLeft(TIME_PER_QUESTION);
    setQuestionAnsweredCorrectlyThisTurn(false);
    setUserAnswer('');
    setFeedbackMessage('');
    setIsProcessing(false); 
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setFeedbackMessage('時間到！');
          setIsProcessing(true);
          advanceTimeoutRef.current = setTimeout(() => {
            advanceToNextQuestion(scoreRef.current);
          }, CORRECT_FEEDBACK_DURATION);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        if (advanceTimeoutRef.current) {
            clearTimeout(advanceTimeoutRef.current);
        }
    }
  }, [currentQuestion, advanceToNextQuestion]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isProcessing || !currentQuestion || questionAnsweredCorrectlyThisTurn || timeLeft === 0) {
      return;
    }
    if (userAnswer.length !== currentAnswerLength) {
      setFeedbackMessage(`答案必須是 ${currentAnswerLength} 個字！`);
      setTimeout(() => setFeedbackMessage(''), 2000);
      return;
    }
    const correctAnswer = currentQuestion.answer;
    if (userAnswer === correctAnswer) {
      let newScore = score;
      if (!questionAnsweredCorrectlyThisTurn) {
        newScore = score + 1;
        setScore(newScore);
        setQuestionAnsweredCorrectlyThisTurn(true);
      }
      setFeedbackMessage('答對了！');
      setIsProcessing(true);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if(advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = setTimeout(() => {
        advanceToNextQuestion(newScore);
      }, CORRECT_FEEDBACK_DURATION);
    } else {
      setFeedbackMessage('答錯了，再試一次！');
      setUserAnswer('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  if (!currentQuestion) {
    return <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'rgba(71, 95, 64, 1.0)' }}>載入題目中...</main>;
  }

  let bottomMessage = '';
  if (isProcessing && feedbackMessage === '答對了！') {
    bottomMessage = '正在前往下一題...';
  } else if (isProcessing && feedbackMessage === '時間到！') {
    bottomMessage = '時間到！正在前往下一題...';
  }

  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      boxSizing: 'border-box',
      backgroundImage: "url('/images/bg.png')",
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
    }}>
      {/* --- 前景元素保持不變 --- */}
      <div style={{
        position: 'absolute', top: '20px', left: '20px', fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 'bold',
        backgroundColor: 'rgba(250, 204, 43, 1.0)', color: 'white', padding: '5px 10px', borderRadius: '5px', zIndex: 10
      }}>
        時間: {timeLeft}s
      </div>
      <h1 style={{ marginTop: '8px', fontSize: 'clamp(20px, 4vw, 15px)', color:'white',fontWeight: 'bold',textAlign: 'center' }}>
        第 {currentQuestionIndex + 1} / {TOTAL_QUESTIONS} 題
      </h1>
      <div style={{
        margin: '60px 0',
        width: '100%',
        maxWidth: '700px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Image
          src={currentQuestion.silhouette}
          alt="人物剪影"
          width={500}
          height={500}
          style={{
            marginTop: '50px',
            objectFit: 'contain',
            width: '100%',
            height: 'auto',
            maxWidth: '800px',
          }}
          priority={true}
          key={currentQuestion.id}
        />
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <input
          ref={inputRef}
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder={`輸入 ${currentAnswerLength} 個字`}
          maxLength={currentAnswerLength > 0 ? currentAnswerLength : undefined}
          disabled={questionAnsweredCorrectlyThisTurn || timeLeft === 0 || isProcessing}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            color: '#333333',
            border: '4px solid white',
            borderRadius: '10px',
            outline: 'none',
            padding: '10px',
            fontSize: 'clamp(16px, 3vw, 20px)',
            width: 'clamp(200px, 60vw, 300px)',
            textAlign: 'center',
            marginBottom: '20px',
            marginTop: '-20px',
            boxSizing: 'border-box'
          }}
        />
        <button
          type="submit"
          disabled={questionAnsweredCorrectlyThisTurn || timeLeft === 0 || isProcessing}
          style={{
            padding: '10px 20px',
            fontSize: 'clamp(16px, 3vw, 20px)',
            minWidth: '120px'
          }}>
         
        </button>
      </form>

      {/* --- 修改位置 1 --- */}
      {feedbackMessage && !bottomMessage && (
        <p style={{
          marginTop: '15px',
          fontSize: 'clamp(16px, 3vw, 20px)',
          fontWeight: 'bold',
          color: 'rgb(194, 194, 194)' // 【修改】將所有 feedbackMessage 的顏色統一設為白色
         }}>
          {feedbackMessage}
        </p>
      )}
      {/* --- 修改位置 2 --- */}
      {bottomMessage && (
         <p style={{ marginTop: '15px', fontSize: 'clamp(16px, 3vw, 20px)', color: 'rgb(194, 194, 194)', fontWeight: 'bold' }}> {/* 【修改】將 bottomMessage 的顏色從 lightblue 改為白色 */}
            {bottomMessage}
         </p>
      )}
    </main>
  );
}