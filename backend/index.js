const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const VERSION = '1.2.0-pagination-debug';

app.use(cors());
app.use(express.json());

// Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.json({ message: 'Lichess Game Fetcher Backend', version: VERSION, status: 'running' });
});

app.get('/api/games', async (req, res) => {
    try {
        const url = 'https://lichess.org/api/games/user/falllorius?max=100&moves=true&opening=true&since=1707465600000&until=1710067200000';
        console.log(`Fetching games from: ${url}`);

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/x-ndjson'
            }
        });

        if (!response.ok) {
            throw new Error(`Lichess API returned ${response.status}: ${response.statusText}`);
        }

        const text = await response.text();
        // Lichess returns NDJSON. We split by newline and parse each line.
        const games = text.trim().split('\n').filter(line => line.length > 0).map(line => {
            try {
                const game = JSON.parse(line);
                // Return only the specific fields requested by the user
                return {
                    id: game.id,
                    players: {
                        white: game.players.white?.user?.id || 'unknown',
                        black: game.players.black?.user?.id || 'unknown'
                    },
                    moves: game.moves,
                    speed: game.speed
                };
            } catch (e) {
                console.error('Error parsing game line:', line, e);
                return null;
            }
        }).filter(game => game !== null);

        res.json({
            count: games.length,
            games: games
        });
    } catch (error) {
        console.error('Error fetching Lichess games:', error);
        res.status(500).json({ error: 'Failed to fetch games from Lichess', details: error.message });
    }
});

app.get('/api/game/:gameId', async (req, res) => {
    try {
        const { gameId } = req.params;
        const url = `https://lichess.org/game/export/${gameId}?moves=true&opening=true`;
        console.log(`Fetching single game: ${url}`);

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Lichess API returned ${response.status}: ${response.statusText}`);
        }

        const game = await response.json();

        // Filter fields to match the user request
        const filteredGame = {
            id: game.id,
            players: {
                white: game.players.white?.user?.id || 'unknown',
                black: game.players.black?.user?.id || 'unknown'
            },
            moves: game.moves,
            speed: game.speed
        };

        res.json(filteredGame);
    } catch (error) {
        console.error('Error fetching single Lichess game:', error);
        res.status(500).json({ error: 'Failed to fetch single game from Lichess', details: error.message });
    }
});
app.listen(PORT, () => {
    console.log(`Server v${VERSION} running on http://localhost:${PORT}`);
});
