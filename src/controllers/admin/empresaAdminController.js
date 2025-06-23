const Empresa = require('../../models/Empresa');
const Usuario = require('../../models/Usuario');
const Agente = require('../../models/Agente');
const ResponseHelper = require('../../utils/responseHelper');
const logger = require('../../utils/logger');
const { AppError } = require('../../utils/errorHandler');

class EmpresaAdminController {
    async listarEmpresas(req, res, next) {
        try{
            const { page = 1, limit = 10, search = '', status = '' } = req.query;
            const skip = (page - 1) * limit;

            const filters = {};
            if(search){
                filters.$or = [
                    { nome: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { cnpj: { $regex: search, $options: 'i' } }
                ];
            }
            
            if(status) filters.status = status;

            const [empresas, total] = await Promise.all([
                Empresa.find(filters)
                .sort({ criado_em: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
                Empresa.countDocuments(filters)
            ]);

            const empresasComStats = await Promise.all(
                empresas.map(async (empresa) => {
                    const [totalUsuarios, totalAgentes] = await Promise.all([
                        Usuario.countDocuments({ empresa_id: empresa._id }),
                        Agente.countDocuments({ empresa_id: empresa._id })
                    ]);

                    return {
                        ...empresa,
                        estatisticas: {
                        total_usuarios: totalUsuarios,
                        total_agentes: totalAgentes,
                        agentes_restantes: empresa.limite_agentes - totalAgentes
                        }
                    };
                })
            );

            return ResponseHelper.paginated(
                res,
                empresasComStats,
                total,
                parseInt(page),
                Math.ceil(total / limit),
                parseInt(limit)
            );
        } catch (error) {
            logger.error(`Erro ao listar empresas: ${error.message}`);
            return next(new AppError('Erro ao listar empresas', 500));
        }
    }

    async obterEmpresa(req, res, next) {
        try {
            const { id } = req.params;
            const empresa = await Empresa.findById(id).lean();

            if(!empresa) throw new AppError('Empresa não encontrada', 404);

            const [totalUsuarios, totalAgentes, usuarios, agentes] = await Promise.all([
                Usuario.countDocuments({ empresa_id: id }),
                Agente.countDocuments({ empresa_id: id }),
                Usuario.find({ empresa_id: id }).select('nome email papel status ultimo_acesso').lean(),
                Agente.find({ empresa_id: id }).select('nome status criado_em').lean()
            ]);

            const empresaCompleta = {
                ...empresa,
                estatisticas: {
                    total_usuarios: totalUsuarios,
                    total_agentes: totalAgentes,
                    agentes_restantes: empresa.limite_agentes - totalAgentes
                },
                usuarios,
                agentes
            };

            return ResponseHelper.success(res, empresaCompleta);
        } catch (error) {
            logger.error(`Erro ao obter empresa: ${error.message}`);
            return next(error);
        }
    }


    async criarEmpresa(req, res, next){
        try{
            const { nome, cnpj, email, telefone, limite_agente, observacoes } = req.body;

            const [emailExistente, cnpjExistente] = await Promise.all([
                Empresa.findOne({ email }),
                cnpj ? Empresa.findOne({ cnpj }) : Promise.resolve(null)
            ]);

            if(emailExistente) throw new AppError('Email já está em uso', 409);
            if(cnpjExistente) throw new AppError('CNPJ já está em uso', 409);

            const novaEmpresa = new Empresa ({
                nome,
                cnpj,
                email,
                telefone,
                limite_agentes,
                observacoes
            });

            await novaEmpresa.save();
            logger.info(`Empresa criada: ${novaEmpresa._id}`);

            return ResponseHelper.success(res, novaEmpresa, 'Empresa criada com sucesso', 201);
        } catch (error) {
            logger.error(`Erro ao criar empresa: ${error.message}`);
            return next(error);
        }
    }

    async atualizarEmpresa(req, res, next) {
        try{
            const { id } = req.params;
            const { nome, cnpj, email, telefone, limite_agentes, observacoes, status } = req.body;

            const empresa = await Empresa.findById(id);
            if(!empresa) throw new AppError('Empresa não encontrada', 404);

            if (email && email !== empresa.email) {
            const emailExistente = await Empresa.findOne({ email, _id: { $ne: id } });
            if (emailExistente) throw new AppError('Email já está em uso', 409);
            }

            if (cnpj && cnpj !== empresa.cnpj) {
                const cnpjExistente = await Empresa.findOne({ cnpj, _id: { $ne: id } });
                if(cnpjExistente) throw new AppError('CNPJ já está em uso', 409);
            }

            if(limite_agentes && limite_agentes < empresa.limite_agentes) {
                const totalAgentes = await Agente.countDocuments({ empresa_id: id, status: true });
                if(limite_agentes < totalAgentes) {
                    throw new AppError(
                        `Não é possivel reduzir o limite para ${limite_agentes}. A empresa possui ${totalAgentes} agentes ativos`, 400
                    );
                }
            }

            const dadosAtualizacao = {
                nome,
                cnpj,
                email,
                telefone,
                limite_agentes,
                observacoes
            };

            if (req.user.papel === 'admin_master' && status){
                dadosAtualizacao.status = status;
            }

            const empresaAtualizada = await Empresa.findByIdAndUpdate(id, dadosAtualizacao, {
                new: true,
                runValidators: true
            });

            return ResponseHelper.success(res, empresaAtualizada, 'Empresa atualizada com sucesso');

        } catch(error) {
            logger.error(`Erro ao atualizar empresa: ${error.message}`);
            return next(error);
        }
    }

    async deletarEmpresa(req, res, next) {
        try{
            const { id } = req.params;

            const empresa = await Empresa.findById(id);
            if(!empresa) throw new AppError('Empresa não encontrada', 404);

            const [totalUsuarios, totalAgentes] = await Promise.all([
                Usuario.countDocuments({ empresa_id: id }),
                Agente.countDocuments({ empresa_id: id })
            ]);

            if (totalUsuarios > 0) throw new AppError('Não é possível deletar empresa com usuários vinculados', 400);
            if (totalAgentes > 0) throw new AppError('Não é possível deletar empresa com agentes vinculados', 400);
            
            await Empresa.findByIdAndDelete(id);
            logger.info(`Empresa deletada: ${id}`);

            return ResponseHelper.success(res, null, 'Emppresa deletada com sucesso');
        } catch(error) {
            logger.error(`Erro ao deletar empresa: ${error.message}`);
            return next(error);
        }
    }
}

module.exports = new EmpresaAdminController();