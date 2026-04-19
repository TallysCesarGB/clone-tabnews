import useSWR from "swr";

async function FetchAPI(key) {
  const res = await fetch(key);
  return res.json();
}

function StatusInfo() {
  const { data, error, isLoading } = useSWR("/api/v1/status", FetchAPI, {
    refreshInterval: 2000,
  });

  if (error) {
    return <div className="text-red-500 text-sm">❌ Falha ao carregar status</div>;
  }

  if (isLoading || !data) {
    return <div className="text-gray-500 text-sm">⏳ Carregando informações...</div>;
  }

  const { update_at, dependencies } = data;
  const { version, max_connections, opened_connections } = dependencies.database;

  const updateAtText = new Date(update_at).toLocaleString("pt-BR");

  return (
    <div className="text-left text-gray-600 text-sm space-y-4 mt-4">
      <div className="border-t pt-3">
        <div className="font-medium text-gray-700 mb-2 flex items-center gap-1">
          <span>🐘</span> PostgreSQL
        </div>
        <div className="space-y-1 pl-2">
          <div>📌 Versão: <span className="font-mono text-gray-800">{version}</span></div>
          <div>🔌 Conexões ativas: <span className="font-mono text-gray-800">{opened_connections}</span> / {max_connections}</div>
        </div>
      </div>
      <div className="border-t pt-2">
        <div className="flex items-center gap-1">
          <span>🕒</span> Última atualização: <span className="font-mono">{updateAtText}</span>
        </div>
      </div>
    </div>
  );
}

export default function StatusPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-3xl font-semibold text-gray-800 tracking-tight text-center">
          Status do Servidor
        </h1>
        <StatusInfo />
      </div>
    </div>
  );
}