import { useEffect, useState } from 'react';
import { getCampaigns } from './api/campaigns.ts';
import type { Campaign } from './types/campaign.ts';

function App() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const data = await getCampaigns();
        setCampaigns(data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unknown error occurred');
        }
        } finally {
          setLoading(false);
        }  
      }
      loadCampaigns();
  }, []);

  if (loading) {
    return <p>Loading campaigns...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <main>
      <h1>AdPulse</h1>
      
      <p>Advertising campaign management and analytics platform</p>

      <h2>Campaigns</h2>

      {campaigns.map((campaign) => (
        <article key={campaign.id}>
          <h3>{campaign.name}</h3>

          <p>Status: {campaign.status}</p>
          <p>Budget: ${campaign.budget}</p>
          <p>Spent: ${campaign.spent}</p>
          
        </article>
      ))}
    </main>
  );
}

export default App;