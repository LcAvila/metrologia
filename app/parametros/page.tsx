"use client";
import Layout from '../components/Layout';
import { useState } from 'react';

export default function Parametros() {
  const [parametros, setParametros] = useState({});

  return (
    <Layout title="Parâmetros">
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Parâmetros do Sistema</h2>
        <p className="text-gray-600">Esta página está em construção.</p>
      </div>
    </Layout>
  );
}