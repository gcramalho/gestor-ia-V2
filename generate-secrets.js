const crypto = require('crypto');

console.log('🔐 Gerador de Chaves Secretas\n');

// Gerar JWT Secret
const jwtSecret = crypto.randomBytes(64).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');

console.log('✅ Chaves geradas com sucesso!\n');

console.log('📋 Adicione estas chaves ao seu arquivo .env:\n');

console.log('JWT_SECRET=' + jwtSecret);
console.log('JWT_REFRESH_SECRET=' + jwtRefreshSecret);

console.log('\n📝 Instruções:');
console.log('1. Copie as chaves acima');
console.log('2. Cole no seu arquivo .env');
console.log('3. Nunca compartilhe essas chaves');
console.log('4. Use chaves diferentes para cada ambiente (dev, prod, test)');

console.log('\n🔒 Segurança:');
console.log('- As chaves têm 128 caracteres (64 bytes em hex)');
console.log('- São criptograficamente seguras');
console.log('- Únicas para cada execução');

console.log('\n⚠️  IMPORTANTE:');
console.log('- Mantenha essas chaves em segredo');
console.log('- Não commite o arquivo .env no git');
console.log('- Use variáveis de ambiente em produção'); 