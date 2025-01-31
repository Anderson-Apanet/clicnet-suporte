import React, { useState } from 'react';
    import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

    function App() {
      const [pppoe, setPppoe] = useState('');
      const [response, setResponse] = useState(null);
      const [error, setError] = useState(null);
      const [loading, setLoading] = useState(false);
      const [showOnuDrawer, setShowOnuDrawer] = useState(false);

      const handleSearch = async () => {
        setError(null);
        setResponse(null);
        setLoading(true);
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

      const getConcentrator = () => {
        if (!response || !response.concentrador) {
          return 'N/A';
        }
        if (response.concentrador === '172.16.0.2') {
          return 'Core1';
        } else if (response.concentrador === '172.16.0.6') {
          return 'Core2';
        }
        return response.concentrador;
      };

      const paymentLink = getPaymentLink();
      const concentrator = getConcentrator();

      const showOnuButton = response && response.conexao === 'FTTH' && response.ftthlink && response.ftthpos;

      const toggleOnuDrawer = () => {
        setShowOnuDrawer(!showOnuDrawer);
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
              <h2 style={{fontSize: '1.4em'}}>
                {response.cliente}
              </h2>
              <p className="plan-highlight">
                {response.plano}
              </p>
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
              <p className="contract-status">
                <strong>Status:</strong> {response.status}
              </p>
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
              
              {!showOnuButton && response.conexao === 'FTTH' && (
                <p style={{ color: '#ff9f1c', textAlign: 'center', marginTop: '10px' }}>
                  Por favor, atualize os dados do contrato para visualizar o sinal da ONU.
                </p>
              )}
              
              {showOnuButton && (
                <div style={{textAlign: 'right', marginBottom: '10px'}}>
                  <button className="onu-button" onClick={toggleOnuDrawer}>
                    {showOnuDrawer ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
              )}
              {showOnuDrawer && (
                <div className="onu-drawer">
                  <p>
                    <strong>Sinal da ONU:</strong> (Dados do sinal da ONU aqui)
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    export default App;
