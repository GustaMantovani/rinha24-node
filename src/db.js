const { Client, Pool } = require('pg');

const pool = new Pool({
  user: 'admin',
  host: 'localhost',
  database: 'postgres',
  password: '123',
  port: 5432,
})
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
  findClientById,
  findTransactionByClientId
};