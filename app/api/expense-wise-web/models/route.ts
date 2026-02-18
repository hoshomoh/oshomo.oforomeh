type OllamaModel = {
  name: string;
  size: number;
  details: {
    parameter_size?: string;
    family?: string;
  };
};

type ModelsRequest = {
  provider: string;
  apiKey?: string;
};

export async function POST(request: Request) {
  try {
    const body: ModelsRequest = await request.json();
    const { provider, apiKey } = body;

    if (provider === 'ollama-cloud') {
      const headers: Record<string, string> = {};
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const res = await fetch('https://ollama.com/api/tags', { headers });
      if (!res.ok) {
        return Response.json(
          { error: `Upstream error: HTTP ${res.status}` },
          { status: res.status },
        );
      }

      const data = await res.json();
      const models: OllamaModel[] = data.models ?? [];
      return Response.json({ models });
    }

    return Response.json({ error: `Unsupported provider: ${provider}` }, { status: 400 });
  } catch {
    return Response.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
}
