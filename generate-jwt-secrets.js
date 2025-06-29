const crypto = require('crypto');

console.log('🔐 Gerador de Chaves JWT Seguras\n');

// Função para gerar chave segura
function generateSecureKey(length = 64) {
    return crypto.randomBytes(length).toString('base64');
}

// Função para gerar chave com caracteres especiais
function generateComplexKey(length = 64) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let result = '';
    
    for (let i = 0; i < length; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return result;
}

// Função para gerar chave baseada em timestamp + random
function generateTimestampKey() {
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(32).toString('hex');
    return crypto.createHash('sha256').update(timestamp + random).digest('base64');
}

console.log('📋 Gerando chaves JWT seguras...\n');

// Gerar diferentes tipos de chaves
const jwtSecret = generateSecureKey(64);
const jwtRefreshSecret = generateComplexKey(64);
const jwtSecretAlt = generateTimestampKey();

console.log('✅ Chaves geradas com sucesso!\n');

console.log('🔑 JWT_SECRET (64 caracteres base64):');
console.log(`JWT_SECRET=${jwtSecret}\n`);

console.log('🔄 JWT_REFRESH_SECRET (64 caracteres complexos):');
console.log(`JWT_REFRESH_SECRET=${jwtRefreshSecret}\n`);

console.log('🔐 JWT_SECRET Alternativo (baseado em timestamp):');
console.log(`JWT_SECRET=${jwtSecretAlt}\n`);

console.log('📝 Exemplo completo para .env:');
console.log('='.repeat(50));
console.log(`# JWT Configuration`);
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`JWT_REFRESH_SECRET=${jwtRefreshSecret}`);
console.log('='.repeat(50));

console.log('\n⚠️  IMPORTANTE:');
console.log('• Use chaves diferentes para cada ambiente');
console.log('• Nunca compartilhe ou versionize essas chaves');
console.log('• Mantenha as chaves em variáveis de ambiente');
console.log('• Troque as chaves regularmente em produção');

console.log('\n🔧 Como usar:');
console.log('1. Copie as chaves para seu arquivo .env');
console.log('2. Reinicie o servidor após alterar as chaves');
console.log('3. Todos os tokens existentes serão invalidados');

console.log('\n🧪 Para testar:');
console.log('1. Execute: node generate-jwt-secrets.js');
console.log('2. Copie as chaves para .env');
console.log('3. Teste com: node frontend-test.html');

// Verificar se as chaves são diferentes
if (jwtSecret === jwtRefreshSecret) {
    console.log('\n❌ ERRO: As chaves são iguais! Execute novamente.');
} else {
    console.log('\n✅ Chaves são diferentes - OK!');
}

// Verificar comprimento
console.log(`\n📏 Comprimento das chaves:`);
console.log(`JWT_SECRET: ${jwtSecret.length} caracteres`);
console.log(`JWT_REFRESH_SECRET: ${jwtRefreshSecret.length} caracteres`);

if (jwtSecret.length >= 32 && jwtRefreshSecret.length >= 32) {
    console.log('✅ Chaves têm comprimento adequado!');
} else {
    console.log('❌ Chaves muito curtas!');
} 