require('dotenv').config();

console.log('🔍 Validador de Variáveis de Ambiente\n');

// Variáveis obrigatórias
const requiredVars = [
    'NODE_ENV',
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'OPENAI_API_KEY'
];

// Variáveis opcionais
const optionalVars = [
    'PORT',
    'CLIENT_URL',
    'ADMIN_PASSWORD',
    'WHATSAPP_API_KEY',
    'LOG_LEVEL'
];

// Verificar variáveis obrigatórias
console.log('📋 Verificando variáveis obrigatórias:');
let missingVars = [];

requiredVars.forEach(varName => {
    if (!process.env[varName]) {
        console.log(`   ❌ ${varName}: Não configurada`);
        missingVars.push(varName);
    } else {
        console.log(`   ✅ ${varName}: Configurada`);
    }
});

// Verificar variáveis opcionais
console.log('\n📋 Verificando variáveis opcionais:');
optionalVars.forEach(varName => {
    if (!process.env[varName]) {
        console.log(`   ⚠️  ${varName}: Não configurada (opcional)`);
    } else {
        console.log(`   ✅ ${varName}: Configurada`);
    }
});

// Verificar valores específicos
console.log('\n🔍 Verificando valores específicos:');

// NODE_ENV
if (process.env.NODE_ENV) {
    const validEnvs = ['development', 'staging', 'production'];
    if (validEnvs.includes(process.env.NODE_ENV)) {
        console.log(`   ✅ NODE_ENV: ${process.env.NODE_ENV} (válido)`);
    } else {
        console.log(`   ⚠️  NODE_ENV: ${process.env.NODE_ENV} (valor inesperado)`);
    }
}

// JWT_SECRET
if (process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length >= 32) {
        console.log(`   ✅ JWT_SECRET: ${process.env.JWT_SECRET.length} caracteres (adequado)`);
    } else {
        console.log(`   ❌ JWT_SECRET: ${process.env.JWT_SECRET.length} caracteres (muito curto)`);
        missingVars.push('JWT_SECRET_LENGTH');
    }
}

// JWT_REFRESH_SECRET
if (process.env.JWT_REFRESH_SECRET) {
    if (process.env.JWT_REFRESH_SECRET.length >= 32) {
        console.log(`   ✅ JWT_REFRESH_SECRET: ${process.env.JWT_REFRESH_SECRET.length} caracteres (adequado)`);
    } else {
        console.log(`   ❌ JWT_REFRESH_SECRET: ${process.env.JWT_REFRESH_SECRET.length} caracteres (muito curto)`);
        missingVars.push('JWT_REFRESH_SECRET_LENGTH');
    }
}

// Verificar se as chaves JWT são diferentes
if (process.env.JWT_SECRET && process.env.JWT_REFRESH_SECRET) {
    if (process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
        console.log(`   ❌ JWT_SECRET e JWT_REFRESH_SECRET são iguais (inseguro)`);
        missingVars.push('JWT_KEYS_SAME');
    } else {
        console.log(`   ✅ JWT_SECRET e JWT_REFRESH_SECRET são diferentes (seguro)`);
    }
}

// MONGODB_URI
if (process.env.MONGODB_URI) {
    if (process.env.MONGODB_URI.includes('mongodb://') || process.env.MONGODB_URI.includes('mongodb+srv://')) {
        console.log(`   ✅ MONGODB_URI: Formato válido`);
    } else {
        console.log(`   ⚠️  MONGODB_URI: Formato suspeito`);
    }
}

// CLIENT_URL
if (process.env.CLIENT_URL) {
    if (process.env.NODE_ENV === 'production' && !process.env.CLIENT_URL.startsWith('https://')) {
        console.log(`   ⚠️  CLIENT_URL: Deve usar HTTPS em produção`);
    } else {
        console.log(`   ✅ CLIENT_URL: ${process.env.CLIENT_URL}`);
    }
}

