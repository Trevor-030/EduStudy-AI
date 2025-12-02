import React, { useState } from 'react';
import { useApiKey } from '../contexts/ApiKeyContext';

const ApiKeyInput: React.FC = () => {
  const { apiKey, setApiKey } = useApiKey();
  const [warning, setWarning] = useState('');

  const handleSave = () => {
    if (!apiKey.trim()) {
      setWarning('API key is required.');
      return;
    }
    if (!apiKey.startsWith('sk-')) {
      setWarning('API key must start with "sk-".');
      return;
    }
    setApiKey(apiKey);
    setWarning('');
    alert('API key saved successfully.');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">API Key Input</h2>
        {warning && <p id="api-key-warning" className="text-red-500 mb-4">{warning}</p>}
        <div className="mb-4">
          <label className="block text-gray-700">API Key</label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your API key"
            aria-describedby={warning ? "api-key-warning" : undefined}
          />
        </div>
        <button
          onClick={handleSave}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
        >
          Save API Key
        </button>
      </div>
    </div>
  );
};

export default React.memo(ApiKeyInput);