import React, { useState } from 'react';
import './FAQ.css'
import Navbar from './Navbar';

const questions = [
  {
    ques: 'What is ListKaro?',
    ans: 'ListKaro lets you upload a handwritten or printed shopping list, then auto-adds items to your cart using OCR.',
  },
  {
    ques: 'What kind of images can I upload?',
    ans: 'Clear JPG, PNG, or JPEG images of handwritten or printed lists with visible text.',
  },
  {
    ques: 'What if an item isn’t found?',
    ans: 'You’ll get a notice. You can search manually or request us to add it later.',
  },
  {
    ques: 'Is my data safe?',
    ans: 'Yes. Your images and data are processed securely and deleted after use.',
  },
];


function FAQ(){
  const [activeQuestion, setActiveQuestion] = useState(null);
  const OpenAnswer = (index) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  return(

    <>
      <Navbar /> 

      <div className="faqcontainer">
        <h3>Frequently Asked Questions</h3>
        <p>We got you covered</p>
      {
      questions.map((item, index) => (
        <div key={index} className="faqitem">

          <button onClick={() => OpenAnswer(index)} className="faq-question"> {item.ques} </button>
          {
          activeQuestion === index && (
            <div className="faqanswer"> <p>{item.ans}</p> </div>
          )}

        </div>
      ))}
      </div>
    
    </>



  )
}

export default FAQ

