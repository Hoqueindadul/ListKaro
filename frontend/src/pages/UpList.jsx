import './UpList.css';
import { useState } from 'react';

function UpList() {
  const [ocrText, setOcrText] = useState([]); 

  async function upload() {
    let file = document.getElementById("fileId").files[0];
    if (!file) return alert("Please select a file");
  
    const ValidExtension = ["image/jpeg", "image/png"];
    if (!ValidExtension.includes(file.type)) {
      return alert("Please upload a valid JPG or PNG image");
    }
  
    let formFile = new FormData();
    formFile.append("image", file); 
  
    try {
      const response = await fetch("http://localhost:5000/api/upload-ocr", {
        method: 'POST',
        body: formFile,
      });
  
      const data = await response.json();
      console.log("Extracted lines:", data.lines);
  
      if (data?.lines) {
        const extractedItems = extractItems(data.lines);
        console.log("Separated Items:", extractedItems);
        setOcrText(extractedItems);
        alert("List has been uploaded successfully");
      } else {
        alert("Failed to extract list items!");
      }
    } catch (err) {
      console.error(err);
      alert("Upload Failed");
    }
  }
  

  function extractItems(lines) {
    const pattern = /^(.*)\s+(\d+(?:\.\d+)?\s*(?:kg|gm|g|ml|litre|l|pcs)?)$/i;
  
    return lines.map(line => {
      const match = line.match(pattern);
      if (match) {
        return {
          name: match[1].trim().toLowerCase(),
          quantity: match[2].trim()
        };
      } else {

        const words = line.trim().split(" ");
        const name = words.slice(0, -1).join(" ");
        const quantity = words.slice(-1).join("");
        return {
          name: name.toLowerCase(),
          quantity
        };
      }
    });
  }
  
  

  return (
    <>
      <div className="listcontainer">
        <p id="uploadtitle">Upload Your List or Fill the Form</p>
        <p id='instruction'>Please upload list as the <i> <strong> .jpg or .png  </strong> </i> format</p>
        <hr />

        <div className="listbox">
          <div className="dragndrop">
            <div className="imagecontainer">
              <img src="/images/m.jpg" alt="" />
            </div>

            <label htmlFor="fileId" className="filelabel">Choose File</label>
            <input type="file" id="fileId" accept="image/png, image/jpeg" />
            <button onClick={upload} className="filesubmit">Submit</button>
          </div>

          <p className="or">OR</p>

          <div className="listform">
            <form>
              List Form
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default UpList;
