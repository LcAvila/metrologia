'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

export default function FichasEmergenciaPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="p-4">
        <h1>Fichas de Emergência</h1>
        <Link href="/fdu">Voltar</Link>
      </div>
    </div>
  );
}
