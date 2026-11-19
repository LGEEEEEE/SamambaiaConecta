import { useState } from 'react';
import { Send, CheckCircle2, ArrowLeft } from 'lucide-react';

const GOOGLE_FORM_ACTION =
  'https://docs.google.com/forms/d/e/1FAIpQLSf1ldTm6apgyvcz039MEzT8TV4Q4rckpN_bsQUyDUOZXS6yLA/formResponse';

const ENTRY_IDS = {
  vinculo: 'entry.1478302439',
  acesso: 'entry.513059349',
  facilidade: 'entry.2020407666',
  geolocalizacao: 'entry.1651805134',
  utilidade: 'entry.1892735785',
  sugestao: 'entry.1671435767',
};

export default function FormularioAvaliacao({ onVoltar }) {
  const [respostas, setRespostas] = useState({
    vinculo: '',
    acesso: '',
    facilidade: '5',
    geolocalizacao: '',
    utilidade: '',
    sugestao: '',
  });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    const formData = new URLSearchParams();
    formData.append(ENTRY_IDS.vinculo, respostas.vinculo);
    formData.append(ENTRY_IDS.acesso, respostas.acesso);
    formData.append(ENTRY_IDS.facilidade, respostas.facilidade);
    formData.append(ENTRY_IDS.geolocalizacao, respostas.geolocalizacao);
    formData.append(ENTRY_IDS.utilidade, respostas.utilidade);
    if (respostas.sugestao.trim()) {
      formData.append(ENTRY_IDS.sugestao, respostas.sugestao.trim());
    }

    try {
      await fetch(GOOGLE_FORM_ACTION, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
      setEnviado(true);
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div className="row justify-content-center py-4">
        <div className="col-lg-6">
          <div className="card bg-body-tertiary border-success-subtle text-center p-4">
            <CheckCircle2 size={44} className="text-success mx-auto mb-3" />
            <h5 className="fw-bold mb-2">Avaliação registrada!</h5>
            <p className="small text-secondary mb-4">
              Obrigado por participar da pesquisa do Samambaia Conecta.
            </p>
            <button onClick={onVoltar} className="btn btn-primary btn-sm px-4 mx-auto">
              Voltar para o Radar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-7">
        <div className="card bg-body-tertiary border-secondary-subtle">
          <div className="card-header bg-black border-bottom border-secondary-subtle d-flex justify-content-between align-items-center">
            <span className="fw-semibold">Avaliação do Portal Comunitário</span>
            <button
              type="button"
              onClick={onVoltar}
              className="btn btn-outline-secondary btn-sm py-0 px-2 d-flex align-items-center gap-1"
            >
              <ArrowLeft size={13} /> Voltar
            </button>
          </div>

          <form className="card-body d-flex flex-column gap-3" onSubmit={handleSubmit}>
            <div>
              <label className="form-label small text-secondary">
                1. Qual é o seu vínculo com a região da QR 406 (Samambaia Norte)?
              </label>
              <select
                className="form-select form-select-sm"
                value={respostas.vinculo}
                onChange={(e) => setRespostas({ ...respostas, vinculo: e.target.value })}
                required
              >
                <option value="">Selecione...</option>
                <option value="Morador(a) da QR 406 ou quadras vizinhas">Morador(a) da QR 406 ou quadras vizinhas</option>
                <option value="Comerciante / Trabalhador(a) local">Comerciante / Trabalhador(a) local</option>
                <option value="Cliente / Visitante da GS Locações e Festas">Cliente / Visitante da GS Locações e Festas</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="form-label small text-secondary">
                2. Como você acessou o portal Samambaia Conecta?
              </label>
              <select
                className="form-select form-select-sm"
                value={respostas.acesso}
                onChange={(e) => setRespostas({ ...respostas, acesso: e.target.value })}
                required
              >
                <option value="">Selecione...</option>
                <option value="Leitura do QR Code impresso na GS Locações e Festas">Leitura do QR Code impresso na GS Locações e Festas</option>
                <option value="Link compartilhado por vizinhos / WhatsApp">Link compartilhado por vizinhos / WhatsApp</option>
                <option value="Acesso direto pelo navegador">Acesso direto pelo navegador</option>
              </select>
            </div>

            <div>
              <label className="form-label small text-secondary d-block">
                3. Facilidade de uso e navegação pelo celular (1 = Muito difícil, 5 = Muito fácil)
              </label>
              <div className="btn-group w-100" role="group">
                {['1', '2', '3', '4', '5'].map((nota) => (
                  <button
                    key={nota}
                    type="button"
                    onClick={() => setRespostas({ ...respostas, facilidade: nota })}
                    className={`btn btn-sm ${respostas.facilidade === nota ? 'btn-primary' : 'btn-outline-secondary'}`}
                  >
                    {nota}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label small text-secondary">
                4. O preenchimento automático via CEP/GPS e o mapa facilitaram o registro?
              </label>
              <select
                className="form-select form-select-sm"
                value={respostas.geolocalizacao}
                onChange={(e) => setRespostas({ ...respostas, geolocalizacao: e.target.value })}
                required
              >
                <option value="">Selecione...</option>
                <option value="Sim, tornou o processo muito rápido">Sim, tornou o processo muito rápido</option>
                <option value="Parcialmente">Parcialmente</option>
                <option value="Não utilizei essa função">Não utilizei essa função</option>
              </select>
            </div>

            <div>
              <label className="form-label small text-secondary">
                5. O portal ajuda a dar visibilidade aos problemas urbanos e eventos da quadra?
              </label>
              <select
                className="form-select form-select-sm"
                value={respostas.utilidade}
                onChange={(e) => setRespostas({ ...respostas, utilidade: e.target.value })}
                required
              >
                <option value="">Selecione...</option>
                <option value="Sim">Sim</option>
                <option value="Parcialmente">Parcialmente</option>
                <option value="Não">Não</option>
              </select>
            </div>

            <div>
              <label className="form-label small text-secondary">
                6. Sugestão, elogio ou comentário (opcional)
              </label>
              <textarea
                className="form-control form-control-sm"
                rows={3}
                placeholder="Deixe sua opinião sobre o portal..."
                value={respostas.sugestao}
                onChange={(e) => setRespostas({ ...respostas, sugestao: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="btn btn-primary btn-sm w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
            >
              <Send size={14} /> {enviando ? 'Enviando...' : 'Enviar Avaliação'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}