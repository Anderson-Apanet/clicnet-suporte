import React from 'react';

export default function SuporteHeader() {
  return (
    <header style={{
      width: '100%',
      maxWidth: 900,
      margin: '0 auto',
      padding: '32px 0 12px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{
          fontWeight: 900,
          fontSize: 28,
          color: '#64ffda',
          letterSpacing: 1.5,
          textShadow: '0 2px 8px #0008',
        }}>Clicnet Suporte</span>
        <span style={{
          fontWeight: 400,
          fontSize: 16,
          color: '#fff',
          background: '#112240',
          borderRadius: 8,
          padding: '4px 12px',
          marginLeft: 8,
        }}>
          Painel Técnico
        </span>
      </div>
      <span style={{ fontSize: 14, color: '#fff', opacity: 0.7 }}>Powered by HELPEX AI</span>
    </header>
  );
}
