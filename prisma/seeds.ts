import { env } from '@/config/validatedEnv'
import { prisma, Role, CustomerType, LeadStatus } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid'

async function seed() {
  const adminHash = await bcrypt.hash(env.PASSWORD_ADMIN, 6)
  const clientHash = await bcrypt.hash('312978', 6)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@zapzinho.com' },
    update: {},
    create: {
      email: 'admin@zapzinho.com',
      Role: Role.ADMIN,
      CustomerType: CustomerType.B2C,
      passwordHash: adminHash,
      isActive: true,
    },
  })

  const client = await prisma.user.upsert({
    where: { email: 'cliente@zapzinho.com' },
    update: {},
    create: {
      email: 'cliente@zapzinho.com',
      Role: Role.CLIENT,
      CustomerType: CustomerType.B2C,
      passwordHash: clientHash,
      isActive: true,
    },
  })

  // Categories
  const categoryVeiculos = await prisma.productCategory.upsert({
    where: { id: 'seed-cat-veiculos' },
    update: {},
    create: { id: 'seed-cat-veiculos', name: 'Veículos', userId: client.id },
  })

  const categoryEletronicos = await prisma.productCategory.upsert({
    where: { id: 'seed-cat-eletronicos' },
    update: {},
    create: { id: 'seed-cat-eletronicos', name: 'Eletrônicos', userId: client.id },
  })

  const categoryImoveis = await prisma.productCategory.upsert({
    where: { id: 'seed-cat-imoveis' },
    update: {},
    create: { id: 'seed-cat-imoveis', name: 'Imóveis', userId: client.id },
  })

  // Products
  const prodHb20 = await prisma.product.upsert({
    where: { id: 'seed-prod-hb20' },
    update: {},
    create: {
      id: 'seed-prod-hb20',
      title: 'HB20 2022',
      description: 'Sedan completo, 1.0 turbo',
      code: 'VEI-001',
      price: '7500000',
      condition: 'SEMINOVO',
      photos: [],
      userId: client.id,
      categoryId: categoryVeiculos.id,
    },
  })

  const prodOnix = await prisma.product.upsert({
    where: { id: 'seed-prod-onix' },
    update: {},
    create: {
      id: 'seed-prod-onix',
      title: 'Onix Plus 2023',
      description: 'Automático, completo',
      code: 'VEI-002',
      price: '8900000',
      condition: 'NOVO',
      photos: [],
      userId: client.id,
      categoryId: categoryVeiculos.id,
    },
  })

  const prodIphone = await prisma.product.upsert({
    where: { id: 'seed-prod-iphone' },
    update: {},
    create: {
      id: 'seed-prod-iphone',
      title: 'iPhone 14 Pro 256GB',
      description: 'Lacrado, nota fiscal',
      code: 'ELE-001',
      price: '550000',
      condition: 'NOVO',
      photos: [],
      userId: client.id,
      categoryId: categoryEletronicos.id,
    },
  })

  const prodApto = await prisma.product.upsert({
    where: { id: 'seed-prod-apto' },
    update: {},
    create: {
      id: 'seed-prod-apto',
      title: 'Apartamento 2 quartos - Centro',
      description: '65m², varanda, vaga coberta',
      code: 'IMO-001',
      price: '32000000',
      condition: 'EM BOAS CONDIÇÕES',
      photos: [],
      userId: client.id,
      categoryId: categoryImoveis.id,
    },
  })

  void admin

  const now = new Date()
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000)
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000)

  const leads = [
    // HB20 - vários status
    { nome: 'Ana Silva', telefone: '5511900000001', status: LeadStatus.NOVO_INTERESSE, product: prodHb20, lastMsg: hoursAgo(1), lastBroadcast: null },
    { nome: 'Bruno Costa', telefone: '5511900000002', status: LeadStatus.CONTATO_FEITO, product: prodHb20, lastMsg: hoursAgo(3), lastBroadcast: daysAgo(2) },
    { nome: 'Carla Mendes', telefone: '5511900000003', status: LeadStatus.NEGOCIACAO, product: prodHb20, lastMsg: hoursAgo(6), lastBroadcast: daysAgo(5) },
    { nome: 'Diego Rocha', telefone: '5511900000004', status: LeadStatus.VENDIDO, product: prodHb20, lastMsg: daysAgo(1), lastBroadcast: daysAgo(7) },
    { nome: 'Eduarda Lima', telefone: '5511900000005', status: LeadStatus.NAO_INTERESSADO, product: prodHb20, lastMsg: daysAgo(3), lastBroadcast: daysAgo(10) },
    { nome: 'Felipe Santos', telefone: '5511900000006', status: LeadStatus.NOVO_INTERESSE, product: prodHb20, lastMsg: hoursAgo(2), lastBroadcast: null },
    { nome: 'Gabriela Nunes', telefone: '5511900000007', status: LeadStatus.CONTATO_FEITO, product: prodHb20, lastMsg: daysAgo(2), lastBroadcast: daysAgo(3) },
    { nome: 'Henrique Alves', telefone: '5511900000008', status: LeadStatus.NEGOCIACAO, product: prodHb20, lastMsg: daysAgo(5), lastBroadcast: daysAgo(14) },
    { nome: 'Isabela Ferreira', telefone: '5511900000009', status: LeadStatus.NOVO_INTERESSE, product: prodHb20, lastMsg: hoursAgo(8), lastBroadcast: null },
    { nome: 'João Pereira', telefone: '5511900000010', status: LeadStatus.CONTATO_FEITO, product: prodHb20, lastMsg: daysAgo(7), lastBroadcast: daysAgo(30) },

    // Onix - vários status
    { nome: 'Karen Souza', telefone: '5511900000011', status: LeadStatus.NOVO_INTERESSE, product: prodOnix, lastMsg: hoursAgo(1), lastBroadcast: null },
    { nome: 'Lucas Oliveira', telefone: '5511900000012', status: LeadStatus.NEGOCIACAO, product: prodOnix, lastMsg: hoursAgo(4), lastBroadcast: daysAgo(1) },
    { nome: 'Marina Torres', telefone: '5511900000013', status: LeadStatus.VENDIDO, product: prodOnix, lastMsg: daysAgo(2), lastBroadcast: daysAgo(6) },
    { nome: 'Nicolas Barbosa', telefone: '5511900000014', status: LeadStatus.CONTATO_FEITO, product: prodOnix, lastMsg: daysAgo(4), lastBroadcast: daysAgo(8) },
    { nome: 'Olivia Castro', telefone: '5511900000015', status: LeadStatus.NAO_INTERESSADO, product: prodOnix, lastMsg: daysAgo(10), lastBroadcast: daysAgo(12) },
    { nome: 'Pedro Moreira', telefone: '5511900000016', status: LeadStatus.NOVO_INTERESSE, product: prodOnix, lastMsg: hoursAgo(2), lastBroadcast: null },
    { nome: 'Queila Ribeiro', telefone: '5511900000017', status: LeadStatus.CONTATO_FEITO, product: prodOnix, lastMsg: daysAgo(1), lastBroadcast: daysAgo(4) },
    { nome: 'Rafael Dias', telefone: '5511900000018', status: LeadStatus.NEGOCIACAO, product: prodOnix, lastMsg: hoursAgo(12), lastBroadcast: daysAgo(2) },
    { nome: 'Sabrina Cardoso', telefone: '5511900000019', status: LeadStatus.NOVO_INTERESSE, product: prodOnix, lastMsg: hoursAgo(5), lastBroadcast: null },
    { nome: 'Thiago Correia', telefone: '5511900000020', status: LeadStatus.VENDIDO, product: prodOnix, lastMsg: daysAgo(3), lastBroadcast: daysAgo(20) },

    // iPhone
    { nome: 'Ursula Melo', telefone: '5511900000021', status: LeadStatus.NOVO_INTERESSE, product: prodIphone, lastMsg: hoursAgo(1), lastBroadcast: null },
    { nome: 'Vitor Lopes', telefone: '5511900000022', status: LeadStatus.CONTATO_FEITO, product: prodIphone, lastMsg: hoursAgo(6), lastBroadcast: daysAgo(1) },
    { nome: 'Wanda Pinto', telefone: '5511900000023', status: LeadStatus.NEGOCIACAO, product: prodIphone, lastMsg: daysAgo(1), lastBroadcast: daysAgo(3) },
    { nome: 'Xavier Gomes', telefone: '5511900000024', status: LeadStatus.NAO_INTERESSADO, product: prodIphone, lastMsg: daysAgo(5), lastBroadcast: daysAgo(7) },
    { nome: 'Yasmin Freitas', telefone: '5511900000025', status: LeadStatus.VENDIDO, product: prodIphone, lastMsg: daysAgo(2), lastBroadcast: daysAgo(9) },
    { nome: 'Zeca Monteiro', telefone: '5511900000026', status: LeadStatus.NOVO_INTERESSE, product: prodIphone, lastMsg: hoursAgo(3), lastBroadcast: null },
    { nome: 'Alice Duarte', telefone: '5511900000027', status: LeadStatus.CONTATO_FEITO, product: prodIphone, lastMsg: daysAgo(6), lastBroadcast: daysAgo(15) },
    { nome: 'Bernardo Assis', telefone: '5511900000028', status: LeadStatus.NEGOCIACAO, product: prodIphone, lastMsg: hoursAgo(8), lastBroadcast: daysAgo(2) },
    { nome: 'Camila Fonseca', telefone: '5511900000029', status: LeadStatus.NOVO_INTERESSE, product: prodIphone, lastMsg: hoursAgo(2), lastBroadcast: null },
    { nome: 'Danilo Teixeira', telefone: '5511900000030', status: LeadStatus.CONTATO_FEITO, product: prodIphone, lastMsg: daysAgo(8), lastBroadcast: daysAgo(25) },

    // Apartamento
    { nome: 'Elisa Vargas', telefone: '5511900000031', status: LeadStatus.NOVO_INTERESSE, product: prodApto, lastMsg: hoursAgo(1), lastBroadcast: null },
    { nome: 'Fábio Cunha', telefone: '5511900000032', status: LeadStatus.CONTATO_FEITO, product: prodApto, lastMsg: daysAgo(1), lastBroadcast: daysAgo(3) },
    { nome: 'Giovana Macedo', telefone: '5511900000033', status: LeadStatus.NEGOCIACAO, product: prodApto, lastMsg: daysAgo(2), lastBroadcast: daysAgo(6) },
    { nome: 'Heitor Carvalho', telefone: '5511900000034', status: LeadStatus.VENDIDO, product: prodApto, lastMsg: daysAgo(4), lastBroadcast: daysAgo(10) },
    { nome: 'Ingrid Nascimento', telefone: '5511900000035', status: LeadStatus.NAO_INTERESSADO, product: prodApto, lastMsg: daysAgo(12), lastBroadcast: daysAgo(14) },
    { nome: 'Jonas Rezende', telefone: '5511900000036', status: LeadStatus.NOVO_INTERESSE, product: prodApto, lastMsg: hoursAgo(4), lastBroadcast: null },
    { nome: 'Larissa Borges', telefone: '5511900000037', status: LeadStatus.CONTATO_FEITO, product: prodApto, lastMsg: daysAgo(3), lastBroadcast: daysAgo(5) },
    { nome: 'Marcos Peixoto', telefone: '5511900000038', status: LeadStatus.NEGOCIACAO, product: prodApto, lastMsg: daysAgo(1), lastBroadcast: daysAgo(2) },
    { nome: 'Natália Braga', telefone: '5511900000039', status: LeadStatus.NOVO_INTERESSE, product: prodApto, lastMsg: hoursAgo(7), lastBroadcast: null },
    { nome: 'Oscar Tavares', telefone: '5511900000040', status: LeadStatus.CONTATO_FEITO, product: prodApto, lastMsg: daysAgo(9), lastBroadcast: daysAgo(20) },

    // Sem produto (leads avulsos)
    { nome: 'Paula Siqueira', telefone: '5511900000041', status: LeadStatus.NOVO_INTERESSE, product: null, lastMsg: hoursAgo(2), lastBroadcast: null },
    { nome: 'Quintino Araújo', telefone: '5511900000042', status: LeadStatus.CONTATO_FEITO, product: null, lastMsg: daysAgo(1), lastBroadcast: daysAgo(4) },
    { nome: 'Renata Vieira', telefone: '5511900000043', status: LeadStatus.NEGOCIACAO, product: null, lastMsg: daysAgo(3), lastBroadcast: daysAgo(7) },
    { nome: 'Samuel Esteves', telefone: '5511900000044', status: LeadStatus.NAO_INTERESSADO, product: null, lastMsg: daysAgo(6), lastBroadcast: daysAgo(8) },
    { nome: 'Tatiane Brito', telefone: '5511900000045', status: LeadStatus.NOVO_INTERESSE, product: null, lastMsg: hoursAgo(1), lastBroadcast: null },
    { nome: 'Ulisses Campos', telefone: '5511900000046', status: LeadStatus.CONTATO_FEITO, product: null, lastMsg: hoursAgo(5), lastBroadcast: daysAgo(1) },
    { nome: 'Vera Pacheco', telefone: '5511900000047', status: LeadStatus.NOVO_INTERESSE, product: null, lastMsg: daysAgo(2), lastBroadcast: null },
    { nome: 'William Amaral', telefone: '5511900000048', status: LeadStatus.NEGOCIACAO, product: null, lastMsg: daysAgo(4), lastBroadcast: daysAgo(3) },
    { nome: 'Ximena Lacerda', telefone: '5511900000049', status: LeadStatus.VENDIDO, product: null, lastMsg: daysAgo(7), lastBroadcast: daysAgo(12) },
    { nome: 'Yara Magalhães', telefone: '5511900000050', status: LeadStatus.NAO_INTERESSADO, product: null, lastMsg: daysAgo(15), lastBroadcast: daysAgo(30) },
  ]

  for (const lead of leads) {
    const phone = lead.telefone
    const existing = await prisma.lead.findFirst({
      where: { userId: client.id, telefone: phone },
    })
    if (existing) continue

    await prisma.lead.create({
      data: {
        id: uuid(),
        nome: lead.nome,
        telefone: phone,
        email: `${phone}@teste.com`,
        message: 'Lead criado via seed para testes',
        Status: lead.status,
        userId: client.id,
        productId: lead.product?.id ?? null,
        lastClientMessageAt: lead.lastMsg,
        lastBroadcastAt: lead.lastBroadcast,
        createdAt: daysAgo(Math.floor(Math.random() * 60)),
      },
    })
  }

  console.log('Seeds criadas com sucesso! 50 leads inseridos.')
}

seed()
  .catch((error) => {
    console.error(error)
  })
  .finally(() => {
    prisma.$disconnect()
  })
