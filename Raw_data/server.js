const express = require('express');
// const http = require('http');
// const https = require('https');
 const cors = require('cors');
const app=express();
const port=3001;


// Enable CORS for all routes
app.use(cors()) 
app.listen(port,()=>{
    console.log(`api listening on prot${port}`);
})

// set route folder 


// use for specefic

// const corsOptions = {
//   origin: 'http://example.com',
//   optionsSuccessStatus: 200 // some legacy browsers choke on 204
// }

// app.use(cors(corsOptions));

//You can also enable CORS for specific routes: like this
app.get('/api/items',cors(), (req, res) => {
    // Handle GET request
    res.json([{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }]);
  });
  

//Or use a function to dynamically set CORS options:
// const corsOptions = {
//   origin: function (origin, callback) {
//     const allowedOrigins = ['http://example1.com', 'http://example2.com'];
//     if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }
// app.use(cors(corsOptions));


  app.post('/api/items', (req, res) => {
    // Handle POST request
    const newItem = req.body;
    // Process the new item (e.g., save to database)
    res.status(201).json(newItem);
  });

