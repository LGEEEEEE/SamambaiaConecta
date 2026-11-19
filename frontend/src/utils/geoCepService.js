// frontend/src/utils/geoCepService.js

function extrairQuadra(texto = '') {
  const match = texto.match(/\b(Q[NRS]\s*\d+|ADE\s*\d+|SHSN|Setor\s+\w+)\b/i);
  return match ? match[0].toUpperCase().replace(/\s+/, ' ') : '';
}

// 1. Busca oficial pelo CEP (ViaCEP -> Quadra e Conjunto exatos)
export async function buscarEnderecoPorCep(cepDigitado) {
  const limpo = cepDigitado.replace(/\D/g, '');
  if (limpo.length !== 8) {
    throw new Error('CEP inválido. Digite os 8 números.');
  }

  const res = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
  const data = await res.json();

  if (data.erro) {
    throw new Error('CEP não encontrado na base dos Correios.');
  }

  const logradouro = data.logradouro || '';
  const quadraExtraida = extrairQuadra(logradouro) || data.bairro || 'Samambaia';

  // Geocodificação estruturada para posicionar o pino no mapa
  let coords = null;
  try {
    const query = encodeURIComponent(`${logradouro}, Samambaia, Brasília, DF, Brasil`);
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${query}`
    );
    const geoData = await geoRes.json();
    if (Array.isArray(geoData) && geoData[0]) {
      coords = [parseFloat(geoData[0].lat), parseFloat(geoData[0].lon)];
    }
  } catch {
    // Se o mapa não achar a coordenada exata, mantém os dados oficiais do CEP
  }

  return {
    cep: data.cep,
    quadra: quadraExtraida,
    localizacao: logradouro || data.bairro || 'Samambaia - DF',
    coords,
  };
}

// 2. Busca reversa na base do ViaCEP usando Quadra + Conjunto (ex: "QR 406", "Conjunto 30")
export async function buscarCepPorQuadra(quadra, complemento = '') {
  const termo = `${quadra} ${complemento}`.trim();
  if (termo.length < 4) return null;

  try {
    const encoded = encodeURIComponent(termo);
    const res = await fetch(`https://viacep.com.br/ws/DF/Brasilia/${encoded}/json/`);
    const lista = await res.json();

    if (Array.isArray(lista) && lista.length > 0) {
      // Filtra apenas resultados de Samambaia (CEPs iniciados em 723)
      const samambaia = lista.find((item) => item.cep?.startsWith('723')) || lista[0];
      return {
        cep: samambaia.cep,
        quadra: extrairQuadra(samambaia.logradouro) || quadra.toUpperCase(),
        localizacao: samambaia.logradouro,
      };
    }
  } catch {
    return null;
  }
  return null;
}

// 3. Clique no mapa ou GPS -> tenta identificar quadra e valida o CEP no ViaCEP
export async function buscarCepPorCoordenadas(lat, lng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
  );
  const data = await res.json();
  const addr = data.address || {};

  const rua = addr.road || addr.suburb || addr.neighbourhood || '';
  const quadra = extrairQuadra(rua) || extrairQuadra(data.display_name || '');
  let cep = addr.postcode ? addr.postcode.replace(/\D/g, '') : '';
  if (cep.length === 8) {
    cep = `${cep.slice(0, 5)}-${cep.slice(5)}`;
  }

  // Se o OSM não souber o CEP da rua, consulta o ViaCEP pela quadra encontrada
  if (!cep && quadra) {
    const viaCepMatch = await buscarCepPorQuadra(quadra);
    if (viaCepMatch) {
      return {
        cep: viaCepMatch.cep,
        quadra: viaCepMatch.quadra,
        localizacao: rua || viaCepMatch.localizacao,
      };
    }
  }

  return {
    cep,
    quadra,
    localizacao: rua || 'Ponto marcado no mapa',
  };
}