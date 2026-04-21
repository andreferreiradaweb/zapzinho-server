import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('🗑  Limpando dados de prospecção...')

  const broadcasts = await prisma.prospectingBroadcast.deleteMany()
  console.log(`  ✓ ProspectingBroadcast: ${broadcasts.count} registros removidos`)

  const contacts = await prisma.importedContact.deleteMany()
  console.log(`  ✓ ImportedContact:      ${contacts.count} registros removidos`)

  const lists = await prisma.contactList.deleteMany()
  console.log(`  ✓ ContactList:          ${lists.count} registros removidos`)

  const logs = await prisma.messageLog.deleteMany({
    where: { type: 'BROADCAST', leadId: null },
  })
  console.log(`  ✓ MessageLog (prospect):${logs.count} registros removidos`)

  console.log('\n✅ Banco limpo. Pronto para novos testes.')
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
