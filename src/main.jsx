import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { questions } from './questions.js'
import './styles.css'

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5)
}

function App() {
  const topics = ['All topics', ...Array.from(new Set(questions.map(q => q.topic)))]
  const [topic, setTopic] = useState('All topics')
  const [mode, setMode] = useState('practice')
  const [started, setStarted] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])

  const filteredQuestions = useMemo(() => {
    return topic === 'All topics' ? questions : questions.filter(q => q.topic === topic)
  }, [topic])

  const current = quizQuestions[index]
  const score = answers.filter(a => a.correct).length

  function startQuiz() {
    setQuizQuestions(shuffle(filteredQuestions))
    setIndex(0)
    setSelected(null)
    setAnswers([])
    setStarted(true)
  }

  function chooseAnswer(choiceIndex) {
    if (selected !== null) return
    setSelected(choiceIndex)
    const correct = choiceIndex === current.answer
    setAnswers([...answers, { question: current, selected: choiceIndex, correct }])
  }

  function nextQuestion() {
    if (index + 1 < quizQuestions.length) {
      setIndex(index + 1)
      setSelected(null)
    } else {
      setIndex(index + 1)
    }
  }

  function resetQuiz() {
    setStarted(false)
    setQuizQuestions([])
    setIndex(0)
    setSelected(null)
    setAnswers([])
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('Quiz link copied')
    } catch {
      alert('Could not copy link. Copy it from the address bar instead.')
    }
  }

  if (!started) {
    return (
      <main className="page">
        <section className="hero card">
          <p className="eyebrow">Fire Service College Revision</p>
          <h1>Interactive Fire Service Quiz</h1>
          <p className="lead">Practise fire extinguishers, ropes, knots, safety words and fire-ground signals.</p>
          <div className="controls">
            <label>
              Topic
              <select value={topic} onChange={e => setTopic(e.target.value)}>
                {topics.map(t => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label>
              Mode
              <select value={mode} onChange={e => setMode(e.target.value)}>
                <option value="practice">Practice mode</option>
                <option value="test">Test mode</option>
              </select>
            </label>
          </div>
          <button className="primary" onClick={startQuiz}>Start Quiz</button>
          <button className="secondary" onClick={copyLink}>Copy Share Link</button>
          <p className="small">{filteredQuestions.length} questions available in this selection.</p>
        </section>
      </main>
    )
  }

  if (index >= quizQuestions.length) {
    const percentage = Math.round((score / quizQuestions.length) * 100)
    return (
      <main className="page">
        <section className="card results">
          <p className="eyebrow">Quiz Complete</p>
          <h1>{score}/{quizQuestions.length}</h1>
          <p className="lead">You scored {percentage}%.</p>
          <button className="primary" onClick={startQuiz}>Try Again</button>
          <button className="secondary" onClick={resetQuiz}>Change Topic</button>
          <div className="review">
            <h2>Review</h2>
            {answers.map((a, i) => (
              <div className={`reviewItem ${a.correct ? 'correctBox' : 'wrongBox'}`} key={a.question.id}>
                <strong>{i + 1}. {a.question.question}</strong>
                <p>Your answer: {a.question.options[a.selected]}</p>
                {!a.correct && <p>Correct answer: {a.question.options[a.question.answer]}</p>}
                <p>{a.question.explanation}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="page">
      <section className="card quiz">
        <div className="topline">
          <span>{current.day} • {current.topic}</span>
          <span>Question {index + 1} of {quizQuestions.length}</span>
        </div>
        <div className="progress"><div style={{ width: `${((index + 1) / quizQuestions.length) * 100}%` }} /></div>
        <h1>{current.question}</h1>
        <div className="options">
          {current.options.map((option, i) => {
            let className = 'option'
            if (selected !== null && mode === 'practice') {
              if (i === current.answer) className += ' correct'
              else if (i === selected) className += ' wrong'
            } else if (selected === i) className += ' selected'
            return <button key={option} className={className} onClick={() => chooseAnswer(i)}>{option}</button>
          })}
        </div>
        {selected !== null && mode === 'practice' && (
          <div className="feedback">
            <strong>{selected === current.answer ? 'Correct' : 'Not quite'}</strong>
            <p>{current.explanation}</p>
          </div>
        )}
        {selected !== null && <button className="primary" onClick={nextQuestion}>{index + 1 === quizQuestions.length ? 'Finish Quiz' : 'Next Question'}</button>}
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
