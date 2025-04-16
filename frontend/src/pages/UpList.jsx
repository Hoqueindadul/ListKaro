import './UpList.css';
import './UpListDark.css'
import { useState } from 'react';
import Navbar from './Navbar'

function UpList() {
  const [ocrText, setOcrText] = useState([]); 
  const [productInputs, setProductInputs] = useState([
    { name: '', quantity: '' },
    { name: '', quantity: '' }, //Initially show 2 input boxes
  ]);

  const handleChange = (index, field, value) => {
    const updated = [...productInputs];  //Keep copy  of the current boxes
    updated[index][field] = value;      //index -> which box, field -> name or quantity, value->user typed value (like egg, 20pcs etc)
    setProductInputs(updated);          //Update the state
  };

  const addNewProductField = () => {
    setProductInputs([...productInputs, { name: '', quantity: '' }]); //Add a new box
  };

  const removeProductField = (index) => {
    const updated = [...productInputs]; //Keep copy  of the current  input boxes
    updated.splice(index, 1);           //Remove the clicked index
    setProductInputs(updated);          //Update the state
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted products:', productInputs);

    //Backend Require Here

  };

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
      {/* <nav className="navbar my-navbar">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <img src="/images/logo.png" alt="logo" className="logo" />
            <a className="navbar-brand my-brand ms-2" href="#">ListKaro</a>
          </div>
        </div>

        <button className="navbar-toggler ms-auto me-auto" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu" aria-label="Toggle navigation"  >
          <span className="navbar-toggler-icon" ></span>
        </button>

        <div className="offcanvas offcanvas-end custom-sidebar" tabIndex="-1" id="sidebarMenu" aria-labelledby="sidebarTitle" >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="sidebarTitle">Menu</h5>
            <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>

          <div className="offcanvas-body">
            <ul className="navbar-nav">
              <li className="nav-item"><a className="nav-link" href="/">Home</a></li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">Products</a>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#">Dairy</a></li>
                  <li><a className="dropdown-item" href="#">Packed</a></li>
                  <li><a className="dropdown-item" href="#">Veggies & Fruits</a></li>
                  <li><a className="dropdown-item" href="#">Sweets</a></li>
                </ul>
              </li>
              <li className="nav-item"><a className="nav-link" href="/uploadlist">Upload List</a></li>
              <li className="nav-item"><a className="nav-link" href="/about" target="_blank" rel="noopener noreferrer">About</a></li>
              <li className="nav-item"><a className="nav-link" href="/profile">Profile</a></li></ul>
          </div>
        </div>


      </nav> */}

      <Navbar/>

      

      <div className="listcontainer">
        <p id="uploadtitle">Upload Your List or Fill the Form</p>
        <p id='instruction'>Please upload list as the <i> <strong> .jpg or .png  </strong> </i> format</p>
        <hr />

        <div className="listbox">
          <div className="dragndrop">
            <div className="imagecontainer">
              <label htmlFor="fileId" className="filelabel">
              <img src="/images/upload.png" alt="" />
              </label>
            </div>
            <input type="file" id="fileId" accept="image/png, image/jpeg" />
            <button onClick={upload} className="filesubmit">Upload</button>
          </div>

          <p className="or">OR</p>

          <div className="listform">
          <form onSubmit={handleSubmit}>
            {
              productInputs.map((product, index) => (
              <div className="prod" key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input type="text" placeholder="Product Name (e.g Egg, Milk)" value={product.name} onChange={(e) => handleChange(index, 'name', e.target.value)}/>
                <input type="text" placeholder="Quantity (e.g 20kg, 200ml, 7p)" value={product.quantity} onChange={(e) => handleChange(index, 'quantity', e.target.value)}/>
                <img src="images/dustbin.png" alt="" onClick={() => removeProductField(index)}  />
              </div>
               ))
            }
            <div className="buttons">
            <input type="button" value="Add New Product +" onClick={addNewProductField} className="addprodbtn" />
            <button type="submit" className="filesubmit">Upload</button>
            </div>

          </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default UpList;
