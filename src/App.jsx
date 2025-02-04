import React, { useState, useEffect } from 'react';

    function App() {
      const [pppoe, setPppoe] = useState('');
      const [response, setResponse] = useState(null);
      const [error, setError] = useState(null);
      const [loading, setLoading] = useState(false);
      const [onuSignal, setOnuSignal] = useState(null);
      const [onuSignalLoading, setOnuSignalLoading] = useState(false);
      const [concentrator, setConcentrator] = useState('N/A');

      const handleSearch = async () => {
        setError(null);
        setResponse(null);
        setOnuSignal(null);
        setLoading(true);
        setConcentrator('N/A');
        try {
          const res = await fetch('https://webhooks.apanet.tec.br/webhook/e1b7e447-2cf6-444d-8fa7-d117106b31e3', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pppoe }),
          });

          if (!res.ok) {
            const message = `HTTP error! status: ${res.status}`;
            setError(message);
            try {
              const errorData = await res.json();
              console.error('API Error Details:', errorData);
              setError(`${message} - ${JSON.stringify(errorData)}`);
            } catch (jsonError) {
              console.error('API Error (no JSON details):', res);
              setError(message);
            }
            return;
          }

          const data = await res.json();
          console.log('API Response:', data);
          setResponse(data);
        } catch (err) {
          setError(err.message);
          console.error('API Error:', err);
        } finally {
          setLoading(false);
        }
      };

      const getPaymentLink = () => {
        if (!response || !response.Subscriptions || response.Subscriptions.length === 0) {
          return 'N/A';
        }
        return response.Subscriptions[0]?.Transactions?.[0]?.paymentLink || 'N/A';
      };

      useEffect(() => {
        if (response && response.concentrador) {
          if (response.concentrador === '172.16.0.2') {
            setConcentrator('Core1');
          } else if (response.concentrador === '172.16.0.6') {
            setConcentrator('Core2');
          } else {
            setConcentrator(response.concentrador);
          }
        } else {
          setConcentrator('N/A');
        }
      }, [response]);

      useEffect(() => {
        const fetchOnuSignal = async () => {
          if (response && response.ftthlink && response.ftthpos && concentrator !== 'N/A') {
            setOnuSignalLoading(true);
            try {
              const res = await fetch('https://webhooks.apanet.tec.br/webhook/52353b91-f8af-41cb-a6f8-2062d1aef2d2', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  ftthlink: response.ftthlink,
                  ftthpos: response.ftthpos,
                  concentrator: response.concentrador
                }),
              });

              if (!res.ok) {
                const message = `HTTP error! status: ${res.status}`;
                setError(message);
                try {
                  const errorData = await res.json();
                  console.error('API Error Details:', errorData);
                  setOnuSignal(null);
                } catch (jsonError) {
                  console.error('API Error (no JSON details):', res);
                  setError(message);
                  setOnuSignal(null);
                }
                return;
              }

              const data = await res.json();
              console.log('ONU Signal Response:', data);
              const signalValue = data.sinal;

              setOnuSignal(signalValue);
            } catch (err) {
              setError(err.message);
              console.error('ONU Signal API Error:', err);
              setOnuSignal(null);
            } finally {
              setOnuSignalLoading(false);
            }
          } else {
            setOnuSignal(null);
          }
        };

        fetchOnuSignal();
      }, [response, concentrator]);

      const paymentLink = getPaymentLink();

      const handleNotaFiscalClick = async () => {
        if (response && response.cliente) {
          try {
            const res = await fetch('https://webhooks.apanet.tec.br/webhook/gerapdfnf', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ cliente: response.cliente }),
            });

            if (res.ok) {
              const data = await res.json();
              if (data && data.data) {
                // Decode base64
                const pdfBase64 = data.data;
                const binaryString = atob(pdfBase64);
                const binaryLen = binaryString.length;
                const bytes = new Uint8Array(binaryLen);
                for (let i = 0; i < binaryLen; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: 'application/pdf' });

                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `nota_fiscal_${response.cliente}.pdf`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

              } else {
                setError('PDF data not found in response.');
              }
            } else {
              const message = `HTTP error! status: ${res.status}`;
              setError(message);
              console.error('Nota Fiscal API Error:', message);
            }
          } catch (err) {
            setError(err.message);
            console.error('Nota Fiscal API Error:', err);
          }
        } else {
          setError('Cliente não encontrado.');
        }
      };

      return (
        <div className="container">
          <h1>PPPoE Search</h1>
          <input
            type="text"
            placeholder="Enter PPPoE"
            value={pppoe}
            onChange={(e) => setPppoe(e.target.value)}
          />
          <button onClick={handleSearch} disabled={loading}>
            Search
          </button>

          {loading && <div className="loading"></div>}

          {error && <p style={{ color: 'red' }}>Error: {error}</p>}

          {response && (
            <div className="card">
              <h2 style={{fontSize: '1.2em', color: '#fff'}}>
                {response.cliente}
              </h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p className="plan-highlight">
                  {response.plano}
                </p>
                <p style={{ backgroundColor: '#fff', color: '#00008B', padding: '5px', borderRadius: '5px' }}>
                  {response.status}
                </p>
              </div>
              <button
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#64ffda',
                  color: '#0a192f',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                }}
                onClick={handleNotaFiscalClick}
              >
                Nota Fiscal
              </button>
              {paymentLink !== 'N/A' ? (
                <p className="payment-link">
                  <strong>Link Financeiro:</strong>{' '}
                  <a href={paymentLink} target="_blank" rel="noopener noreferrer">
                    Link
                  </a>
                </p>
              ) : (
                <p className="payment-link">
                  <strong>Link Financeiro:</strong> N/A
                </p>
              )}
              <p>
                <strong>Conexão:</strong> {response.conexao}
              </p>
              <p>
                <strong>FTTH Link:</strong> {response.ftthlink}
              </p>
              <p>
                <strong>FTTH Pos:</strong> {response.ftthpos}
              </p>
              <p>
                <strong>CTO:</strong> {response.cto}
              </p>
              <p>
                <strong>Concentrador:</strong> {concentrator}
              </p>
              <p>
                <strong>Interface:</strong> {response.interface}
              </p>
              <p>
                <strong>Início Conexão:</strong> {response.iniciocon}
              </p>
              <p>
                <strong>Final Conexão:</strong> {response.finalcon}
              </p>
              <p>
                <strong>PPPoE Server:</strong> {response.pppoeserver}
              </p>
              <p>
                <strong>IPv4:</strong> {response.ipv4}
              </p>
              {response.ftthlink && response.ftthpos && (
                <p>
                  <strong>Sinal da ONU:</strong>{' '}
                  {onuSignalLoading ? (
                    <div className="loading"></div>
                  ) : (
                    onuSignal !== null ? onuSignal : 'N/A'
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      );
    }

    export default App;
