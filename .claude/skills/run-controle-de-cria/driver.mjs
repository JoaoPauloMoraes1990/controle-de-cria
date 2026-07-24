#!/usr/bin/env node
// REPL driver para dirigir o Controle de Cria num Chromium headless.
// Lê comandos de stdin, um por linha. Usado porque este ambiente não tem
// chromium-cli instalado — este script cobre o mesmo papel via Playwright
// puro (já vem como devDependency do projeto).
//
// Comandos:
//   nav <url>                    vai para a url (ex: http://localhost:5173/#/)
//   wait-for <selector>          espera um seletor aparecer (aceita "text=Foo")
//   click <selector>             clica
//   fill <selector> <valor>      preenche um campo
//   upload <selector> :: <path>  escolhe um arquivo num input[type=file]
//   press <tecla>                pressiona uma tecla (Enter, Tab, F, M, ...)
//   type <texto>                 digita texto via teclado
//   wait <ms>                    espera um tempo fixo
//   screenshot [nome]            salva screenshots/<nome-ou-numero>.png (só a área visível)
//   screenshot-full [nome]       igual, mas a página inteira (fullPage)
//   eval <js>                    roda JS na página e imprime o resultado
//   console --errors             imprime os erros de console acumulados
//   quit | exit                  fecha o navegador e sai

import { chromium } from 'playwright'
import readline from 'node:readline'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const skillDir = path.dirname(fileURLToPath(import.meta.url))
const screenshotsDir = path.join(skillDir, 'screenshots')
fs.mkdirSync(screenshotsDir, { recursive: true })

const consoleErrors = []

const browser = await chromium.launch()
const context = await browser.newContext()
const page = await context.newPage()
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text())
})
page.on('pageerror', (err) => consoleErrors.push(String(err)))

let screenshotCounter = 0

function dividirPrimeiroEspaco(texto) {
  const i = texto.indexOf(' ')
  if (i === -1) return [texto, '']
  return [texto.slice(0, i), texto.slice(i + 1)]
}

const rl = readline.createInterface({ input: process.stdin, terminal: false })

// readline dispara 'line' pra cada linha sem esperar o handler anterior
// terminar — sem essa fila, os comandos rodavam fora de ordem (ex.: "quit"
// fechando o navegador antes de um "screenshot" anterior terminar).
let filaDeComandos = Promise.resolve()
rl.on('line', (linhaBruta) => {
  filaDeComandos = filaDeComandos.then(() => processarLinha(linhaBruta))
})

async function processarLinha(linhaBruta) {
  const linha = linhaBruta.trim()
  if (!linha || linha.startsWith('#')) return
  const [cmd, resto] = dividirPrimeiroEspaco(linha)

  try {
    switch (cmd) {
      case 'nav':
        await page.goto(resto, { waitUntil: 'domcontentloaded' })
        console.log(`ok: nav ${resto}`)
        break

      case 'wait-for':
        await page.waitForSelector(resto, { timeout: 10000 })
        console.log(`ok: wait-for ${resto}`)
        break

      case 'click':
        await page.click(resto, { timeout: 10000 })
        console.log(`ok: click ${resto}`)
        break

      case 'fill': {
        // separador " :: " em vez do primeiro espaço, porque os seletores
        // deste app costumam ter espaço dentro (placeholder/texto em
        // português), ex.: fill input[placeholder="Buscar animal pelo número"] :: 45
        const partes = resto.split(' :: ')
        const seletor = partes[0]
        const valor = partes.slice(1).join(' :: ')
        await page.fill(seletor, valor)
        console.log(`ok: fill ${seletor}`)
        break
      }

      case 'upload': {
        // upload <selector> :: <caminho-do-arquivo> — mesmo separador do fill
        const partes = resto.split(' :: ')
        const seletor = partes[0]
        const caminho = partes.slice(1).join(' :: ')
        await page.setInputFiles(seletor, caminho)
        console.log(`ok: upload ${seletor} <- ${caminho}`)
        break
      }

      case 'press':
        await page.keyboard.press(resto)
        console.log(`ok: press ${resto}`)
        break

      case 'type':
        await page.keyboard.type(resto)
        console.log('ok: type')
        break

      case 'wait':
        await page.waitForTimeout(Number(resto) || 300)
        console.log(`ok: wait ${resto}`)
        break

      case 'screenshot': {
        screenshotCounter++
        const nome = resto || `shot-${screenshotCounter}`
        const arquivo = path.join(screenshotsDir, `${nome}.png`)
        await page.screenshot({ path: arquivo })
        console.log(`ok: screenshot ${arquivo}`)
        break
      }

      case 'screenshot-full': {
        screenshotCounter++
        const nome = resto || `shot-${screenshotCounter}`
        const arquivo = path.join(screenshotsDir, `${nome}.png`)
        await page.screenshot({ path: arquivo, fullPage: true })
        console.log(`ok: screenshot-full ${arquivo}`)
        break
      }

      case 'eval': {
        const resultado = await page.evaluate(resto)
        console.log(`ok: eval -> ${JSON.stringify(resultado)}`)
        break
      }

      case 'console':
        if (resto === '--errors') {
          console.log(`errors: ${JSON.stringify(consoleErrors)}`)
        }
        break

      case 'quit':
      case 'exit':
        await browser.close()
        process.exit(0)
        break

      default:
        console.log(`erro: comando desconhecido "${cmd}"`)
    }
  } catch (e) {
    console.log(`erro: ${e.message}`)
  }
}

rl.on('close', async () => {
  // stdin (ex.: um heredoc) pode fechar assim que termina de enviar as
  // linhas, antes da fila de comandos terminar de rodar — espera ela
  // esvaziar antes de fechar o navegador.
  await filaDeComandos
  if (browser.isConnected()) await browser.close()
  process.exit(0)
})
