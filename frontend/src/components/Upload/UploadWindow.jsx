import React, {useState} from "react";
import UploadToggleBtn from "./UploadToggleBtn";
import UploadModal from "./UploadModal";

const UploadWindow = ({handleSubmit, itemClicked}) => {
    const [showTog, updateShowTog] = useState(true);

    const toggleUpload = () =>{
        updateShowTog(prev => !prev);
    }
    return <div className="pb-10 justify-center flex m-5">
        {showTog ? null : <UploadModal toggleUpload={toggleUpload} handleSubmit = {handleSubmit} />}
        <UploadToggleBtn toggleUpload={toggleUpload}/>
    </div>
}


export default UploadWindow;