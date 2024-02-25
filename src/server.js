const port = process.env.PORT || 3000;
const express = require('express')
const app = express()
const { getAllClientes, findClientById, findTransactionByClientId } = require('./db.js');

//Funções
async function realizar_transacao(json_transacao,id_cliente_url){
  
}

async function consultar_extrato(id_cliente_url){
  const cliente = await findClientById(id_cliente_url);
  if (cliente) {
    const transacoes = await findTransactionByClientId(id_cliente_url);
    return { cliente, transacoes };
  }
  return null;
}

//Routing

//Transacao
app.use(express.json());
app.post('/clientes/:id_cliente_url/transacoes', (req,res) => {
  const jsonData = req.body;
  res.json(jsonData); 
})

//Extrato
app.get('/clientes/:id_cliente_url/extrato', async (req, res) => {
  const extrato = await consultar_extrato(req.params.id_cliente_url);
  if (extrato) {

    const jsonRes = {
      "saldo": {
        "total": extrato.cliente[0].saldo, 
        "data_extrato": new Date().toISOString(), 
        "limite": extrato.cliente[0].limite
      },
      "ultimas_transacoes": extrato.transacoes
    };
    
    res.json(jsonRes);
  } else {
    res.status(404).json({ error: 'Cliente não encontrado' });
  }
});

app.get('/banco', (req, res) => {
  getAllClientes().then((dadosClientes)=> {
    res.json(dadosClientes.rows)
  })
})

// Rota padrão para lidar com URLs não encontrados
app.use((req, res) => {
  res.status(404).send('Not Found');
});

//Instancia do servidor
app.listen(port, () => {
  console.log(`Servidor Express está rodando em http://localhost:${port}`);
});
