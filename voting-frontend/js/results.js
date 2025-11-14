// Results Page - View voting results (realtime or after-closes mode)

const { useState, useEffect } = React;

function ResultsPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sessionData, setSessionData] = useState(null);
    const [positions, setPositions] = useState([]);
    const [stats, setStats] = useState(null);
    
    const urlParams = new URLSearchParams(window.location.search);
    const sessionCode = urlParams.get('code');

    const fetchResults = async () => {
        if (!sessionCode) {
            setError('No session code provided');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/results/${sessionCode}`);
            const data = await response.json();

            // 403 means session active but resultDisplay=after-closes
            if (response.status === 403 && data.session) {
                setSessionData(data.session);
                setPositions([]);
                setStats(null);
                setError('');
                setLoading(false);
                return;
            }

            if (!response.ok) {
                setError(data.error || 'Failed to fetch results');
                setLoading(false);
                return;
            }

            setSessionData(data.session);
            setPositions(data.positions);
            setStats(data.stats);
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to fetch results');
        } finally {
            setLoading(false);
        }
    };

    // Auto-refresh: realtime mode refreshes for live counts, after-closes mode polls for status changes
    useEffect(() => {
        fetchResults();

        let interval;
        
        if (sessionData?.resultDisplay === 'realtime' && sessionData?.isActive === 1) {
            interval = setInterval(fetchResults, 5000);
        } else if (sessionData?.resultDisplay === 'after-closes') {
            interval = setInterval(fetchResults, 3000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [sessionCode, sessionData?.isActive, sessionData?.resultDisplay]);

    const getPercentage = (votes, total) => {
        if (total === 0) return 0;
        return Math.round((votes / total) * 100);
    };

    // Get candidates with highest vote count for a position
    const getWinners = (position) => {
        if (position.candidates.length === 0) return [];
        const maxVotes = Math.max(...position.candidates.map(c => c.voteCount));
        if (maxVotes === 0) return [];
        return position.candidates.filter(c => c.voteCount === maxVotes);
    };

    if (loading) {
        return React.createElement('div', { className: 'min-h-screen flex items-center justify-center' },
            React.createElement(Components.Loading)
        );
    }

    if (error) {
        return React.createElement('div', { className: 'min-h-screen flex items-center justify-center' },
            React.createElement('div', { className: 'container' },
                React.createElement(Components.Alert, { variant: 'error' }, error),
                React.createElement('div', { className: 'text-center mt-4' },
                    React.createElement(Components.Button, {
                        onClick: () => window.location.href = '/'
                    }, 'Back to Home')
                )
            )
        );
    }

    // Check if results should be hidden
    const shouldHideResults = sessionData?.resultDisplay === 'after-closes' && sessionData?.isActive === 1;

    if (shouldHideResults) {
        return React.createElement('div', { className: 'min-h-screen flex items-center justify-center' },
            React.createElement('div', { className: 'container text-center' },
                React.createElement(Components.Card, {},
                    React.createElement('div', { className: 'p-8' },
                        React.createElement('h2', { className: 'text-2xl font-semibold mb-4' }, sessionData.title),
                        React.createElement(Components.Alert, { variant: 'info' }, 
                            'Results will be available after voting closes.'
                        ),
                        React.createElement('p', { className: 'text-sm text-muted-foreground mt-4' },
                            'The session creator has set results to be visible only after voting is closed.'
                        ),
                        React.createElement('div', { className: 'mt-6 flex items-center justify-center gap-3' },
                            React.createElement(Components.Button, {
                                onClick: fetchResults,
                                variant: 'outline'
                            }, 'Check Again'),
                            React.createElement(Components.Button, {
                                onClick: () => window.location.href = '/',
                                variant: 'ghost'
                            }, 'Back to Home')
                        )
                    )
                )
            )
        );
    }

    return React.createElement('div', { className: 'min-h-screen' },
        // Header
        React.createElement('header', { className: 'border-b' },
            React.createElement('div', { className: 'container py-4' },
                React.createElement('div', { className: 'flex items-center justify-between' },
                    React.createElement('div', {},
                        React.createElement('h1', { className: 'text-2xl font-semibold' }, 'Voting Results'),
                        React.createElement('p', { className: 'text-sm text-muted-foreground mt-1' }, sessionData.title)
                    ),
                    React.createElement('a', { 
                        href: '/',
                        className: 'text-sm text-muted-foreground hover:text-foreground'
                    }, 'Back to Home')
                )
            )
        ),

        // Main Content
        React.createElement('main', { className: 'container py-8' },
            React.createElement('div', { className: 'space-y-6' },
                // Session Info
                React.createElement('div', { className: 'card' },
                    React.createElement('div', { className: 'card-content p-6' },
                        React.createElement('div', { className: 'flex items-center justify-between' },
                            React.createElement('div', {},
                                React.createElement('h2', { className: 'text-lg font-semibold mb-2' }, sessionData.title),
                                sessionData.description && React.createElement('p', { className: 'text-sm text-muted-foreground' }, sessionData.description)
                            ),
                            React.createElement(Components.Badge, { 
                                variant: sessionData.isActive ? 'default' : 'secondary' 
                            }, sessionData.isActive ? 'Active' : 'Closed')
                        ),
                        React.createElement('div', { className: 'grid md:grid-cols-3 gap-4 mt-6 pt-6 border-t' },
                            React.createElement('div', {},
                                React.createElement('div', { className: 'text-2xl font-bold' }, stats.totalVotes),
                                React.createElement('div', { className: 'text-sm text-muted-foreground' }, 'Total Votes')
                            ),
                            React.createElement('div', {},
                                React.createElement('div', { className: 'text-2xl font-bold' }, positions.length),
                                React.createElement('div', { className: 'text-sm text-muted-foreground' }, 'Positions')
                            ),
                            stats.turnoutPercentage !== null && React.createElement('div', {},
                                React.createElement('div', { className: 'text-2xl font-bold' }, `${stats.turnoutPercentage}%`),
                                React.createElement('div', { className: 'text-sm text-muted-foreground' }, 
                                    `Turnout (${stats.totalVotes}/${stats.totalInvited})`
                                )
                            )
                        )
                    )
                ),

                // Results by Position
                positions.map((position, index) => {
                    const winners = getWinners(position);
                    const totalVotesForPosition = position.candidates.reduce((sum, c) => sum + c.voteCount, 0);

                    return React.createElement('div', { 
                        key: position.id,
                        className: 'card'
                    },
                        React.createElement('div', { className: 'card-header' },
                            React.createElement('div', { className: 'flex items-start justify-between' },
                                React.createElement('div', {},
                                    React.createElement('h3', { className: 'card-title' }, position.title),
                                    position.description && React.createElement('p', { className: 'card-description' }, position.description)
                                ),
                                React.createElement('div', { className: 'flex gap-2' },
                                    React.createElement(Components.Badge, { variant: 'secondary' }, 
                                        `${position.candidates.length} candidates`
                                    ),
                                    React.createElement(Components.Badge, { variant: 'outline' }, 
                                        `${totalVotesForPosition} votes`
                                    )
                                )
                            )
                        ),
                        React.createElement('div', { className: 'card-content space-y-3' },
                            position.candidates
                                .sort((a, b) => b.voteCount - a.voteCount)
                                .map(candidate => {
                                    const percentage = getPercentage(candidate.voteCount, totalVotesForPosition);
                                    const isWinner = winners.some(w => w.id === candidate.id) && candidate.voteCount > 0;

                                    return React.createElement('div', { 
                                        key: candidate.id,
                                        className: `border rounded-lg p-4 ${isWinner ? 'border-primary bg-accent' : ''}`
                                    },
                                        React.createElement('div', { className: 'flex items-start gap-3' },
                                            candidate.photoUrl && React.createElement('img', {
                                                src: candidate.photoUrl,
                                                alt: candidate.name,
                                                className: 'w-16 h-16 rounded-full object-cover',
                                                onError: (e) => { e.target.style.display = 'none'; }
                                            }),
                                            React.createElement('div', { className: 'flex-1' },
                                                React.createElement('div', { className: 'flex items-center gap-2 mb-2' },
                                                    React.createElement('h4', { className: 'font-semibold text-lg' }, candidate.name),
                                                    isWinner && React.createElement(Components.Badge, { variant: 'default' }, 'Leading')
                                                ),
                                                candidate.description && React.createElement('p', { className: 'text-sm text-muted-foreground mb-3' }, 
                                                    candidate.description
                                                ),
                                                // Vote bar
                                                React.createElement('div', { className: 'space-y-2' },
                                                    React.createElement('div', { className: 'flex items-center justify-between text-sm' },
                                                        React.createElement('span', { className: 'font-medium' }, 
                                                            `${candidate.voteCount} vote${candidate.voteCount !== 1 ? 's' : ''}`
                                                        ),
                                                        React.createElement('span', { className: 'text-muted-foreground' }, 
                                                            `${percentage}%`
                                                        )
                                                    ),
                                                    React.createElement('div', { className: 'w-full bg-muted rounded-full h-2' },
                                                        React.createElement('div', {
                                                            className: `h-full rounded-full transition-all ${isWinner ? 'bg-primary' : 'bg-secondary'}`,
                                                            style: { width: `${percentage}%` }
                                                        })
                                                    )
                                                )
                                            )
                                        )
                                    );
                                })
                        )
                    );
                })
            )
        )
    );
}

// Render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(ResultsPage));
