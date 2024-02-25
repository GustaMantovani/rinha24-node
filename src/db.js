const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

async function getAllClientes() {
  const query = 'SELECT * FROM clientes';
  const result = await pool.query(query);
  return result;
}

async function findClientById(clienteId) {
  const client = await pool.connect()
  const res = await client.query(`SELECT id,limite,saldo FROM clientes WHERE id = ${clienteId}`)
  client.release()
  return res.rows
}

async function findTransactionByClientId(clienteId){
  const client = await pool.connect()
  const res = await client.query(`SELECT valor,tipo,descricao,realizada_em FROM transacoes WHERE id_cliente = ${clienteId}`)
  client.release()
  return res.rows
}

module.exports = {
  getAllClientes,
  findClientById,
  findTransactionByClientId
};