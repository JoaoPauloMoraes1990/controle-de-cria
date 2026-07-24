import { useState } from 'react'
import { Cartao } from './Cartao'

export function AjudaComportamentoDespesa() {
  const [aberto, setAberto] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setAberto((atual) => !atual)}
        className="text-base font-semibold text-marrom underline"
      >
        {aberto ? 'Fechar explicação' : 'Custeio, estrutura ou investimento? O que escolher'}
      </button>

      {aberto && (
        <Cartao className="mt-3 flex flex-col gap-4">
          <div>
            <p className="text-lg font-bold text-marrom-escuro">Custeio</p>
            <p className="mt-1 text-base">
              Gasto do dia a dia, que se consome e acaba. Se parar de comprar, a fazenda para de
              funcionar direito.
            </p>
            <p className="mt-1 text-base text-texto-suave">
              Exemplos: sal mineral, ração, vacina, remédio, diária de vaqueiro, combustível do
              trator no trabalho de rotina.
            </p>
          </div>

          <div>
            <p className="text-lg font-bold text-marrom-escuro">Estrutura</p>
            <p className="mt-1 text-base">
              Consertar o que já existe na fazenda. Não é coisa nova, é manter o que já tem
              funcionando.
            </p>
            <p className="mt-1 text-base text-texto-suave">
              Exemplos: consertar cerca velha, arrumar bebedouro quebrado, manutenção do trator,
              reparo no curral.
            </p>
          </div>

          <div>
            <p className="text-lg font-bold text-marrom-escuro">Investimento</p>
            <p className="mt-1 text-base">
              Coisa nova, que vai durar muitos anos e aumenta o valor da fazenda.
            </p>
            <p className="mt-1 text-base text-texto-suave">
              Exemplos: formar um pasto novo, cerca nova (onde não tinha cerca), reforma pesada de
              um pasto ruim, comprar uma máquina.
            </p>
          </div>

          <div className="border-t border-borda pt-3">
            <p className="text-base font-semibold text-marrom-escuro">Na dúvida, pergunte:</p>
            <p className="mt-1 text-base">
              Se eu não comprar isso de novo ano que vem, a fazenda para? → <b>Custeio</b>.
              <br />
              Só estou consertando o que já tinha? → <b>Estrutura</b>.
              <br />
              É uma coisa nova que vai ficar valendo por anos? → <b>Investimento</b>.
            </p>
          </div>
        </Cartao>
      )}
    </div>
  )
}
