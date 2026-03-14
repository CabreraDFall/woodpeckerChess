export class LichessService {
  private readonly baseUrl = "https://lichess.org/api";

  async getGamesByUsername(username: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/games/user/${username}?max=${limit}&moves=true&pgnInJson=true`, {
        headers: {
          'Accept': 'application/x-ndjson'
        }
      });

      if (!response.ok) {
        throw new Error(`Lichess API error: ${response.statusText}`);
      }

      const text = await response.text();
      return text.trim().split('\n').filter(line => line.length > 0).map(line => JSON.parse(line));
    } catch (error) {
      console.error('Error fetching from Lichess:', error);
      throw error;
    }
  }
}
