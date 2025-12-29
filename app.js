const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors'); // Ativando a permissão de segurança
const app = express();
const port = process.env.PORT || 10000;

// Configurações Iniciais
app.use(cors()); // Libera o acesso para o seu GitHub Pages
app.use(express.json());

// Configuração do Banco de Dados SQLite (4 KB de poder!)
const db = new sqlite3.Database('./banco.db', (err) => {
    if (err) {
        console.error("❌ Erro ao abrir banco:", err.message);
    } else {
        console.log("✅ Banco de Dados Pronto.");
        db.run(`CREATE TABLE IF NOT EXISTS estoque (
            sabor TEXT PRIMARY KEY,
            quantidade INTEGER
        )`);
    }
});

// Rota para buscar o estoque
app.get('/estoque', (req, res) => {
    db.all("SELECT * FROM estoque", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Rota para salvar o estoque (Página B usa esta aqui)
app.post('/atualizar-estoque', (req, res) => {
    const listaProdutos = req.body;
    
    db.serialize(() => {
        const stmt = db.prepare("INSERT OR REPLACE INTO estoque (sabor, quantidade) VALUES (?, ?)");
        listaProdutos.forEach(item => {
            stmt.run(item.sabor, item.quantidade);
        });
        stmt.finalize((err) => {
            if (err) return res.status(500).json({ success: false });
            res.json({ success: true });
        });
    });
});

app.listen(port, () => {
    console.log(`🚀 Servidor rodando! No seu PC acesse: http://localhost:${port}`);
});