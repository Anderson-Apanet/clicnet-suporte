import React, { useState } from 'react';
    import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

    function App() {
      const [pppoe, setPppoe] = useState('');
      const [response, setResponse] = useState(null);
      const [error, setError] = useState(null);
      const [loading, setLoading] = useState(false);
      const [showOnuDrawer, setShowOnuDrawer] = useState(false);
      const [onuSignal, setOnuSignal] = useState(null);
      const [currentPage, setCurrentPage] = useState(1);
      const itemsPerPage = 10;

      const handleSearch = async () => {
        setError(null);
        setResponse(null);
        setOnuSignal(null);
        setLoading(true);
        setCurrentPage(1);
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
      const showCtoButton = response && response.cto;

      const toggleOnuDrawer = async () => {
        setShowOnuDrawer(!showOnuDrawer);
        if (!showOnuDrawer && response && response.ftthlink && response.ftthpos) {
          try {
            const res = await fetch('https://workflows.apanet.tec.br/webhook-test/52353b91-f8af-41cb-a6f8-2062d1aef2d2', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ ftthlink: response.ftthlink, ftthpos: response.ftthpos, concentrator: response.concentrador }),
            });

            if (!res.ok) {
              const message = `HTTP error! status: ${res.status}`;
              setError(message);
              try {
                const errorData = await res.json();
                console.error('ONU Signal API Error Details:', errorData);
                setOnuSignal(errorData);
              } catch (jsonError) {
                console.error('ONU Signal API Error (no JSON details):', res);
                setError(message);
              }
              return;
            }

            const data = await res.json();
            console.log('ONU Signal Response:', data);
            setOnuSignal(data);
            setCurrentPage(1);
          } catch (err) {
            setError(err.message);
            console.error('ONU Signal API Error:', err);
          }
        }
      };

      const getPaginatedOnuSignal = () => {
        if (!onuSignal || !Array.isArray(onuSignal)) {
          return [];
        }
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return onuSignal.slice(startIndex, endIndex);
      };

      const totalPages = onuSignal ? Math.ceil(onuSignal.length / itemsPerPage) : 0;

      const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
      };

      const paginatedOnuSignal = onuSignal ? getPaginatedOnuSignal() : [];

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
              
              {showCtoButton && (
                <button className="cto-button">
                  Ver outros clientes da mesma CTO
                </button>
              )}
              {showOnuButton && (
                <div style={{textAlign: 'right', marginBottom: '10px'}}>
                  <button className="onu-button" onClick={toggleOnuDrawer}>
                    Ver sinal da ONU {showOnuDrawer ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
              )}
              {showOnuDrawer && (
                <div className="onu-drawer">
                  {onuSignal && Array.isArray(onuSignal) ? (
                    <table className="onu-table">
                      <thead>
                        <tr>
                          <th>Link</th>
                          <th>Pos</th>
                          <th>Momento</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedOnuSignal.map((signal, index) => (
                          <tr key={index}>
                            <td>{signal.link}</td>
                            <td>{signal.pos}</td>
                            <td>{signal.momento}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>
                      <strong>Sinal da ONU:</strong> {onuSignal ? JSON.stringify(onuSignal) : '(Carregando...)'}
                    </p>
                  )}
                  {onuSignal && Array.isArray(onuSignal) && onuSignal.length > itemsPerPage && (
                    <div className="pagination">
                      <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                        Anterior
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button key={page} onClick={() => handlePageChange(page)} disabled={currentPage === page}>
                          {page}
                        </button>
                      ))}
                      <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                        Próxima
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    export default App;
