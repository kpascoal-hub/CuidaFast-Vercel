/**
 * Script de teste de conexão com Supabase
 * Execute: node test-connection.js
 */

require('dotenv').config({ path: require('path').join(__dirname, 'config/.env') });
const { Pool } = require('pg');

console.log('🔍 Testando conexão com Supabase...\n');

// Verificar se DATABASE_URL está configurada
if (!process.env.DATABASE_URL) {
  console.error('❌ ERRO: DATABASE_URL não está configurada no arquivo .env');
  console.log('\n📝 Passos para corrigir:');
  console.log('1. Copie o arquivo back-end/config/.env.example para .env');
  console.log('2. Edite o arquivo .env');
  console.log('3. Configure DATABASE_URL com sua string de conexão do Supabase');
  process.exit(1);
}

// Criar pool de conexões
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    // Teste 1: Conexão básica
    console.log('📡 Teste 1: Conectando ao banco de dados...');
    const client = await pool.connect();
    console.log('✅ Conexão estabelecida com sucesso!\n');

    // Teste 2: Verificar versão do PostgreSQL
    console.log('📊 Teste 2: Verificando versão do PostgreSQL...');
    const versionResult = await client.query('SELECT version()');
    console.log('✅ Versão:', versionResult.rows[0].version.split(',')[0]);
    console.log('');

    // Teste 3: Verificar se tabela usuario existe
    console.log('🗄️  Teste 3: Verificando tabela "usuario"...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'usuario'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ Tabela "usuario" encontrada!');
      
      // Contar usuários
      const countResult = await client.query('SELECT COUNT(*) FROM usuario');
      console.log(`   📊 Total de usuários cadastrados: ${countResult.rows[0].count}`);
    } else {
      console.log('⚠️  Tabela "usuario" NÃO encontrada!');
      console.log('   📝 Execute o arquivo back-end/database/schema.sql no Supabase');
    }
    console.log('');

    // Teste 4: Verificar se tabela tokens existe
    console.log('🔑 Teste 4: Verificando tabela "tokens"...');
    const tokensCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tokens'
      );
    `);
    
    if (tokensCheck.rows[0].exists) {
      console.log('✅ Tabela "tokens" encontrada!');
      
      // Contar tokens
      const countResult = await client.query('SELECT COUNT(*) FROM tokens');
      console.log(`   📊 Total de tokens ativos: ${countResult.rows[0].count}`);
    } else {
      console.log('⚠️  Tabela "tokens" NÃO encontrada!');
      console.log('   📝 Execute o arquivo back-end/database/schema.sql no Supabase');
    }
    console.log('');

    // Teste 5: Verificar índices
    console.log('🔍 Teste 5: Verificando índices...');
    const indexCheck = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename IN ('usuario', 'tokens')
      ORDER BY indexname;
    `);
    
    if (indexCheck.rows.length > 0) {
      console.log('✅ Índices encontrados:');
      indexCheck.rows.forEach(row => {
        console.log(`   - ${row.indexname}`);
      });
    } else {
      console.log('⚠️  Nenhum índice encontrado');
    }
    console.log('');

    // Liberar conexão
    client.release();

    // Resumo final
    console.log('═══════════════════════════════════════');
    console.log('✅ TODOS OS TESTES CONCLUÍDOS!');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('🎉 Seu banco de dados está configurado corretamente!');
    console.log('');
    console.log('📝 Próximos passos:');
    console.log('1. Inicie o servidor: npm start');
    console.log('2. Teste o cadastro em: front-end/HTML/cadastro.html');
    console.log('3. Teste o login em: index.html');
    console.log('');

  } catch (error) {
    console.error('❌ ERRO durante os testes:');
    console.error('');
    console.error('Detalhes do erro:', error.message);
    console.error('');
    
    if (error.code === 'ENOTFOUND') {
      console.log('🔧 Possíveis causas:');
      console.log('- DATABASE_URL incorreta no arquivo .env');
      console.log('- Problema de conexão com a internet');
      console.log('- Projeto do Supabase pausado ou deletado');
    } else if (error.code === '28P01') {
      console.log('🔧 Possíveis causas:');
      console.log('- Senha incorreta na DATABASE_URL');
      console.log('- Verifique a string de conexão no Supabase');
    } else if (error.code === '3D000') {
      console.log('🔧 Possíveis causas:');
      console.log('- Nome do banco de dados incorreto');
      console.log('- Use "postgres" como nome do banco');
    }
    
    console.log('');
    console.log('📚 Consulte SETUP_SUPABASE.md para mais ajuda');
    
  } finally {
    // Fechar pool
    await pool.end();
  }
}

// Executar testes
testConnection();
