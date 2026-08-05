import { HashRouter, Route, Routes } from 'react-router-dom'
import { TelaInicial } from './paginas/TelaInicial'
import { Nascimento } from './paginas/Nascimento'
import { Pesagem } from './paginas/Pesagem'
import { Venda } from './paginas/Venda'
import { Morte } from './paginas/Morte'
import { CadastrarAnimal } from './paginas/CadastrarAnimal'
import { FichaAnimal } from './paginas/FichaAnimal'
import { Backup } from './paginas/Backup'
import { CadastroInicial } from './paginas/cadastroInicial/CadastroInicial'
import { PainelNumeros } from './paginas/PainelNumeros'
import { ListaDescarte } from './paginas/ListaDescarte'
import { NumerosDetalhado } from './paginas/NumerosDetalhado'
import { LancarDespesa } from './paginas/LancarDespesa'
import { ItensDespesa } from './paginas/ItensDespesa'
import { NumerosFinanceiros } from './paginas/NumerosFinanceiros'
import { ImportarDespesas } from './paginas/ImportarDespesas'

export function Rotas() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<TelaInicial />} />
        <Route path="/nascimento" element={<Nascimento />} />
        <Route path="/pesagem" element={<Pesagem />} />
        <Route path="/venda" element={<Venda />} />
        <Route path="/morte" element={<Morte />} />
        <Route path="/animais/novo" element={<CadastrarAnimal />} />
        <Route path="/animais/:id" element={<FichaAnimal />} />
        <Route path="/backup" element={<Backup />} />
        <Route path="/cadastro-inicial" element={<CadastroInicial />} />
        <Route path="/numeros" element={<PainelNumeros />} />
        <Route path="/descarte" element={<ListaDescarte />} />
        <Route path="/numeros/detalhado" element={<NumerosDetalhado />} />
        <Route path="/financeiro" element={<LancarDespesa />} />
        <Route path="/financeiro/itens" element={<ItensDespesa />} />
        <Route path="/financeiro/numeros" element={<NumerosFinanceiros />} />
        <Route path="/financeiro/importar" element={<ImportarDespesas />} />
      </Routes>
    </HashRouter>
  )
}