// ADMIN_PASSWORD
if (process.env.ADMIN_PASSWORD) {
    if (process.env.ADMIN_PASSWORD.length >= 8) {
        console.log(`   ✅ ADMIN_PASSWORD: ${process.env.ADMIN_PASSWORD.length} caracteres (adequado)`);
    } else {
        console.log(`   ⚠️  ADMIN_PASSWORD: ${process.env.ADMIN_PASSWORD.length} caracteres (muito curto)`);
    }
}

// OPENAI_API_KEY
if (process.env.OPENAI_API_KEY) {
    if (process.env.OPENAI_API_KEY.startsWith('sk-')) {
        console.log(`   ✅ OPENAI_API_KEY: Formato válido`);
    } else {
        console.log(`   ⚠️  OPENAI_API_KEY: Formato suspeito`);
    }
}

// Resultado final
console.log('\n📊 RESULTADO:');
if (missingVars.length === 0) {
    console.log('✅ Todas as variáveis obrigatórias estão configuradas!');
    console.log('🚀 Sistema pronto para iniciar.');
} else {
    console.log(`❌ ${missingVars.length} problema(s) encontrado(s):`);
    missingVars.forEach(problem => {
        switch(problem) {
            case 'JWT_SECRET_LENGTH':
                console.log('   - JWT_SECRET deve ter pelo menos 32 caracteres');
                break;
            case 'JWT_REFRESH_SECRET_LENGTH':
                console.log('   - JWT_REFRESH_SECRET deve ter pelo menos 32 caracteres');
                break;
            case 'JWT_KEYS_SAME':
                console.log('   - JWT_SECRET e JWT_REFRESH_SECRET devem ser diferentes');
                break;
            default:
                console.log(`   - ${problem} não configurada`);
        }
    });
    console.log('\n💡 SOLUÇÕES:');
    console.log('1. Execute: npm run generate-secrets');
    console.log('2. Configure as variáveis no arquivo .env');
    console.log('3. Execute este script novamente');
    process.exit(1);
}

// Verificações específicas por ambiente
console.log('\n🌍 Verificações específicas por ambiente:');

if (process.env.NODE_ENV === 'production') {
    console.log('🔒 Verificações de PRODUÇÃO:');
    
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.includes('dev')) {
        console.log('   ⚠️  JWT_SECRET parece ser de desenvolvimento');
    }
    
    if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.includes('dev')) {
        console.log('   ⚠️  JWT_REFRESH_SECRET parece ser de desenvolvimento');
    }
    
    /*if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD === 'admin123456') {
        console.log('   ⚠️  ADMIN_PASSWORD parece ser padrão');
    }*/
    
    if (process.env.CLIENT_URL && !process.env.CLIENT_URL.startsWith('https://')) {
        console.log('   ⚠️  CLIENT_URL deve usar HTTPS em produção');
    }
    
    if (process.env.LOG_LEVEL === 'debug') {
        console.log('   ⚠️  LOG_LEVEL=debug pode ser muito verboso em produção');
    }
    
    console.log('   ✅ Verificações de produção concluídas');
}

if (process.env.NODE_ENV === 'development') {
    console.log('🛠️  Verificações de DESENVOLVIMENTO:');
    
    if (process.env.LOG_LEVEL !== 'debug') {
        console.log('   💡 Considere usar LOG_LEVEL=debug para desenvolvimento');
    }
    
    console.log('   ✅ Verificações de desenvolvimento concluídas');
}

console.log('\n🎯 PRÓXIMOS PASSOS:');
console.log('1. Se tudo estiver OK, execute: npm start');
console.log('2. Teste a API: curl http://localhost:5000/api/health');
console.log('3. Teste o frontend: open frontend-test.html');

console.log('\n📚 DOCUMENTAÇÃO:');
console.log('- Guia completo: GUIA_VARIAVEIS_AMBIENTE.md');
console.log('- Geração de chaves: npm run generate-secrets');
console.log('- Migração: npm run migrate'); 