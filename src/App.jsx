import React, { useState } from 'react';

    function App() {
      const [pppoe, setPppoe] = useState('');
      const [response, setResponse] = useState(null);
      const [error, setError] = useState(null);
      const [loading, setLoading] = useState(false);

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

      const paymentLink = getPaymentLink();

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
              <h2>
                {response.cliente} - {response.plano}
              </h2>
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
                <strong>Concentrador:</strong> {response.concentrador}
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
              {paymentLink !== 'N/A' ? (
                <p className="payment-link">
                  <strong>Payment Link:</strong>{' '}
                  <a href={paymentLink} target="_blank" rel="noopener noreferrer">
                    Link
                  </a>
                </p>
              ) : (
                <p className="payment-link">
                  <strong>Payment Link:</strong> N/A
                </p>
              )}
            </div>
          )}
        </div>
      );
    }

    export default App;
