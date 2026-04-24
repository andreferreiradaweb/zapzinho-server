import { describe, it, expect } from 'vitest'
import { extractMsgVar } from '@/use-cases/webhook/handle-incoming-message'

const CODE = 'whatsappnumber'

describe('extractMsgVar — formato CODE: VALUE', () => {
  it('extrai valor quando código está na primeira linha', () => {
    expect(extractMsgVar(`${CODE}: 85997139967`, CODE)).toBe('85997139967')
  })

  it('extrai valor quando código está em linha do meio', () => {
    const msg = `Olá, segue meu pedido:\n${CODE}: 85997139967\nObrigado`
    expect(extractMsgVar(msg, CODE)).toBe('85997139967')
  })

  it('extrai valor após URL com dois pontos', () => {
    const msg = `Minha escolha: https://lp.com/?name=Maria\n${CODE}: 85997139967`
    expect(extractMsgVar(msg, CODE)).toBe('85997139967')
  })

  it('ignora código no meio de uma linha (não no início)', () => {
    const msg = `texto ${CODE}: 85997139967`
    expect(extractMsgVar(msg, CODE)).toBeNull()
  })

  it('ignora dois-pontos de URL na mesma linha que o código', () => {
    // garrafa: https:// não deve dar match para código "garrafa"
    expect(extractMsgVar('garrafa: https://site.com', 'garrafa')).toBe('https://site.com')
    // mas "whatsappnumber" não está em "garrafa: ..."
    expect(extractMsgVar('garrafa: https://site.com', CODE)).toBeNull()
  })

  it('é case-insensitive', () => {
    expect(extractMsgVar(`WHATSAPPNUMBER: 85997139967`, CODE)).toBe('85997139967')
    expect(extractMsgVar(`WhatsAppNumber: 85997139967`, CODE)).toBe('85997139967')
  })

  it('remove espaços extras ao redor do valor (trim)', () => {
    expect(extractMsgVar(`${CODE}:   85997139967  `, CODE)).toBe('85997139967')
  })

  it('retorna null quando mensagem está vazia', () => {
    expect(extractMsgVar('', CODE)).toBeNull()
  })

  it('retorna null quando código está vazio', () => {
    expect(extractMsgVar(`${CODE}: 85997139967`, '')).toBeNull()
  })

  it('retorna null quando código não está na mensagem', () => {
    expect(extractMsgVar('customername: Maria', CODE)).toBeNull()
  })
})

describe('extractMsgVar — formato CODE=VALUE', () => {
  it('extrai valor quando código é único na mensagem', () => {
    expect(extractMsgVar(`${CODE}=85997139967`, CODE)).toBe('85997139967')
  })

  it('extrai valor quando está em query string de URL', () => {
    const msg = `https://lp.com/?name=Maria&${CODE}=85997139967&font=Arial`
    expect(extractMsgVar(msg, CODE)).toBe('85997139967')
  })

  it('extrai valor quando está separado por espaço', () => {
    const msg = `customername=André ${CODE}=85997139967`
    expect(extractMsgVar(msg, CODE)).toBe('85997139967')
  })

  it('extrai valor quando está separado por & sem URL', () => {
    const msg = `customername=André&${CODE}=85997139967`
    expect(extractMsgVar(msg, CODE)).toBe('85997139967')
  })

  it('decodifica %2B como +', () => {
    expect(extractMsgVar(`${CODE}=85997%2B139967`, CODE)).toBe('85997+139967')
  })

  it('decodifica + como espaço', () => {
    expect(extractMsgVar(`customername=André+Ferreira`, 'customername')).toBe('André Ferreira')
  })

  it('não captura código que é sufixo de outro código', () => {
    // "mynumber=123" não deve dar match para código "number"
    expect(extractMsgVar('mynumber=123', 'number')).toBeNull()
  })

  it('retorna null quando código não está na mensagem', () => {
    expect(extractMsgVar('customername=Maria', CODE)).toBeNull()
  })
})

describe('extractMsgVar — mensagem real do ShareButton', () => {
  it('extrai ambas as variáveis de uma mensagem completa', () => {
    const msg = [
      'Já escolhi a personalização da minha garrafa: https://gravacao-lazer-terzon.vercel.app/?font=Stephenson+Brandon&iconsize=40&namesize=20&name=Maria&icon=9',
      'customername: Mariá da dores',
      'whatsappnumber: 85999000099',
    ].join('\n')

    expect(extractMsgVar(msg, 'customername')).toBe('Mariá da dores')
    expect(extractMsgVar(msg, 'whatsappnumber')).toBe('85999000099')
  })

  it('extrai de mensagem manual com =', () => {
    const msg = 'customername=André Ferreira whatsappnumber=85997139967'
    expect(extractMsgVar(msg, 'customername')).toBe('André')
    expect(extractMsgVar(msg, 'whatsappnumber')).toBe('85997139967')
  })
})
