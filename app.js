import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
app.use(express.json());
// Isso permite que o navegador encontre seus arquivos HTML/CSS na pasta atual
app.use(express.static('./')); 

// Função para abrir o banco sempre que precisar
async function conectarBanco() {
    return open({
        filename: './banco.db',
        driver: sqlite3.Database
    });
}

// 1. Lógica Inicial (Cria a tabela e valores iniciais ao ligar o servidor)
async function inicializarSistema() {
    const db = await conectarBanco();
    await db.run(`
        CREATE TABLE IF NOT EXISTS estoque (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            sabor TEXT UNIQUE, 
            quantidade INTEGER
        )
    `);
    console.log("✅ Banco de Dados Pronto.");
    await db.close();
}

// 2. ROTA DE ATUALIZAÇÃO (O "Ouvidor" para a Página B)
app.post('/atualizar-estoque', async (req, res) => {
    const listaProdutos = req.body; 
    const db = await conectarBanco();

    try {
        for (const item of listaProdutos) {
            await db.run(
                `INSERT OR REPLACE INTO estoque (sabor, quantidade) VALUES (?, ?)`,
                [item.sabor, item.quantidade]
            );
        }
        console.log("📊 Estoque atualizado via Página B");
        res.status(200).send({ mensagem: "Sincronizado!" });
    } catch (e) {
        res.status(500).send({ erro: e.message });
    } finally {
        await db.close();
    }
});

// O comando process.env.PORT tenta pegar a porta do servidor online
// Se não encontrar (no caso do seu PC), ele usa a 3000 automaticamente
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    await inicializarSistema();
    console.log(`🚀 Servidor rodando! No seu PC acesse: http://localhost:${PORT}`);
});