import React from "react";

const ChatMessage = ({message, onCitiationClick}) => {
    const isUser = message.role === "user";

    return (
        <div className = {`max-w-[90%] ${isUser ? "self-end bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-3" 
        : "self-start text-gray-800"} `}>
        
        <p className = "whitespace-pre-wrap leading-7">{message.content}</p>

        {!isUser && message.sources.length > 0 ? (<div className = "mt-4 flex flex-wrap gap-2">
            <span className = "w-full text-xs font-semibold text-gray-500">Sources</span>
            {
                message.sources.map((source, index)=>(
                    <button key = {index} onClick = {()=> onCitiationClick(source, "spec")}
                    className = "rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100 transition cursor-pointer">
                        Page {source}
                    </button>
                ))
            }
        </div>) : null}

        </div>
    )
}


export default ChatMessage;