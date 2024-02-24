const { Client, Pool } = require('pg');
const express = require('express')
const app = express()
const port = 3000;
const { findClientById, findTransactionByClientId } = require('./db.js');
const pool = new Pool({
  user: 'admin',
  host: 'localhost',
  database: 'postgres',
  password: '123',
  port: 5432,
})

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

async function getAllClientes() {
  const query = 'SELECT * FROM clientes';
  const result = await pool.query(query);
  return result;
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
    res.json(extrato);
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
