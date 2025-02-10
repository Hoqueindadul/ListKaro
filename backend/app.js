import express from 'express';

const app = express();

app.get("/home", (req, res) => {
    res.send("hello world!");
});

app.listen(2004, () => {
    console.log("app is running."); // Ensure this line is here
});

