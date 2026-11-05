import React from 'react';


const UploadToggleBtn = ({toggleUpload}) => {
    return <button className = "h-10 bg-blue-400 hover:bg-blue-500 cursor-pointer text-white rounded w-30 text-center text-sm"
    onClick = {toggleUpload}>
        File Upload
    </button>
}


export default UploadToggleBtn;

