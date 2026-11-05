import React, {useState} from "react";


const ChatInput = ({onSend}) =>{
const [question, setQuestion] = useState("");

const handleSubmit = (e) =>{
    e.preventDefault();

    if(!question.trim()) return;

    onSend(question);
    setQuestion("");
} 

return (
    <form onSubmit={handleSubmit} className = "flex items-center gap-3 border-t border-gray-200 p-4">
        <input type = "text" placeholder = "Ask something about your pdf..." value = {question} 
        onChange = {(e)=> setQuestion(e.target.value)}
    className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <button type = "submit"
        className="cursor-pointer rounded-xl bg-blue-400 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
>Send</button>
    </form>
)
}



export default ChatInput;