import { describe, it, expect } from 'vitest'
import { extractMsgVar } from '@/use-cases/webhook/handle-incoming-message'

const CODE = 'whatsappnumber'

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

  it('extrai valor quando está separado por &', () => {
    const msg = `customername=André&${CODE}=85997139967`
    expect(extractMsgVar(msg, CODE)).toBe('85997139967')
  })

  it('extrai valor quando está no início da mensagem', () => {
    expect(extractMsgVar(`${CODE}=85997139967 customername=André`, CODE)).toBe('85997139967')
  })

  it('decodifica %2B como +', () => {
    expect(extractMsgVar(`${CODE}=85997%2B139967`, CODE)).toBe('85997+139967')
  })

  it('decodifica + como espaço', () => {
    expect(extractMsgVar('customername=André+Ferreira', 'customername')).toBe('André Ferreira')
  })

  it('não captura código que é sufixo de outro código', () => {
    expect(extractMsgVar('mynumber=123', 'number')).toBeNull()
  })

  it('retorna null quando código não está na mensagem', () => {
    expect(extractMsgVar('customername=Maria', CODE)).toBeNull()
  })

  it('retorna null quando mensagem está vazia', () => {
    expect(extractMsgVar('', CODE)).toBeNull()
  })

  it('retorna null quando código está vazio', () => {
    expect(extractMsgVar(`${CODE}=85997139967`, '')).toBeNull()
  })

  it('é case-insensitive', () => {
    expect(extractMsgVar(`WHATSAPPNUMBER=85997139967`, CODE)).toBe('85997139967')
  })
})

describe('extractMsgVar — formato CODE: VALUE não é mais suportado', () => {
  it('não captura formato colon', () => {
    expect(extractMsgVar(`${CODE}: 85997139967`, CODE)).toBeNull()
    expect(extractMsgVar(`customername: jose`, 'customername')).toBeNull()
  })
})

describe('extractMsgVar — mensagem real do ShareButton', () => {
  it('extrai ambas as variáveis da mensagem gerada pelo ShareButton', () => {
    const msg = 'Já escolhi a personalização da minha garrafa: https://gravacao-lazer-terzon.vercel.app/?font=Stephenson+Brandon&iconsize=40&namesize=20&name=Maria&icon=9 customername=Mariá+da+dores whatsappnumber=85999000099'

    expect(extractMsgVar(msg, 'customername')).toBe('Mariá da dores')
    expect(extractMsgVar(msg, 'whatsappnumber')).toBe('85999000099')
  })

  it('extrai de mensagem manual simples', () => {
    const msg = 'customername=André+Ferreira whatsappnumber=85997139967'
    expect(extractMsgVar(msg, 'customername')).toBe('André Ferreira')
    expect(extractMsgVar(msg, 'whatsappnumber')).toBe('85997139967')
  })
})
