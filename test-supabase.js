require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔧 Teste de Configuração do Supabase\n');

// Verificar variáveis de ambiente
console.log('1️⃣ Verificando variáveis de ambiente:');
console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Configurada' : '❌ Não configurada'}`);
console.log(`   SUPABASE_KEY: ${process.env.SUPABASE_KEY ? '✅ Configurada' : '❌ Não configurada'}`);
console.log(`   SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Não configurada'}`);
console.log(`   SUPABASE_SERVICE_KEY: ${process.env.SUPABASE_SERVICE_KEY ? '✅ Configurada' : '❌ Não configurada'}`);

// Valores das variáveis (mascarados)
if (process.env.SUPABASE_URL) {
    console.log(`   URL: ${process.env.SUPABASE_URL.substring(0, 30)}...`);
}
if (process.env.SUPABASE_KEY) {
    console.log(`   KEY: ${process.env.SUPABASE_KEY.substring(0, 20)}...`);
}
if (process.env.SUPABASE_ANON_KEY) {
    console.log(`   ANON_KEY: ${process.env.SUPABASE_ANON_KEY.substring(0, 20)}...`);
}
if (process.env.SUPABASE_SERVICE_KEY) {
    console.log(`   SERVICE_KEY: ${process.env.SUPABASE_SERVICE_KEY.substring(0, 20)}...`);
}

console.log('');

// Testar conexão com Supabase
async function testSupabaseConnection() {
    console.log('2️⃣ Testando conexão com Supabase:');
    
    try {
        // Teste com SUPABASE_KEY (se disponível)
        if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
            console.log('   Testando com SUPABASE_KEY...');
            const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
            
            // Teste simples de conexão
            const { data, error } = await supabase.from('_test_connection').select('*').limit(1);
            
            if (error) {
                if (error.message.includes('does not exist')) {
                    console.log('   ✅ Conexão estabelecida (tabela de teste não existe, mas conexão OK)');
                } else {
                    console.log(`   ❌ Erro na conexão: ${error.message}`);
                }
            } else {
                console.log('   ✅ Conexão estabelecida com sucesso');
            }
        } else {
            console.log('   ⚠️ SUPABASE_URL ou SUPABASE_KEY não configurados');
        }

        // Teste com SUPABASE_ANON_KEY (se disponível)
        if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
            console.log('   Testando com SUPABASE_ANON_KEY...');
            const supabaseAnon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
            
            const { data, error } = await supabaseAnon.from('_test_connection').select('*').limit(1);
            
            if (error) {
                if (error.message.includes('does not exist')) {
                    console.log('   ✅ Conexão anônima estabelecida (tabela de teste não existe, mas conexão OK)');
                } else {
                    console.log(`   ❌ Erro na conexão anônima: ${error.message}`);
                }
            } else {
                console.log('   ✅ Conexão anônima estabelecida com sucesso');
            }
        } else {
            console.log('   ⚠️ SUPABASE_URL ou SUPABASE_ANON_KEY não configurados');
        }

    } catch (error) {
        console.log(`   ❌ Erro geral na conexão: ${error.message}`);
    }
}

// Testar autenticação
async function testSupabaseAuth() {
    console.log('\n3️⃣ Testando autenticação do Supabase:');
    
    try {
        if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
            const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
            
            // Teste de criação de usuário
            const testEmail = `testando@gmail.com`;
            const testPassword = 'test123456';
            
            console.log(`   Tentando criar usuário: ${testEmail}`);
            
            const { data, error } = await supabase.auth.signUp({
                email: testEmail,
                password: testPassword,
            });
            
            if (error) {
                console.log(`   ❌ Erro ao criar usuário: ${error.message}`);
                
                if (error.message.includes('fetch failed')) {
                    console.log('   🔍 PROBLEMA IDENTIFICADO: fetch failed');
                    console.log('   💡 POSSÍVEIS CAUSAS:');
                    console.log('      • URL do Supabase incorreta');
                    console.log('      • Problema de conectividade de rede');
                    console.log('      • Firewall bloqueando a conexão');
                    console.log('      • Projeto Supabase inativo ou suspenso');
                }
            } else {
                console.log('   ✅ Usuário criado com sucesso');
                console.log(`   ID do usuário: ${data.user.id}`);
                
                // Tentar deletar o usuário de teste
                try {
                    await supabase.auth.admin.deleteUser(data.user.id);
                    console.log('   ✅ Usuário de teste removido');
                } catch (deleteError) {
                    console.log(`   ⚠️ Não foi possível remover usuário de teste: ${deleteError.message}`);
                }
            }
        } else {
            console.log('   ⚠️ Variáveis do Supabase não configuradas para teste de auth');
        }
    } catch (error) {
        console.log(`   ❌ Erro no teste de autenticação: ${error.message}`);
    }
}

// Testar configuração do app.js
function testAppConfig() {
    console.log('\n4️⃣ Verificando configuração do app.js:');
    
    try {
        const app = require('./app.js');
        const supabase = app.get('supabase');
        
        if (supabase) {
            console.log('   ✅ Supabase configurado no app.js');
            console.log(`   URL: ${supabase.supabaseUrl}`);
            console.log(`   Key: ${supabase.supabaseKey.substring(0, 20)}...`);
        } else {
            console.log('   ❌ Supabase não configurado no app.js');
        }
    } catch (error) {
        console.log(`   ❌ Erro ao verificar app.js: ${error.message}`);
    }
}

// Executar todos os testes
async function runAllTests() {
    await testSupabaseConnection();
    await testSupabaseAuth();
    testAppConfig();
    
    console.log('\n5️⃣ RESUMO E RECOMENDAÇÕES:');
    console.log('');
    
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
        console.log('❌ PROBLEMA: Variáveis do Supabase não configuradas');
        console.log('💡 SOLUÇÃO: Configure as variáveis de ambiente:');
        console.log('   SUPABASE_URL=sua_url_do_supabase');
        console.log('   SUPABASE_KEY=sua_chave_do_supabase');
        console.log('   SUPABASE_ANON_KEY=sua_chave_anonima');
        console.log('   SUPABASE_SERVICE_KEY=sua_chave_de_servico');
    } else {
        console.log('✅ Variáveis do Supabase configuradas');
    }
    
    console.log('');
    console.log('🔧 PRÓXIMOS PASSOS:');
    console.log('1. Verifique se o projeto Supabase está ativo');
    console.log('2. Confirme se as chaves estão corretas');
    console.log('3. Teste a conectividade de rede');
    console.log('4. Verifique os logs do backend');
    console.log('5. Use o arquivo test-auth.html para testar via frontend');
}

// Executar testes
runAllTests().catch(console.error); 