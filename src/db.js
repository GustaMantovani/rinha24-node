
async function findClientById(connection,clienteId) {
    const res = await connection.query(`SELECT id,limite,saldo FROM clientes WHERE id = ${clienteId}`)
  
  return res;
}

async function findTransactionByClientId(connection,clienteId){
    const res = await connection.query(`SELECT valor,tipo,descricao,realizada_em FROM transacoes WHERE id_cliente = ${clienteId}`)
}

async function insertTransaction(connection,id_cliente, valor, tipo, descricao, realizada_em) {
   
  const query = `
      INSERT INTO transacoes (id_cliente, valor, tipo, descricao, realizada_em)
      VALUES ($1, $2, $3, $4, $5)
  `;
  const values = [id_cliente, valor, tipo, descricao, realizada_em];

  await connection.query(query, values); 
   
}

async function updateClientBalance(connection,id_cliente, novoSaldo) {
  
  const query = `
      UPDATE clientes
      SET saldo = $1
      WHERE id = $2
  `;
  const values = [novoSaldo, id_cliente];
  await connection.query(query, values);
  
}

module.exports = {
  findClientById,
  findTransactionByClientId,
  insertTransaction,
  updateClientBalance
};