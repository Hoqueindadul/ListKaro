import './UpList.css'
function UpList() {

    return <>

        <div className="listcontainer">
            <p id="uploadtitle">Upload Files</p> 
            <hr />

            <div className="listbox">
                <div className="dragndrop">
                    Drag and Drop
                </div>
                <p className='or'>OR</p>

                <div className="listform">
                    <form action="" method="post">
                        List Form
                    </form>
                </div>
            </div>
        </div>


    </>

}

export default UpList;