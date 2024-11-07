'use client'
import {useState} from 'react';
import NavBar from "../../components/NavBar";

export default function Page(){
   class Question {
    constructor(question, Options, answer){
        this.question = question;
        this.Options = Options;
        this.answer = answer;
    }
   }

   const [Options , setOptions] = useState([]);
   const [currentOption , setCurrentOption] = useState('');
   const [questions, setQuestions]=  useState([]);
   const [correctAnswer, setCorrectAnswer] = useState('');
   const [question , setQuestion] = useState('');

   const handleAddOption = ()=>{
    if(Options.length < 4 && currentOption.length > 0){
      setOptions((prevOptions)=>[...prevOptions, currentOption]);
      setCurrentOption('');
    }
   }

   const handleOptionChange = (event)=>{
    setCurrentOption(event.target.value);
   }

   const handleProblem = ()=>{
    if(correctAnswer.length > 0 && Options.length === 4 && question.length > 0){
        const problem = new Question(question, Options, correctAnswer);
        setQuestions((prevQuestions)=>[...prevQuestions, problem]);
        setOptions([]);
        setQuestion('');
        setCorrectAnswer('');
    }
   }

   const handleQuestionChange = (event)=>{
      setQuestion(event.target.value);
   }

   const handleCorrectAnswerChange = (event)=>{
      setCorrectAnswer(event.target.value);
   }
   const handlesubmitset = async ()=>{
    try{
        const response = await fetch('/api/auth/questions',{
            method : 'POST',
            headers:{
                'Content-Type' :'application/json',
            },
            body:JSON.stringify({questions})

        })
            const data = await response.json()
            if (response.ok) {
                console.log('Questions added successfully:', data);
              } else {
                console.error('Error adding questions:', data.error);
              }
    }catch(error){
        console.error('Failed to send questions',error)

    }
   }
   return (
     <>
       <NavBar />
       <div className='flex flex-col items-center bg-red-300'>
         <div className='flex flex-col items-center bg-white rounded-md m-16 min-w-[500px] min-h-[300px] p-5'>
           <input 
             onChange={handleQuestionChange} 
             value={question} 
             className='outline-none min-w-[500px] border border-black m-1 p-1 rounded-md shadow-md' 
             placeholder='Enter your question' 
           />

           <input 
             value={currentOption} 
             className='outline-none border min-w-[300px] border-black m-1 p-1 rounded-md shadow-md' 
             onChange={handleOptionChange} 
             placeholder='Enter your Option' 
           />

           <input 
             value={correctAnswer} 
             onChange={handleCorrectAnswerChange}  
             className='outline-none border min-w-[300px] border-black m-1 p-1 rounded-md shadow-md' 
             placeholder='Enter the correct answer index' 
           />

           <div>
             <button className='bg-black text-white rounded-lg m-1 p-2' onClick={handleProblem}>Add problem</button>
             <button className='bg-black text-white rounded-lg m-1 p-2' onClick={handleAddOption}>Add option</button>
             <button className='bg-green-300 hover:bg-green-500 rounded-lg m-1 p-2' onClick={handlesubmitset}>submit this set</button>

           </div>

           {Options.length > 0 && (
             <div className='overflow-y-auto max-h-[200px] w-full'>
               {Options.map((option, i) => (
                 <div className='m-1 p-1 rounded border border-black min-w-[300px]' key={i}>
                   {i + 1}. {option}
                 </div>
               ))}
             </div>
           )}

           {questions.length > 0 && (
             <div className='  m-5 w-full '>
               {questions.map((que, index) => (
                 <div className='flex flex-col bg-red-100 rounded-sm m-2' key={index}>
                   <div className='m-2'><strong>Question:</strong> {que.question}</div>
                   <ul className='flex flex-row '>
                     {que.Options.map((option, i) => (
                       <li className='m-1 p-1' key={i}>{i+1}. {option}</li>
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
