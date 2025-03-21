require('dotenv').config();
const express = require('express');
const bodyParse = require('body-parser');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParse.json());
app.use(bodyParse.urlencoded({extended: true}))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let bd = [];
let contador = 1;

app.post('/api/shorturl', async function (req, res){
  const { url } = req.body;
  console.log("bd: ", bd);
  
  if (!url){
    return res.json({"error":"Invalid Hostname"});
  }
  
  try {
    const temp = await verificarURL(url);
    console.log("temp: ", temp);
    
    if (!temp) {
      return res.json({"error":"Invalid Hostname"});
    }
    
    // Verificar se está na base de dados
    let dado = bd.find(item => item.original_url === url);
    console.log("dado: ", dado);
    
    if (!dado) {
      bd.push({"original_url": url, "short_url": contador});
      res.json({"original_url": url, "short_url": contador});
      contador++;
    } else {
      res.json({"original_url": url, "short_url": dado.short_url});
    }
  } catch (error) {
    console.error(error);
    res.json({"error":"Invalid Hostname"});
  }
});

// Rota para redirecionar URLs encurtadas
app.get('/api/shorturl/:short_url', (req, res) => {
  const { short_url } = req.params;
  const urlData = bd.find(item => item.short_url == short_url);

  if (!urlData) {
    return res.json({ "error": "No URL found for this ID" });
  }
  
  res.redirect(urlData.original_url);
});

function verificarURL(url) {
  return new Promise((resolve) => {
    try {
      const { hostname } = new URL(url);

      dns.resolve(hostname, (err) => {
        if (err) {
          console.log(`URL inválida ou inacessível: ${url}`);
          resolve(false);
        } else {
          console.log(`URL válida: ${url}`);
          resolve(true);
        }
      });
    } catch (err) {
      console.log(`URL malformada: ${url}`);
      resolve(false);
    }
  });
}

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
