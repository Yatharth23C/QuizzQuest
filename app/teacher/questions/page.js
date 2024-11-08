'use client'
import { useState } from 'react';
import NavBar from "../../components/NavBar";

export default function Page() {
  class Question {
    constructor(question, Options, answer) {
      this.question = question;
      this.Options = Options;
      this.answer = answer;
    }
  }

  const [Options, setOptions] = useState([]);
  const [currentOption, setCurrentOption] = useState('');
  const [questions, setQuestions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [question, setQuestion] = useState('');

  const handleAddOption = () => {
    if (Options.length < 4 && currentOption.length > 0) {
      setOptions((prevOptions) => [...prevOptions, currentOption]);
      setCurrentOption('');
    }
  }

  const handleOptionChange = (event) => {
    setCurrentOption(event.target.value);
  }

  const handleProblem = () => {
    if (correctAnswer.length > 0 && Options.length === 4 && question.length > 0) {
      const problem = new Question(question, Options, correctAnswer);
      setQuestions((prevQuestions) => [...prevQuestions, problem]);
      setOptions([]);
      setQuestion('');
      setCorrectAnswer('');
    }
  }

  const handleQuestionChange = (event) => {
    setQuestion(event.target.value);
  }

  const handleCorrectAnswerChange = (event) => {
    setCorrectAnswer(event.target.value);
  }

  const handlesubmitset = async () => {
    try {
      const response = await fetch('/api/auth/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questions })
      })
      const data = await response.json()
      if (response.ok) {
        console.log('Questions added successfully:', data);
      } else {
        console.error('Error adding questions:', data.error);
      }
    } catch (error) {
      console.error('Failed to send questions', error)
    }
  }

  return (
    <>
      <NavBar />
      <div className="flex flex-col items-center bg-purple-900 min-h-screen py-10">
        <div className="flex flex-col items-center bg-black text-white rounded-lg shadow-lg p-8 min-w-[500px]">
          <input
            onChange={handleQuestionChange}
            value={question}
            className="outline-none min-w-[400px] border border-purple-500 rounded-md m-2 p-3 focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your question"
          />

          <input
            value={currentOption}
            className="outline-none border border-purple-500 rounded-md m-2 p-3 focus:ring-2 focus:ring-blue-500 min-w-[300px]"
            onChange={handleOptionChange}
            placeholder="Enter your Option"
          />

          <input
            value={correctAnswer}
            onChange={handleCorrectAnswerChange}
            className="outline-none border border-purple-500 rounded-md m-2 p-3 focus:ring-2 focus:ring-blue-500 min-w-[300px]"
            placeholder="Enter the correct answer index"
          />

          <div className="flex space-x-3 mt-4">
            <button
              className="bg-purple-600 text-white rounded-md px-6 py-2 hover:bg-purple-700"
              onClick={handleProblem}>
              Add problem
            </button>
            <button
              className="bg-purple-600 text-white rounded-md px-6 py-2 hover:bg-purple-700"
              onClick={handleAddOption}>
              Add option
            </button>
            <button
              className="bg-yellow-500 text-black rounded-md px-6 py-2 hover:bg-yellow-600"
              onClick={handlesubmitset}>
              Submit this set
            </button>
          </div>

          {Options.length > 0 && (
            <div className="overflow-y-auto max-h-[200px] w-full mt-4">
              {Options.map((option, i) => (
                <div className="m-1 p-2 rounded border border-purple-500 min-w-[300px]" key={i}>
                  {i + 1}. {option}
                </div>
              ))}
            </div>
          )}

          {questions.length > 0 && (
            <div className="mt-5 w-full">
              {questions.map((que, index) => (
                <div className="flex flex-col bg-purple-800 text-white rounded-md m-2 p-4" key={index}>
                  <div className="text-lg font-semibold text-yellow-300"><strong>Question:</strong> {que.question}</div>
                  <ul className="flex flex-col space-y-2 mt-2">
                    {que.Options.map((option, i) => (
                      <li className="m-1 p-1" key={i}>{i + 1}. {option}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
