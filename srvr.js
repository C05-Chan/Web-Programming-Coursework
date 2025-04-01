const express = require('express');
const path = require('path');
const app = express();
const PORT = 8080;

app.use(express.static(path.join(__dirname)));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
}); 

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

app.post('/submit', (req,res) =>{
    const poo =  req.body;
    console.log(poo);
    // Array.PUSH
    //VALIDATION
});

//API