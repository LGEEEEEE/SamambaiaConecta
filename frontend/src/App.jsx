import { useEffect, useState } from 'react';
import {
  MapPin, AlertTriangle, Calendar, ThumbsUp, LocateFixed,
  CheckCircle2, Clock, Camera, Shield, Layers, Search, MessageSquare
} from 'lucide-react';
import MapaRegiao, { CENTRO_SAMAMBAIA } from './components/MapaRegiao';
import FormularioAvaliacao from './components/FormularioAvaliacao';
import { comprimirImagemParaBase64 } from './utils/imageCompressor';
import { buscarEnderecoPorCep, buscarCepPorCoordenadas } from './utils/geoCepService';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function App() {
  const [aba, setAba] = useState('ocorrencias');
  const [buscaQuadra, setBuscaQuadra] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [camadaSatelite, setCamadaSatelite] = useState(true);

  const [ocorrencias, setOcorrencias] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [centroMapa, setCentroMapa] = useState(CENTRO_SAMAMBAIA);
  const [zoomMapa, setZoomMapa] = useState(13);
  const [pontoSelecionado, setPontoSelecionado] = useState(CENTRO_SAMAMBAIA);
  const [minhaLocalizacao, setMinhaLocalizacao] = useState(null);

  const [buscandoGeo, setBuscandoGeo] = useState(false);
  const [infoFoto, setInfoFoto] = useState('');
  const [erroForm, setErroForm] = useState('');
  const [enviando, setEnviando] = useState(false);

  const [formOcorrencia, setFormOcorrencia] = useState({
    titulo: '', descricao: '', categoria: 'Infraestrutura',
    cep: '', quadra: '', localizacao: '', anonimo: true, autor: '', imagemBase64: '',
  });

  const [formEvento, setFormEvento] = useState({
    titulo: '', descricao: '', dataEvento: '',
    cep: '', quadra: '', local: '', organizador: '', imagemBase64: '',
  });

  const carregarDados = async () => {
    try {
      const [resOc, resEv] = await Promise.all([
        fetch(`${API_URL}/ocorrencias`),
        fetch(`${API_URL}/eventos`),
      ]);
      const dataOc = await resOc.json();
      const dataEv = await resEv.json();

      if (!resOc.ok) setErroForm(dataOc.erro || 'Erro ao carregar ocorrências.');
      else if (!resEv.ok) setErroForm(dataEv.erro || 'Erro ao carregar eventos.');
      else setErroForm('');

      setOcorrencias(Array.isArray(dataOc) ? dataOc : []);
      setEventos(Array.isArray(dataEv) ? dataEv : []);
    } catch {
      setErroForm('Sem conexão com o servidor da API.');
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const usarMinhaLocalizacao = (tipo) => {
    setErroForm('');
    if (!navigator.geolocation) {
      return setErroForm('Geolocalização não suportada neste navegador.');
    }

    setBuscandoGeo(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setMinhaLocalizacao(coords);
        setPontoSelecionado(coords);
        setCentroMapa(coords);
        setZoomMapa(16);

        try {
          const end = await buscarCepPorCoordenadas(coords[0], coords[1]);
          if (tipo === 'ocorrencia') {
            setFormOcorrencia((p) => ({
              ...p,
              cep: end.cep || p.cep,
              quadra: end.quadra || p.quadra,
              localizacao: end.localizacao || p.localizacao,
            }));
          } else {
            setFormEvento((p) => ({
              ...p,
              cep: end.cep || p.cep,
              quadra: end.quadra || p.quadra,
              local: end.localizacao || p.local,
            }));
          }
        } catch {
          // Mantém coordenadas capturadas
        } finally {
          setBuscandoGeo(false);
        }
      },
      () => {
        setBuscandoGeo(false);
        setErroForm('Permissão de localização negada. Digite o CEP ou clique no mapa.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleBuscarCep = async (cepDigitado, tipo) => {
    setErroForm('');
    const limpo = cepDigitado.replace(/\D/g, '');
    if (limpo.length !== 8) return;

    setBuscandoGeo(true);
    try {
      const end = await buscarEnderecoPorCep(limpo);
      if (end.coords) {
        setCentroMapa(end.coords);
        setPontoSelecionado(end.coords);
        setZoomMapa(16);
      }
      if (tipo === 'ocorrencia') {
        setFormOcorrencia((p) => ({
          ...p,
          cep: end.cep,
          quadra: end.quadra || p.quadra,
          localizacao: end.localizacao || p.localizacao,
        }));
      } else {
        setFormEvento((p) => ({
          ...p,
          cep: end.cep,
          quadra: end.quadra || p.quadra,
          local: end.localizacao || p.local,
        }));
      }
    } catch (err) {
      setErroForm(err.message);
    } finally {
      setBuscandoGeo(false);
    }
  };

  const handleCliqueMapa = async (coords) => {
    setPontoSelecionado(coords);
    setBuscandoGeo(true);
    setErroForm('');

    try {
      const end = await buscarCepPorCoordenadas(coords[0], coords[1]);
      if (aba === 'ocorrencias') {
        setFormOcorrencia((p) => ({
          ...p,
          cep: end.cep || '',
          quadra: end.quadra || p.quadra,
          localizacao: end.localizacao || p.localizacao,
        }));
      } else {
        setFormEvento((p) => ({
          ...p,
          cep: end.cep || '',
          quadra: end.quadra || p.quadra,
          local: end.localizacao || p.local,
        }));
      }
    } catch {
      // Mantém ponto no mapa
    } finally {
      setBuscandoGeo(false);
    }
  };

  const handleUploadFoto = async (e, tipo) => {
    setErroForm('');
    setInfoFoto('');
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await comprimirImagemParaBase64(file);
      setInfoFoto(`Imagem otimizada: ${res.originalKB} KB → ${res.finalKB} KB`);
      if (tipo === 'ocorrencia') setFormOcorrencia((p) => ({ ...p, imagemBase64: res.base64 }));
      else setFormEvento((p) => ({ ...p, imagemBase64: res.base64 }));
    } catch (err) {
      setErroForm(err.message);
    }
  };

  const criarOcorrencia = async (e) => {
    e.preventDefault();
    setErroForm('');
    setEnviando(true);
    try {
      const res = await fetch(`${API_URL}/ocorrencias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formOcorrencia, latitude: pontoSelecionado[0], longitude: pontoSelecionado[1] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro ao registrar ocorrência.');

      setFormOcorrencia({
        titulo: '', descricao: '', categoria: 'Infraestrutura',
        cep: '', quadra: '', localizacao: '', anonimo: true, autor: '', imagemBase64: '',
      });
      setInfoFoto('');
      carregarDados();
    } catch (err) {
      setErroForm(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const criarEvento = async (e) => {
    e.preventDefault();
    setErroForm('');
    setEnviando(true);
    try {
      const res = await fetch(`${API_URL}/eventos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formEvento, latitude: pontoSelecionado[0], longitude: pontoSelecionado[1] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || 'Erro ao publicar evento.');

      setFormEvento({
        titulo: '', descricao: '', dataEvento: '',
        cep: '', quadra: '', local: '', organizador: '', imagemBase64: '',
      });
      setInfoFoto('');
      carregarDados();
    } catch (err) {
      setErroForm(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const apoiarOcorrencia = async (id) => {
    await fetch(`${API_URL}/ocorrencias/${id}/apoiar`, { method: 'PATCH' });
    carregarDados();
  };

  const marcarResolvido = async (id) => {
    await fetch(`${API_URL}/ocorrencias/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'RESOLVIDO' }),
    });
    carregarDados();
  };

  const termo = buscaQuadra.trim().toLowerCase();
  const ocorrenciasFiltradas = ocorrencias.filter((o) => {
    const bateTexto = !termo || o.quadra.toLowerCase().includes(termo) || (o.cep && o.cep.includes(termo)) || o.titulo.toLowerCase().includes(termo);
    const bateStatus = filtroStatus === 'TODOS' || o.status === filtroStatus;
    return bateTexto && bateStatus;
  });

  const eventosFiltrados = eventos.filter((e) =>
    !termo || e.quadra.toLowerCase().includes(termo) || (e.cep && e.cep.includes(termo)) || e.titulo.toLowerCase().includes(termo)
  );

  return (
    <div data-bs-theme="dark" className="min-vh-100 bg-dark text-light">
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-black border-bottom border-secondary-subtle py-2">
        <div className="container d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div
            className="d-flex align-items-center gap-2"
            style={{ cursor: 'pointer' }}
            onClick={() => setAba('ocorrencias')}
          >
            <span className="badge text-bg-primary">DF</span>
            <h1 className="h5 mb-0 fw-bold">Samambaia Conecta</h1>
          </div>
          <div className="d-flex gap-2">
            {aba !== 'avaliacao' && (
              <>
                <button
                  className="btn btn-outline-info btn-sm d-flex align-items-center gap-1"
                  onClick={() => usarMinhaLocalizacao(aba === 'eventos' ? 'evento' : 'ocorrencia')}
                  disabled={buscandoGeo}
                >
                  <LocateFixed size={15} />
                  {buscandoGeo ? 'Localizando...' : 'GPS'}
                </button>
                <button
                  className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
                  onClick={() => setCamadaSatelite(!camadaSatelite)}
                >
                  <Layers size={15} />
                  {camadaSatelite ? 'Mapa' : 'Satélite'}
                </button>
              </>
            )}
            
          </div>
        </div>
      </nav>

      <main className="container py-3">
        {/* Abas principais */}
        <ul className="nav nav-pills mb-3 gap-2">
          <li className="nav-item">
            <button
              className={`nav-link btn-sm d-flex align-items-center gap-2 ${aba === 'ocorrencias' ? 'active' : 'bg-body-tertiary text-light'}`}
              onClick={() => { setAba('ocorrencias'); setErroForm(''); setInfoFoto(''); }}
            >
              <AlertTriangle size={15} /> Problemas ({ocorrenciasFiltradas.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link btn-sm d-flex align-items-center gap-2 ${aba === 'eventos' ? 'active' : 'bg-body-tertiary text-light'}`}
              onClick={() => { setAba('eventos'); setErroForm(''); setInfoFoto(''); }}
            >
              <Calendar size={15} /> Eventos ({eventosFiltrados.length})
            </button>
          </li>
          <li className="nav-item ms-md-auto">
            <button
              className={`nav-link btn-sm d-flex align-items-center gap-2 ${aba === 'avaliacao' ? 'active' : 'bg-body-tertiary text-info border border-info-subtle'}`}
              onClick={() => { setAba('avaliacao'); setErroForm(''); setInfoFoto(''); }}
            >
              <MessageSquare size={15} /> Avaliar Portal
            </button>
          </li>
        </ul>

        {/* Mapa e filtros exibidos apenas nas abas de Problemas e Eventos */}
        {aba !== 'avaliacao' && (
          <>
            <div className="card bg-body-tertiary border-secondary-subtle mb-3">
              <div className="card-body py-2 px-3 row g-2 align-items-center">
                <div className="col-md-6">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text"><Search size={14} /></span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar por quadra (ex: QR 406), CEP ou título..."
                      value={buscaQuadra}
                      onChange={(e) => setBuscaQuadra(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6 d-flex justify-content-md-end gap-2 flex-wrap">
                  {['TODOS', 'ABERTO', 'RESOLVIDO'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setFiltroStatus(st)}
                      className={`btn btn-sm ${filtroStatus === st ? 'btn-primary' : 'btn-outline-secondary'}`}
                    >
                      {st === 'TODOS' ? 'Todos' : st === 'ABERTO' ? 'Em Aberto' : 'Resolvidos'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <section className="mb-3">
              <MapaRegiao
                ocorrencias={ocorrenciasFiltradas}
                eventos={eventosFiltrados}
                pontoSelecionado={pontoSelecionado}
                minhaLocalizacao={minhaLocalizacao}
                onSelecionarPonto={handleCliqueMapa}
                centroMapa={centroMapa}
                zoomMapa={zoomMapa}
                camadaSatelite={camadaSatelite}
                buscandoCep={buscandoGeo}
              />
              <div className="d-flex justify-content-end flex-wrap small text-secondary mt-2 gap-3">
                <span><span className="badge rounded-pill bg-info me-1">&nbsp;</span>Você</span>
                <span><span className="badge rounded-pill bg-danger me-1">&nbsp;</span>Aberto</span>
                <span><span className="badge rounded-pill bg-success me-1">&nbsp;</span>Resolvido</span>
                <span><span className="badge rounded-pill bg-primary me-1">&nbsp;</span>Evento</span>
              </div>
            </section>
          </>
        )}

        {erroForm && <div className="alert alert-danger py-2 small">{erroForm}</div>}

        {/* ABA PROBLEMAS */}
        {aba === 'ocorrencias' && (
          <div className="row g-4">
            <div className="col-lg-5">
              <div className="card bg-body-tertiary border-secondary-subtle">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">Registrar Problema</span>
                  <button
                    type="button"
                    onClick={() => usarMinhaLocalizacao('ocorrencia')}
                    className="btn btn-outline-info btn-sm py-0 px-2 d-flex align-items-center gap-1"
                  >
                    <LocateFixed size={13} /> GPS + CEP
                  </button>
                </div>
                <form className="card-body" onSubmit={criarOcorrencia}>
                  <div className="row g-2 mb-3">
                    <div className="col-5">
                      <label className="form-label small text-secondary">CEP</label>
                      <input
                        className="form-control form-control-sm"
                        placeholder="72300-000"
                        maxLength={9}
                        value={formOcorrencia.cep}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormOcorrencia({ ...formOcorrencia, cep: val });
                          if (val.replace(/\D/g, '').length === 8) handleBuscarCep(val, 'ocorrencia');
                        }}
                      />
                    </div>
                    <div className="col-7">
                      <label className="form-label small text-secondary">Quadra / Setor</label>
                      <input
                        className="form-control form-control-sm"
                        placeholder="Ex: QR 406"
                        value={formOcorrencia.quadra}
                        onChange={(e) => setFormOcorrencia({ ...formOcorrencia, quadra: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small text-secondary">Categoria</label>
                      <select className="form-select form-select-sm" value={formOcorrencia.categoria} onChange={(e) => setFormOcorrencia({ ...formOcorrencia, categoria: e.target.value })}>
                        <option value="Infraestrutura">Asfalto / Buracos</option>
                        <option value="Iluminação">Iluminação Pública</option>
                        <option value="Limpeza">Entulho / Lixo</option>
                        <option value="Saneamento">Água / Esgoto / Bueiro</option>
                        <option value="Segurança">Sinalização / Segurança</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-secondary">Referência</label>
                      <input
                        className="form-control form-control-sm"
                        placeholder="Conjunto / Parada"
                        value={formOcorrencia.localizacao}
                        onChange={(e) => setFormOcorrencia({ ...formOcorrencia, localizacao: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary">Título</label>
                    <input className="form-control form-control-sm" placeholder="Ex: Poste apagado" value={formOcorrencia.titulo} onChange={(e) => setFormOcorrencia({ ...formOcorrencia, titulo: e.target.value })} required />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary">Descrição</label>
                    <textarea className="form-control form-control-sm" rows={2} placeholder="Detalhes do local..." value={formOcorrencia.descricao} onChange={(e) => setFormOcorrencia({ ...formOcorrencia, descricao: e.target.value })} required />
                  </div>

                  <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" id="checkAnonimo" checked={formOcorrencia.anonimo} onChange={(e) => setFormOcorrencia({ ...formOcorrencia, anonimo: e.target.checked })} />
                    <label className="form-check-label small d-flex align-items-center gap-1" htmlFor="checkAnonimo">
                      <Shield size={14} className="text-info" /> Denúncia anônima
                    </label>
                  </div>

                  {!formOcorrencia.anonimo && (
                    <div className="mb-3">
                      <input className="form-control form-control-sm" placeholder="Seu nome" value={formOcorrencia.autor} onChange={(e) => setFormOcorrencia({ ...formOcorrencia, autor: e.target.value })} />
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center gap-2">
                      <Camera size={15} /> Anexar Foto
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleUploadFoto(e, 'ocorrencia')} hidden />
                    </label>
                    {infoFoto && <div className="form-text text-success">{infoFoto}</div>}
                  </div>

                  {formOcorrencia.imagemBase64 && (
                    <img src={formOcorrencia.imagemBase64} alt="Preview" className="img-fluid rounded mb-3 border border-secondary" style={{ maxHeight: 150, width: '100%', objectFit: 'cover' }} />
                  )}

                  <button type="submit" disabled={enviando} className="btn btn-danger btn-sm w-100 fw-semibold">
                    {enviando ? 'Publicando...' : 'Publicar no Radar'}
                  </button>
                </form>
              </div>
            </div>

            <div className="col-lg-7">
              {ocorrenciasFiltradas.length === 0 ? (
                <div className="card bg-body-tertiary border-secondary-subtle p-4 text-center text-secondary small">
                  Nenhum problema encontrado.
                </div>
              ) : (
                <div className="row g-3">
                  {ocorrenciasFiltradas.map((item) => (
                    <div key={item.id} className="col-12">
                      <div className="card bg-body-tertiary border-secondary-subtle overflow-hidden">
                        <div className="row g-0">
                          {item.imagemBase64 && (
                            <div className="col-md-4">
                              <img
                                src={item.imagemBase64}
                                alt={item.titulo}
                                className="h-100 w-100"
                                style={{ objectFit: 'cover', minHeight: 160, maxHeight: 220 }}
                              />
                            </div>
                          )}
                          <div className={item.imagemBase64 ? 'col-md-8' : 'col-12'}>
                            <div className="card-body d-flex flex-column justify-content-between h-100">
                              <div>
                                <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-1">
                                  <div className="d-flex gap-1 flex-wrap">
                                    <span className="badge text-bg-dark border border-secondary">{item.quadra}</span>
                                    {item.cep && <span className="badge text-bg-secondary">{item.cep}</span>}
                                    <span className="badge bg-primary-subtle text-primary-emphasis">{item.categoria}</span>
                                  </div>
                                  <span className={`badge ${item.status === 'RESOLVIDO' ? 'text-bg-success' : 'text-bg-warning'}`}>
                                    {item.status === 'RESOLVIDO' ? <CheckCircle2 size={12} className="me-1" /> : <Clock size={12} className="me-1" />}
                                    {item.status}
                                  </span>
                                </div>

                                <h5 className="card-title h6 fw-bold mb-1">{item.titulo}</h5>
                                <p className="card-text small text-secondary mb-2">{item.descricao}</p>
                              </div>

                              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-2 border-top border-secondary-subtle small text-secondary">
                                <span><MapPin size={13} className="me-1" />{item.localizacao} • {item.autor}</span>
                                <div className="d-flex gap-2">
                                  {item.status !== 'RESOLVIDO' && (
                                    <button onClick={() => marcarResolvido(item.id)} className="btn btn-outline-success btn-sm py-0 px-2">
                                      Resolver
                                    </button>
                                  )}
                                  <button onClick={() => apoiarOcorrencia(item.id)} className="btn btn-outline-light btn-sm py-0 px-2 d-flex align-items-center gap-1">
                                    <ThumbsUp size={12} /> Confirmar ({item.apoios})
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABA EVENTOS */}
        {aba === 'eventos' && (
          <div className="row g-4">
            <div className="col-lg-5">
              <div className="card bg-body-tertiary border-secondary-subtle">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">Divulgar Evento</span>
                  <button
                    type="button"
                    onClick={() => usarMinhaLocalizacao('evento')}
                    className="btn btn-outline-info btn-sm py-0 px-2 d-flex align-items-center gap-1"
                  >
                    <LocateFixed size={13} /> GPS + CEP
                  </button>
                </div>
                <form className="card-body" onSubmit={criarEvento}>
                  <div className="row g-2 mb-3">
                    <div className="col-5">
                      <label className="form-label small text-secondary">CEP</label>
                      <input
                        className="form-control form-control-sm"
                        placeholder="72300-000"
                        maxLength={9}
                        value={formEvento.cep}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormEvento({ ...formEvento, cep: val });
                          if (val.replace(/\D/g, '').length === 8) handleBuscarCep(val, 'evento');
                        }}
                      />
                    </div>
                    <div className="col-7">
                      <label className="form-label small text-secondary">Quadra / Setor</label>
                      <input className="form-control form-control-sm" placeholder="Ex: QR 406" value={formEvento.quadra} onChange={(e) => setFormEvento({ ...formEvento, quadra: e.target.value })} required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Nome do Evento</label>
                    <input className="form-control form-control-sm" value={formEvento.titulo} onChange={(e) => setFormEvento({ ...formEvento, titulo: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Data e Horário</label>
                    <input className="form-control form-control-sm" placeholder="Ex: 21/11/2026 às 09h00" value={formEvento.dataEvento} onChange={(e) => setFormEvento({ ...formEvento, dataEvento: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Local</label>
                    <input className="form-control form-control-sm" value={formEvento.local} onChange={(e) => setFormEvento({ ...formEvento, local: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Organizador</label>
                    <input className="form-control form-control-sm" value={formEvento.organizador} onChange={(e) => setFormEvento({ ...formEvento, organizador: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Detalhes</label>
                    <textarea className="form-control form-control-sm" rows={2} value={formEvento.descricao} onChange={(e) => setFormEvento({ ...formEvento, descricao: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center gap-2">
                      <Camera size={15} /> Banner / Foto
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleUploadFoto(e, 'evento')} hidden />
                    </label>
                    {infoFoto && <div className="form-text text-success">{infoFoto}</div>}
                  </div>
                  {formEvento.imagemBase64 && (
                    <img src={formEvento.imagemBase64} alt="Preview" className="img-fluid rounded mb-3 border border-secondary" style={{ maxHeight: 150, width: '100%', objectFit: 'cover' }} />
                  )}
                  <button type="submit" disabled={enviando} className="btn btn-primary btn-sm w-100 fw-semibold">
                    {enviando ? 'Publicando...' : 'Publicar Evento'}
                  </button>
                </form>
              </div>
            </div>

            <div className="col-lg-7">
              {eventosFiltrados.length === 0 ? (
                <div className="card bg-body-tertiary border-secondary-subtle p-4 text-center text-secondary small">
                  Nenhum evento programado.
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {eventosFiltrados.map((ev) => (
                    <div key={ev.id} className="card bg-body-tertiary border-secondary-subtle overflow-hidden">
                      <div className="row g-0">
                        {ev.imagemBase64 && (
                          <div className="col-md-4">
                            <img src={ev.imagemBase64} alt={ev.titulo} className="h-100 w-100" style={{ objectFit: 'cover', minHeight: 150, maxHeight: 210 }} />
                          </div>
                        )}
                        <div className={ev.imagemBase64 ? 'col-md-8' : 'col-12'}>
                          <div className="card-body">
                            <div className="d-flex gap-2 mb-2 flex-wrap">
                              <span className="badge text-bg-dark border border-secondary">{ev.quadra}</span>
                              {ev.cep && <span className="badge text-bg-secondary">{ev.cep}</span>}
                              <span className="badge text-bg-primary">{ev.dataEvento}</span>
                            </div>
                            <h5 className="card-title h6 fw-bold mb-1">{ev.titulo}</h5>
                            <p className="card-text small text-secondary mb-2">{ev.descricao}</p>
                            <div className="pt-2 border-top border-secondary-subtle small text-secondary">
                              <MapPin size={13} className="me-1" />{ev.local} • Org.: {ev.organizador}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABA AVALIAÇÃO (FORMULÁRIO NATIVO INTEGRADO AO GOOGLE FORMS) */}
        {aba === 'avaliacao' && (
          <FormularioAvaliacao onVoltar={() => setAba('ocorrencias')} />
        )}
      </main>
    </div>
  );
}