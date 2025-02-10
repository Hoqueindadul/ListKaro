import express from 'express'

const app = express()

app.get("/", (req, res) => {
    res.send("hello world!")
})
app.listen(2004, () =>{
    console.log("app is running.")
})