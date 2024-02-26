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

async function insertTransaction(id_cliente, valor, tipo, descricao, realizada_em) {
  const client = await pool.connect(); 
  const query = `
      INSERT INTO transacoes (id_cliente, valor, tipo, descricao, realizada_em)
      VALUES ($1, $2, $3, $4, $5)
  `;
  const values = [id_cliente, valor, tipo, descricao, realizada_em];

  await client.query(query, values); 
  client.release(); 
}

async function updateClientBalance(id_cliente, novoSaldo) {
  const client = await pool.connect();
  const query = `
      UPDATE clientes
      SET saldo = $1
      WHERE id = $2
  `;
  const values = [novoSaldo, id_cliente];
  await client.query(query, values);
  client.release();
}


module.exports = {
  getAllClientes,
  findClientById,
  findTransactionByClientId,
  insertTransaction,
  updateClientBalance
};