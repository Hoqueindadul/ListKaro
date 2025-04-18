import './UpList.css'
function UpList() {

    async function upload() {
        let file = document.getElementById("fileId").files[0]
        if (!file) return alert("Please select a file")

        const ValidExtension = ["image/jpeg", "image/png"];
            if (!ValidExtension.includes(file.type)) {
                return alert("Please upload a valid JPG or PNG image");
            }
        let formFile = new FormData()
        formFile.append("file", file)

        try{
            const response = await fetch("http://localhost:5000/api/upload", {
                method:'POST',
                body:formFile,
            })
            alert("Upload Successful")
        }
        catch{
            alert("Upload Failed")
        }

        
    }

    return <>

        <div className="listcontainer">
            <p id="uploadtitle">Upload Files</p> 
            <hr />

            <div className="listbox">
                <div className="dragndrop">

                <label for="fileId" class="filelabel">Choose File</label>
                <input type="file" id="fileId" accept="image/png, image/jpeg" />
                    <button onClick={upload} className='filesubmit'> Submit</button>
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