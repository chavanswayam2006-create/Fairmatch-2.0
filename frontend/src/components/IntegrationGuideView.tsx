import React, { useState } from 'react';
import { FairMatchWidget } from './FairMatchWidget';
import { Copy, Check } from 'lucide-react';

export const IntegrationGuideView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'react' | 'iframe' | 'rest'>('react');

  const reactSnippet = `import { FairMatchWidget } from '@neuralkinetics/fairmatch-widget';

export function HostAppPage() {
  return (
    <FairMatchWidget
      apiBaseUrl="https://api.yourhostsite.com"
      apiKey="fairmatch-secret-key"
      jobId="job_12345"
      themeColor="#000000"
      onMatchComplete={(report) => console.log('Match report:', report)}
    />
  );
}`;

  const iframeSnippet = `<iframe
  src="http://127.0.0.1:3000?widget=true&job_id=job_demo_01&api_key=fairmatch-secret-key"
  width="100%"
  height="450"
  frameborder="0"
  style="border-radius: 12px; border: 1px solid #e4e4e7;"
></iframe>`;

  const restSnippet = `curl -X POST "http://127.0.0.1:8000/api/v1/match" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: fairmatch-secret-key" \\
  -d '{
    "job_id": "job_demo_01"
  }'`;

  const currentSnippet = activeTab === 'react' ? reactSnippet : activeTab === 'iframe' ? iframeSnippet : restSnippet;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
      {/* Code snippet & integration instructions */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e4e4e7',
        borderRadius: '16px',
        padding: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>
          Embed & Integration Guide
        </h3>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '20px' }}>
          FairMatch is API-first and designed to embed seamlessly into any host web application.
        </p>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            onClick={() => setActiveTab('react')}
            className={activeTab === 'react' ? 'btn-black' : 'btn-outline'}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            React Widget Component
          </button>
          <button
            onClick={() => setActiveTab('iframe')}
            className={activeTab === 'iframe' ? 'btn-black' : 'btn-outline'}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            HTML iFrame Embed
          </button>
          <button
            onClick={() => setActiveTab('rest')}
            className={activeTab === 'rest' ? 'btn-black' : 'btn-outline'}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            cURL / REST API
          </button>
        </div>

        {/* Code Block */}
        <div style={{ position: 'relative' }}>
          <pre style={{
            backgroundColor: '#09090b',
            color: '#f4f4f5',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '12px',
            overflowX: 'auto',
            fontFamily: 'monospace',
            lineHeight: 1.5
          }}>
            <code>{currentSnippet}</code>
          </pre>

          <button
            onClick={handleCopy}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 10px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px'
            }}
          >
            {copied ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>

        <div style={{ marginTop: '20px', fontSize: '12px', color: '#555' }}>
          <strong>Authentication & Security:</strong> Pass requests with header <code>X-API-Key: fairmatch-secret-key</code>. Set allowed host domains in backend <code>CORS_ORIGINS</code> env variable.
        </div>
      </div>

      {/* Live Interactive Widget Preview */}
      <div style={{
        backgroundColor: '#fafafa',
        border: '1px solid #e4e4e7',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#888', textTransform: 'uppercase', marginBottom: '16px' }}>
          Live Embeddable Widget Preview
        </div>

        <FairMatchWidget
          apiBaseUrl="http://127.0.0.1:8000"
          apiKey="fairmatch-secret-key"
          jobId="job_demo_01"
          themeColor="#000000"
        />
      </div>
    </div>
  );
};
