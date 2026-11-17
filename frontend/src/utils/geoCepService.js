export async function buscarEnderecoPorCep(cep) {
  const limpo = cep.replace(/\D/g, '');
  if (limpo.length !== 8) {
    throw new Error('Digite um CEP válido com 8 números.');
  }

  const res = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
  const data = await res.json();

  if (data.erro) {
    throw new Error('CEP não encontrado na base dos Correios.');
  }

  // Extrai a quadra do logradouro (ex: "Quadra QR 406 Conjunto 10" -> "QR 406")
  const matchQuadra = data.logradouro?.match(/(Q[NRS]\s*\d+|SMT)/i);
  const quadraDetectada = matchQuadra
    ? matchQuadra[0].toUpperCase()
    : (data.logradouro || data.bairro || '');

  // Busca coordenadas aproximadas da quadra/CEP em Samambaia
  let coords = null;
  try {
    const query = encodeURIComponent(`${data.logradouro || ''}, ${data.bairro || 'Samambaia'}, Brasília, DF`);
    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
    const geoData = await geoRes.json();
    if (geoData?.[0]) {
      coords = [parseFloat(geoData[0].lat), parseFloat(geoData[0].lon)];
    }
  } catch {
    // Fallback silencioso se Nominatim demorar
  }

  return {
    cep: data.cep,
    quadra: quadraDetectada,
    localizacao: [data.logradouro, data.bairro].filter(Boolean).join(' - '),
    coords,
  };
}

export async function buscarCepPorCoordenadas(lat, lng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
  );
  const data = await res.json();
  const cepBruto = data?.address?.postcode;

  if (cepBruto) {
    return await buscarEnderecoPorCep(cepBruto);
  }

  const road = data?.address?.road || '';
  const suburb = data?.address?.suburb || 'Samambaia';
  const matchQuadra = road.match(/(Q[NRS]\s*\d+|SMT)/i);

  return {
    cep: '',
    quadra: matchQuadra ? matchQuadra[0].toUpperCase() : suburb,
    localizacao: [road, suburb].filter(Boolean).join(' - '),
    coords: [lat, lng],
  };
}