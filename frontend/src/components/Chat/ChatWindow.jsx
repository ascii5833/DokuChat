import React, {useState, useRef, useEffect} from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const ChatWindow = ({onCitiationClick}) =>{
const [messages, setMessages] = useState([
     {
            role: "assistant",
            content: "Hello! Upload a PDF and ask me anything about it.",
            sources: []
        }
]);

//loaders
const [loading, setLoading] = useState(false);

const messagesEndRef = useRef(null);

useEffect(()=>{
messagesEndRef.current?.scrollIntoView({
    behavior: "smooth"
});
}, [loading, messages])



const handleSend = (question) => {
    const newMessage = {
        role: "user",
        content: question
    }

    setMessages(prev => [...prev, newMessage])

    setLoading(true);


    //server request
    setTimeout(()=>{
        setMessages(prev=>[...prev, {
            role : "assistant",
            content: "This is a mock ai response always will trigger in our case",
            sources:[
                {page : 3},
                {page: 6}
            ]
        }]);

        setLoading(false);
    }, 1000);
}

return (
    <div className="flex h-175 min-h-0 flex-col border-l border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-5">
            <h2 className = "text-lg font-semibold text-gray-900">DokuChat Assistant</h2>
            <p className = "mt-1 text-sm text-gray-500">Ask questions about your document</p>
        </div>
        <div className = "flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-5">
            {messages.map((message, index)=>
            <ChatMessage key = {index} message = {message} onCitiationClick={onCitiationClick}/>)}

            {loading ? (<div className = "self-start text-sm text-gray-500 animate-pulse"> 
                DokuChat is thinking...
            </div>) : null}

            <div ref = {messagesEndRef}/>
        </div>


        <ChatInput onSend = {handleSend} />
    </div>
)
}


export default ChatWindow;