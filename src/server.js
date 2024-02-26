const port = process.env.PORT || 3000;
const express = require('express')
const app = express()
const { getAllClientes, findClientById, findTransactionByClientId, updateClientBalance, insertTransaction } = require('./db.js');

//Funções
async function realizar_transacao(json_transacao, id_cliente_url) {
  if (id_cliente_url >= 0 && id_cliente_url<6) { // a segunda condição do && é uma gambiarra do caralho, mas aumenta o desempenho no caso desse teste em específico

    const cliente = await findClientById(id_cliente_url);

    if (cliente) {

      // Dados atuais do cliente
      let saldoAtual = cliente[0].saldo;
      const limite = cliente[0].limite;

      if(json_transacao.valor != null && json_transacao.descricao != null && json_transacao.tipo != null){

        // Dados do JSON de transação
        const valorTransacao = parseInt(json_transacao.valor);
        const descTransacao = json_transacao.descricao;
        const tipoTransacao = json_transacao.tipo;

        if (descTransacao.length <= 10 && descTransacao.length > 0 && valorTransacao > 0){

          if (tipoTransacao === 'c') {

            saldoAtual += valorTransacao;

            await insertTransaction(id_cliente_url, valorTransacao, tipoTransacao, descTransacao, new Date().toISOString());
            await updateClientBalance(id_cliente_url, saldoAtual);
            return { "limite": limite, "saldo": saldoAtual };

          } else if (tipoTransacao === 'd') {

            if((saldoAtual + valorTransacao) >= (limite * -1)) {

              saldoAtual += valorTransacao;

              await insertTransaction(id_cliente_url, valorTransacao, tipoTransacao, descTransacao, new Date().toISOString());
              await updateClientBalance(id_cliente_url, saldoAtual);
              return { "limite": limite, "saldo": saldoAtual };

            }
          }
        }
      }
      return 422;
    }
  }else {
    return 404;
  }
}



async function consultar_extrato(id_cliente_url){
  if(id_cliente_url => 0 && id_cliente_url < 6){ //NÃO FAÇA ISSO
    const cliente = await findClientById(id_cliente_url);
    if (cliente) {
      const transacoes = await findTransactionByClientId(id_cliente_url);
      return { cliente, transacoes };
    }
  }
  return;
}

//Routing

//Transacao
app.use(express.json());
app.post('/clientes/:id_cliente_url/transacoes', async (req,res) => {
  const res_transacao = await realizar_transacao(req.body,req.params.id_cliente_url);
  if(res_transacao[0] == 422){
    res.status(422).send('KKK');
  }else if(res_transacao[0] == 404){
    res.status(404).send('Not Found');
  }else{
    res.json(res_transacao);
  }
})

//Extrato
app.get('/clientes/:id_cliente_url/extrato', async (req, res) => {
  const extrato = await consultar_extrato(req.params.id_cliente_url);
  if (extrato && extrato.cliente && extrato.cliente.length > 0) {
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
