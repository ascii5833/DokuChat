import React, {useState} from "react";
import DocListBtn from "./DocListBtn";
import DocListModal from "./DocListModal";


const DocListWindow = () => {
    const [showDocs, updateShowDocs] = useState(true);

    const toggleDocList = () =>{
        updateShowDocs(prev => !prev);
    }
    return <div className="pb-10 justify-center flex m-5">
        {showDocs ? null : <DocListModal toggleDocList={toggleDocList}/>}
        <DocListBtn toggleDocList={toggleDocList}/> 
    </div>
}


export default DocListWindow;