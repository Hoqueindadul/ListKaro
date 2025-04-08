import tesseract from 'tesseract.js';

<<<<<<< HEAD
tesseract.recognize(
    "../uploads/list.jpeg",
    "eng",
    {
        langPath: "./testdata",
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-kg ",
    }
)
.then((
    { data: {text} }) => {
        console.log(text)
    })

// tesseract.recognize(
//     "../uploads/list.jpeg",
//     "eng",
//     {
//         langPath: "./testdata", 
//     }
// )
// .then((
//     { data: { text } }) => {

//     // Every item with quantity is extracted in items without space, lines and empty lines
//     const items = text.split("\n").map(i => i.trim()).filter(Boolean)

//     // How many items in the list
//     const total_items = items.length
//     let itemArr = [];

//     items.forEach( (item, index) => {
//         const quan = item.match(/(\d+(\.\d+)?\s?[a-zA-Z]*)$/);       
        
//                                                             // \d+       → Matches numbers  
//                                                             // (\.\d+)?  → Optionally matches decimal numbers  
//                                                             // \s?       → Optionally matches a space after the number  
//                                                             // [a-zA-Z]* → Matches optional units (letters only)  
//                                                             // $         → Ensures it matches only at the end of the string  
//         const itemQuant = quan ? quan[0] : "Null"           // quan[0] means full match, quan[1] only numeric part  
//         const itemName = quan ? item.replace(quan[0], "").trim() : item;
//         itemArr.push({itemName, itemQuant})
//         global[`item${index+1}Name`] = itemName;
//         global[`item${index+1}Quantity`] = itemQuant;
//     });
//     console.log(itemArr)
//     console.log("Total number of items : ",total_items)

// })
=======
        tesseract.recognize(
            "../uploads/list.png",
            "train",
            {
                langPath: "./testdata", 
                // tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ", 
                oem: 1,  
                psm: 6  
            }
        )
        .then((
            { data: { text } }) => {

            // Every item with quantity is extracted in items without space, lines and empty lines
            const items = text.split("\n").map(i => i.trim()).filter(Boolean)

            // How many items in the list
            const total_items = items.length
            let itemArr = [];

            items.forEach( (item, index) => {
                const quan = item.match(/(\d+(\.\d+)?\s?[a-zA-Z]*)$/);       
                
                                                                    // \d+       → Matches numbers  
                                                                    // (\.\d+)?  → Optionally matches decimal numbers  
                                                                    // \s?       → Optionally matches a space after the number  
                                                                    // [a-zA-Z]* → Matches optional units (letters only)  
                                                                    // $         → Ensures it matches only at the end of the string  
                const itemQuant = quan ? quan[0] : "Null"           // quan[0] means full match, quan[1] only numeric part  
                const itemName = quan ? item.replace(quan[0], "").trim() : item;
                itemArr.push({itemName, itemQuant})
                global[`item${index+1}Name`] = itemName;
                global[`item${index+1}Quantity`] = itemQuant;
            });
            console.log(itemArr);

            console.log("Total number of items : ",total_items)
        })

>>>>>>> 8c739f4c0874bfe31404e64df860bc0828e694be
