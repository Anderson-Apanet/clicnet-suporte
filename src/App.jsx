import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import SuporteHeader from './SuporteHeader';

// Corrige o caminho dos ícones para produção
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function App() {
  const [pppoe, setPppoe] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Agora só precisamos de um estado para os dados
  const [dadosContrato, setDadosContrato] = useState(null);

  // Função utilitária para status de pagamento
  function isPago(tx) {
    if (tx.status === 'payedBoleto') return true; // boleto pago
    if (tx.status === 'captured' || tx.status === 'payExternal') return true; // cartão de crédito pago
    return false;
  }

  const handleSearch = async () => {
    setError(null);
    setResponse(null);
    setLoading(true);
    setDadosContrato(null);
    try {
      const res = await fetch('https://webhooks.apanet.tec.br/webhook/f9364c19-3d73-4346-9cbe-a613cb91a97e', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pppoe }),
      });
      if (!res.ok) {
        setError(`HTTP error! status: ${res.status}`);
        return;
      }
      const data = await res.json();
      setResponse(data);
      if (Array.isArray(data)) {
        if (data.length > 0) {
          setDadosContrato(data[0]);
        } else {
          setDadosContrato(null);
        }
      } else if (data && typeof data === 'object') {
        setDadosContrato(data);
      } else {
        setDadosContrato(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100vw', minHeight: '100vh', background: '#0a192f', padding: 0, margin: 0 }}>
      <SuporteHeader />
      <div style={{
        maxWidth: 800,
        margin: '32px auto 16px auto',
        background: 'linear-gradient(90deg, #1e3a8a 60%, #64ffda 100%)',
        borderRadius: 20,
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: '#0a192f',
      }}>
        <h1 style={{ color: '#fff', marginBottom: 18, fontWeight: 700, fontSize: 28, letterSpacing: 1.2 }}>Consulta de Contrato</h1>
        <p style={{ color: '#e0e0e0', fontSize: 16, margin: '0 0 18px 0', textAlign: 'center' }}>
          Busque rapidamente informações detalhadas de contratos e conexões para agilizar o atendimento ao cliente.
        </p>
        <input
          type="text"
          placeholder="Digite o PPPoE ou nome do cliente"
          value={pppoe}
          onChange={(e) => setPppoe(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 8,
            border: '2px solid #64ffda',
            width: '70%',
            marginBottom: 16,
            fontSize: 16,
            background: '#112240',
            color: '#fff',
            outline: 'none',
            fontWeight: 500,
          }}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            padding: '10px 30px',
            background: '#64ffda',
            color: '#0a192f',
            border: 'none',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 18,
            cursor: 'pointer',
            marginBottom: 8,
            boxShadow: '0 2px 10px #0002',
            transition: 'background 0.3s',
          }}
        >
          {loading ? 'Buscando...' : 'Pesquisar'}
        </button>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </div>

      {/* CARDS VISUAIS SEPARADOS - só aparecem após a consulta */}
      {dadosContrato && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 24,
          justifyContent: 'center',
          alignItems: 'flex-start',
          width: '100%',
          margin: '0 auto 32px auto',
        }}>
          {/* CARD 1: CONTRATO */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a 70%, #112240 100%)',
            color: '#fff',
            borderRadius: 18,
            boxShadow: '0 4px 16px #0006',
            padding: 28,
            minWidth: 320,
            maxWidth: 370,
            flex: '1 1 340px',
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            <h2 style={{ color: '#64ffda', marginBottom: 18, letterSpacing: 1.1 }}>Contrato</h2>
            <div><strong>Cliente:</strong> {dadosContrato.cliente_nome}</div>
            <div style={{margin: '4px 0 8px 0'}}>
              <span style={{
                display: 'inline-block',
                background: dadosContrato.contrato_status === 'Ativo' ? 'linear-gradient(90deg,#64ffda 60%,#1e3a8a 100%)' : 'linear-gradient(90deg,#ff5555 60%,#1e3a8a 100%)',
                color: dadosContrato.contrato_status === 'Ativo' ? '#0a192f' : '#fff',
                fontWeight: 900,
                padding: '4px 18px',
                borderRadius: 8,
                fontSize: 18,
                letterSpacing: 1.2,
                boxShadow: '0 2px 8px #0003',
                textShadow: '0 1px 4px #0004',
              }}>{dadosContrato.contrato_status || 'N/A'}</span>
            </div>
            <div><strong>Contrato Assinado:</strong> {dadosContrato.contrato_assinado === null ? 'Não' : dadosContrato.contrato_assinado ? 'Sim' : 'Não'}</div>
            <div><strong>Pré-pago:</strong> {dadosContrato.contrato_prepago ? 'Sim' : 'Não'}</div>
            <div><strong>Conexão:</strong> {dadosContrato.contrato_conexao}</div>
            <div><strong>Sinal FTTH:</strong> <span style={{ color: Number(dadosContrato.contrato_ftth_sinal) > -25 ? '#64ffda' : '#ff5555', fontWeight: 700 }}>{dadosContrato.contrato_ftth_sinal ?? 'N/A'}</span></div>
            <div><strong>Plano:</strong> <span style={{ background: '#1e3a8a', color: '#64ffda', borderRadius: 6, padding: '2px 10px', fontWeight: 600 }}>{dadosContrato.contrato_plano_nome}</span></div>
            <div><strong>PPPoE:</strong> <span style={{ fontFamily: 'monospace', color: '#fff' }}>{dadosContrato.contrato_pppoe_username}</span></div>
            <div><strong>Endereço:</strong> {dadosContrato.contrato_endereco}</div>
            <div><strong>Complemento:</strong> {dadosContrato.contrato_complemento_endereco}</div>
            <div><strong>Porta CTO:</strong> {dadosContrato.contrato_cto_porta}</div>
            <div><strong>Contrato PDF:</strong> {dadosContrato.contrato_foto_contrato && (
              <a href={dadosContrato.contrato_foto_contrato.startsWith('http') ? dadosContrato.contrato_foto_contrato : `https:${dadosContrato.contrato_foto_contrato}`} target="_blank" rel="noopener noreferrer" style={{ color: '#64ffda', textDecoration: 'underline' }}>Abrir PDF</a>
            )}</div>
            <div><strong>Selfie:</strong> {dadosContrato.contrato_foto_selfie && (
              <a href={dadosContrato.contrato_foto_selfie.startsWith('http') ? dadosContrato.contrato_foto_selfie : `https:${dadosContrato.contrato_foto_selfie}`} target="_blank" rel="noopener noreferrer" style={{ color: '#64ffda', textDecoration: 'underline' }}>Ver Foto</a>
            )}</div>
          </div>

          {/* CARD 2: CONEXÃO */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a 70%, #112240 100%)',
            color: '#fff',
            borderRadius: 18,
            boxShadow: '0 4px 16px #0006',
            padding: 28,
            minWidth: 320,
            maxWidth: 370,
            flex: '1 1 340px',
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            <h2 style={{ color: '#64ffda', marginBottom: 18, letterSpacing: 1.1 }}>Conexão</h2>
            {/* Conectado/Desconectado badge */}
            <div style={{margin: '4px 0 8px 0'}}>
              <span style={{
                display: 'inline-block',
                background: dadosContrato.acctstoptime === null || dadosContrato.acctstoptime === '' ? 'linear-gradient(90deg,#ff5555 60%,#1e3a8a 100%)' : 'linear-gradient(90deg,#64ffda 60%,#1e3a8a 100%)',
                color: dadosContrato.acctstoptime === null || dadosContrato.acctstoptime === '' ? '#fff' : '#0a192f',
                fontWeight: 900,
                padding: '4px 18px',
                borderRadius: 8,
                fontSize: 18,
                letterSpacing: 1.2,
                boxShadow: '0 2px 8px #0003',
                textShadow: '0 1px 4px #0004',
              }}>{dadosContrato.acctstoptime === null || dadosContrato.acctstoptime === '' ? 'Desconectado' : 'Conectado'}</span>
            </div>
            <div><strong>IP:</strong> <span style={{ fontFamily: 'monospace', color: '#64ffda' }}>{dadosContrato.framedipaddress}</span></div>
            <div><strong>Servidor:</strong> <span style={{ fontFamily: 'monospace', color: '#64ffda' }}>{dadosContrato.nasipaddress}</span></div>
            <div><strong>NAS Porta:</strong> <span style={{ fontFamily: 'monospace' }}>{dadosContrato.nasportid}</span></div>
            <div><strong>Endereço MAC:</strong> <span style={{ fontFamily: 'monospace' }}>{dadosContrato.callingstationid}</span></div>
            <div><strong>Servidor:</strong> <span style={{ fontFamily: 'monospace' }}>{dadosContrato.calledstationid}</span></div>
            <div><strong>Sinal FTTH:</strong> <span style={{ color: Number(dadosContrato.contrato_ftth_sinal) > -25 ? '#64ffda' : '#ff5555', fontWeight: 700 }}>{dadosContrato.contrato_ftth_sinal ?? 'N/A'}</span></div>
            <div><strong>Início Sessão:</strong> {dadosContrato.acctstarttime}</div>
            <div><strong>Tempo de Sessão:</strong> {dadosContrato.acctsessiontime} segundos</div>
            <div><strong>Upload:</strong> <span style={{ color: '#64ffda' }}>{(dadosContrato.acctinputoctets / (1024*1024)).toFixed(2)} MB</span></div>
            <div><strong>Download:</strong> <span style={{ color: '#64ffda' }}>{(dadosContrato.acctoutputoctets / (1024*1024)).toFixed(2)} MB</span></div>
            <div><strong>Motivo Término:</strong> {dadosContrato.acctterminatecause || '---'}</div>
          </div>

          {/* CARD 3: MAPA LEAFLET */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a 70%, #112240 100%)',
            color: '#fff',
            borderRadius: 18,
            boxShadow: '0 4px 16px #0006',
            padding: 0,
            minWidth: 340,
            maxWidth: 420,
            flex: '1 1 370px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: 0,
          }}>
            <h2 style={{ color: '#64ffda', padding: 20, textAlign: 'center', margin: 0, letterSpacing: 1.1 }}>Localização</h2>
            {dadosContrato.contrato_localizacao &&
              typeof dadosContrato.contrato_localizacao.lat === 'number' &&
              typeof dadosContrato.contrato_localizacao.lng === 'number' &&
              !isNaN(dadosContrato.contrato_localizacao.lat) &&
              !isNaN(dadosContrato.contrato_localizacao.lng) ? (
              <MapContainer
                center={[dadosContrato.contrato_localizacao.lat, dadosContrato.contrato_localizacao.lng]}
                zoom={16}
                style={{ height: 220, width: '100%', margin: '20px 0', borderRadius: 14 }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <Marker position={[dadosContrato.contrato_localizacao.lat, dadosContrato.contrato_localizacao.lng]}>
                  <Popup>
                    {dadosContrato.cliente_nome}<br />
                    {dadosContrato.contrato_endereco}<br />
                    {dadosContrato.contrato_complemento_endereco}
                  </Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div style={{ padding: 20, color: '#fff' }}>Localização não disponível.</div>
            )}
            {dadosContrato.contrato_localizacao && (
              <div style={{ color: '#fff', fontSize: 14, marginBottom: 16 }}>
                <strong>Lat:</strong> {dadosContrato.contrato_localizacao.lat}<br />
                <strong>Lng:</strong> {dadosContrato.contrato_localizacao.lng}
              </div>
            )}
            {/* Exibe selfie se houver */}
            {dadosContrato.contrato_foto_selfie && (
              <div style={{ margin: '12px 0 16px 0', textAlign: 'center' }}>
                <img src={dadosContrato.contrato_foto_selfie.startsWith('http') ? dadosContrato.contrato_foto_selfie : `https:${dadosContrato.contrato_foto_selfie}`} alt="Selfie do cliente" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 12, boxShadow: '0 2px 8px #0006', border: '2px solid #64ffda' }} />
                <div style={{ color: '#fff', fontSize: 13, marginTop: 4 }}>Selfie do cliente</div>
              </div>
            )}
          </div>

          {/* CARD 4: FINANCEIRO */}
          {dadosContrato.financeiro_transacoes && Array.isArray(dadosContrato.financeiro_transacoes) && dadosContrato.financeiro_transacoes.length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #112240 70%, #1e3a8a 100%)',
              color: '#fff',
              borderRadius: 18,
              boxShadow: '0 4px 16px #0006',
              padding: 28,
              minWidth: 320,
              maxWidth: 420,
              flex: '1 1 370px',
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}>
              <h2 style={{ color: '#64ffda', marginBottom: 18, letterSpacing: 1.1 }}>Financeiro</h2>
              <div style={{ maxHeight: 260, overflowY: 'auto', paddingRight: 2 }}>
                {dadosContrato.financeiro_transacoes.map((tx, idx) => (
                  <div key={idx} style={{
                    background: '#17325c',
                    borderRadius: 10,
                    marginBottom: 10,
                    padding: '12px 10px',
                    boxShadow: '0 2px 8px #0002',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}>
                    <div><strong>Vencimento:</strong> {tx.vencimento ? (new Date(tx.vencimento).toLocaleDateString('pt-BR')) : '--'}</div>
                    <div><strong>Valor:</strong> <span style={{ color: '#64ffda', fontWeight: 600 }}>{(tx.valor/100)?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                    <div><strong>Status:</strong> <span style={{ color: isPago(tx) ? '#64ffda' : '#ff9f1c', fontWeight: 600 }}>{isPago(tx) ? 'Pago' : 'Pendente'}</span></div>
                    {tx.boleto_url && (
                      <div><a href={tx.boleto_url} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'underline', fontWeight: 500 }}>2ª via do Boleto</a></div>
                    )}
                    {tx.pix_url && (
                      <div><a href={tx.pix_url} target="_blank" rel="noopener noreferrer" style={{ color: '#64ffda', textDecoration: 'underline', fontWeight: 500 }}>Pagar com PIX</a></div>
                    )}
                    {tx.boleto_codigo_barras && (
                      <div style={{ fontSize: 13, color: '#fff', opacity: 0.85 }}><strong>Código de Barras:</strong> {tx.boleto_codigo_barras}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
