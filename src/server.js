const port = process.env.PORT || 3000;
const express = require('express')
const app = express()
const { findClientById, findTransactionByClientId, updateClientBalance, insertTransaction } = require('./db.js');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

//Funções
async function realizar_transacao(json_transacao, id_cliente_url) {
  if (id_cliente_url >= 0) { // a segunda condição do && é uma gambiarra do caralho, mas aumenta o desempenho no caso desse teste em específico
    const connection = await pool.connect()
    const cliente = await findClientById(connection, id_cliente_url);
    if (cliente.rows.length > 0) {

      // Dados atuais do cliente
      let saldoAtual = cliente.rows[0].saldo;
      const limite = cliente.rows[0].limite;

      if(json_transacao.valor != null && json_transacao.descricao != null && json_transacao.tipo != null && json_transacao.valor%1 === 0){

        // Dados do JSON de transação
        const valorTransacao = json_transacao.valor;
        const descTransacao = json_transacao.descricao;
        const tipoTransacao = json_transacao.tipo;

        if (descTransacao.length <= 10 && descTransacao.length > 0 && valorTransacao != 0){

          if (tipoTransacao === 'c') {

            saldoAtual += valorTransacao;

            await insertTransaction(connection,id_cliente_url, valorTransacao, tipoTransacao, descTransacao, new Date().toISOString());
            await updateClientBalance(connection, id_cliente_url, saldoAtual);
            connection.release();
            return { "limite": limite, "saldo": saldoAtual };

          } else if (tipoTransacao === 'd') {

            if((saldoAtual + valorTransacao) >= (limite * -1)) {

              saldoAtual += valorTransacao;

              await insertTransaction(connection, id_cliente_url, valorTransacao, tipoTransacao, descTransacao, new Date().toISOString());
              await updateClientBalance(connection, id_cliente_url, saldoAtual);
              connection.release();
              return { "limite": limite, "saldo": saldoAtual };

            }
          }
        }
      }
      connection.release();
      return 422;
    }
    connection.release();
  }else {
    return 404;
  }
}

async function consultar_extrato(id_cliente_url){
  if(id_cliente_url => 0){
    const connection = await pool.connect()
    const cliente = await findClientById(connection,id_cliente_url);

    if (cliente.rows && cliente.rows.length > 0) {
      const transacoes = await findTransactionByClientId(connection, id_cliente_url);
      connection.release();
      return { clientes: cliente.rows, transacoes: transacoes.rows };
    }
    connection.release();
  }
  return 404;
}

//Routing

//Transacao
app.use(express.json());
app.post('/clientes/:id_cliente_url/transacoes', async (req,res) => {
  const res_transacao = await realizar_transacao(req.body,req.params.id_cliente_url);
  if(res_transacao == 422){
    res.status(422).send('KKK');
  }else if(res_transacao == 404){
    res.status(404).send('Not Found');
  }else{
    res.json(res_transacao);
  }
})

//Extrato
app.get('/clientes/:id_cliente_url/extrato', async (req, res) => {
  const extrato = await consultar_extrato(req.params.id_cliente_url);
  if (extrato!=404) {
    const jsonRes = {
      "saldo": {
        "total": extrato.clientes[0].saldo, 
        "data_extrato": new Date().toISOString(), 
        "limite": extrato.clientes[0].limite
      },
      "ultimas_transacoes": extrato.transacoes || []
    };
    res.json(jsonRes);
  } else {
    res.status(404).json({ error: 'Cliente não encontrado' });
  }
});


// Rota padrão para lidar com URLs não encontrados
app.use((req, res) => {
  res.status(404).send('Not Found');
});

//Instancia do servidor
app.listen(port, () => {
  console.log(`Servidor Express está rodando em http://localhost:${port}`);
});
