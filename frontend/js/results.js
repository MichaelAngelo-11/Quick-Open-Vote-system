// Results page UI — displays voting outcomes. Supports live updates
// or hides results until voting finishes

const {useState, useEffect} = React;

const RE = React.createElement;

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

            // If backend returns 403 it means the session exists but the organizer
            // has chosen "after-closes" visibility and voting is still open.
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

    // Auto-refresh logic:
    // - For realtime sessions that are active, poll periodically so counts stay live.
    // - For after-closes sessions, poll more frequently just to detect when voting closes.
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

    // Return the candidate with the highest vote count for a given position.
    const getWinners = (position) => {
        if (position.candidates.length === 0) return [];
        const maxVotes = Math.max(...position.candidates.map(c => c.voteCount));
        if (maxVotes === 0) return [];
        return position.candidates.filter(c => c.voteCount === maxVotes);
    };

    if (loading) {
        return RE('div', {className: 'min-h-screen flex items-center justify-center'},
            RE(Components.Loading)
        );
    }

    if (error) {
        return RE('div', {className: 'min-h-screen flex items-center justify-center'},
            RE('div', {className: 'container'},
                RE(Components.Alert, {variant: 'error'}, error),
                RE('div', {className: 'text-center mt-4'},
                    RE(Components.Button, {
                        onClick: () => window.location.href = '/'
                    }, 'Back to Home')
                )
            )
        );
    }

    // If results are set to be shown only after voting closes and the session
    // is still active, show a friendly message instead of the results.
    const shouldHideResults = sessionData?.resultDisplay === 'after-closes' && sessionData?.isActive === 1;

    if (shouldHideResults) {
        return RE('div', {className: 'min-h-screen flex items-center justify-center'},
            RE('div', {className: 'container'},
                RE('div', {className: 'card', style: {maxWidth: '500px', margin: '0 auto'}},
                    RE('div', {className: 'card-content p-8 text-center space-y-4'},
                        RE('h2', {className: 'text-3xl font-semibold'}, sessionData.title),
                        RE('p', {className: 'text-lg text-red-600 font-medium'},
                            'Results will be available automatically after voting closes.'
                        ),
                        RE('p', {className: 'text-base text-muted-foreground'},
                            'The session creator has set results to be visible only after voting is closed.'
                        ),
                        RE('div', {className: 'flex gap-6 justify-center pt-4'},
                            RE(Components.Button, {
                                onClick: fetchResults,
                                variant: 'outline'
                            }, 'Check Again'),
                            RE(Components.Button, {
                                onClick: () => window.location.href = '/'
                            }, 'Back to Home')
                        )
                    )
                )
            )
        );
    }

    return RE('div', {className: 'min-h-screen'},
        // Top header with page title and back link
        RE('header', {className: 'border-b'},
            RE('div', {className: 'container py-4'},
                RE('div', {className: 'flex items-center justify-between'},
                    RE('div', {},
                        RE('h1', {className: 'text-2xl font-semibold'}, 'Voting Results'),
                        RE('p', {className: 'text-sm text-muted-foreground mt-1'}, sessionData.title)
                    ),
                    RE('a', {
                        href: '/',
                        className: 'text-sm text-muted-foreground hover:text-foreground'
                    }, 'Back to Home')
                )
            )
        ),

        // Main content area
        RE('main', {className: 'container py-8'},
            RE('div', {className: 'space-y-6'},
                // Session summary (title, description, quick stats)
                RE('div', {className: 'card'},
                    RE('div', {className: 'card-content p-6'},
                        RE('div', {className: 'flex items-center justify-between'},
                            RE('div', {},
                                RE('h2', {className: 'text-lg font-semibold mb-2'}, sessionData.title),
                                sessionData.description && RE('p', {className: 'text-sm text-muted-foreground'}, sessionData.description)
                            ),
                            RE(Components.Badge, {
                                variant: sessionData.isActive ? 'default' : 'secondary'
                            }, sessionData.isActive ? 'Active' : 'Closed')
                        ),
                        RE('div', {className: 'grid md:grid-cols-3 gap-4 mt-6 pt-6 border-t'},
                            RE('div', {},
                                RE('div', {className: 'text-2xl font-bold'}, stats.totalVotes),
                                RE('div', {className: 'text-sm text-muted-foreground'}, 'Total Votes')
                            ),
                            RE('div', {},
                                RE('div', {className: 'text-2xl font-bold'}, positions.length),
                                RE('div', {className: 'text-sm text-muted-foreground'}, 'Positions')
                            ),
                            stats.turnoutPercentage !== null && RE('div', {},
                                RE('div', {className: 'text-2xl font-bold'}, `${stats.turnoutPercentage}%`),
                                RE('div', {className: 'text-sm text-muted-foreground'},
                                    `Turnout (${stats.totalVotes}/${stats.totalInvited})`
                                )
                            )
                        )
                    )
                ),

                // Results listed per position
                positions.map((position, index) => {
                    const winners = getWinners(position);
                    const totalVotesForPosition = position.candidates.reduce((sum, c) => sum + c.voteCount, 0);

                    return RE('div', {
                            key: position.id,
                            className: 'card'
                        },
                        RE('div', {className: 'card-header'},
                            RE('div', {className: 'flex items-start justify-between'},
                                RE('div', {},
                                    RE('h3', {className: 'card-title'}, position.title),
                                    position.description && RE('p', {className: 'card-description'}, position.description)
                                ),
                                RE('div', {className: 'flex gap-2'},
                                    RE(Components.Badge, {variant: 'secondary'},
                                        `${position.candidates.length} candidates`
                                    ),
                                    RE(Components.Badge, {variant: 'outline'},
                                        `${totalVotesForPosition} votes`
                                    )
                                )
                            )
                        ),
                        RE('div', {className: 'card-content space-y-3'},
                            position.candidates
                                .sort((a, b) => b.voteCount - a.voteCount)
                                .map(candidate => {
                                    const percentage = getPercentage(candidate.voteCount, totalVotesForPosition);
                                    const isWinner = winners.some(w => w.id === candidate.id) && candidate.voteCount > 0;

                                    return RE('div', {
                                            key: candidate.id,
                                            className: `border rounded-lg p-4 ${isWinner ? 'border-primary bg-accent' : ''}`
                                        },
                                        RE('div', {className: 'flex flex-col gap-3 w-full'},
                                            RE('div', {className: 'flex items-start gap-3'},
                                                candidate.photoUrl && RE('img', {
                                                    src: candidate.photoUrl,
                                                    alt: candidate.name,
                                                    className: 'candidate-photo-large',
                                                    onError: (e) => {
                                                        e.target.style.display = 'none';
                                                    }
                                                }),
                                                RE('div', {className: 'flex-1 min-w-0'},
                                                    RE('div', {className: 'flex items-center gap-2 mb-2'},
                                                        RE('h4', {className: 'font-semibold text-lg'}, candidate.name),
                                                        isWinner && RE(Components.Badge, {variant: 'default'}, 'Leading')
                                                    ),
                                                    candidate.description && RE('p', {className: 'text-sm text-muted-foreground'},
                                                        candidate.description
                                                    )
                                                )
                                            ),
                                            // Visual vote bar and counts
                                            RE('div', {className: 'w-full space-y-2'},
                                                RE('div', {className: 'flex items-center justify-between text-sm'},
                                                    RE('span', {className: 'font-medium'},
                                                        `${candidate.voteCount} vote${candidate.voteCount !== 1 ? 's' : ''}`
                                                    ),
                                                    RE('span', {className: 'text-muted-foreground'},
                                                        `${percentage}%`
                                                    )
                                                ),
                                                RE('div', {className: 'w-full bg-muted rounded-full h-2'},
                                                    RE('div', {
                                                        className: `h-full rounded-full transition-all ${isWinner ? 'bg-primary' : 'bg-secondary'}`,
                                                        style: {width: `${percentage}%`}
                                                    })
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

// Mount the React component
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(RE(ResultsPage));
