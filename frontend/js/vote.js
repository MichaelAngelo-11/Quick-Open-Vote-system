// Voting Page - Cast votes for candidates in a session

const { useState, useEffect } = React;

const RE = React.createElement;

function VotingPage() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [session, setSession] = useState(null);
    const [positions, setPositions] = useState([]);
    const [votes, setVotes] = useState({});
    const [voterEmail, setVoterEmail] = useState('');
    const [voterName, setVoterName] = useState('');
    
    const params = utils.getUrlParams();
    const votingCode = params.code;

    useEffect(() => {
        if (!votingCode) {
            setError('No voting code provided');
            setLoading(false);
            return;
        }

        fetchSession();
    }, [votingCode]);

    const fetchSession = async () => {
        try {
            const data = await utils.api.get(`/sessions/${votingCode}`);
            
            if (!data.session.isActive) {
                setError('This voting session has been closed');
                setLoading(false);
                return;
            }

            setSession(data.session);
            setPositions(data.positions);
            
            // Casual mode: check if already voted (using localStorage as client-side marker)
            if (data.session.mode === 'casual') {
                const storageKey = `Quick-Open Vote_voted_${data.session.id}`;
                const hasVoted = localStorage.getItem(storageKey);
                if (hasVoted) {
                    setError('You have already voted in this session');
                    setSuccess('Your vote was previously submitted');
                    setLoading(false);
                    return;
                }
            }
            
            const initialVotes = {};
            data.positions.forEach(pos => {
                initialVotes[pos.id] = [];
            });
            setVotes(initialVotes);
            
            setLoading(false);
        } catch (err) {
            setError(err.message || 'Failed to load voting session');
            setLoading(false);
        }
    };

    const toggleCandidate = (positionId, candidateId, maxSelections) => {
        const currentVotes = votes[positionId] || [];
        const isSelected = currentVotes.includes(candidateId);

        if (isSelected) {
            setVotes({
                ...votes,
                [positionId]: currentVotes.filter(id => id !== candidateId)
            });
        } else {
            if (currentVotes.length < maxSelections) {
                setVotes({
                    ...votes,
                    [positionId]: [...currentVotes, candidateId]
                });
            } else {
                setError(`You can only select up to ${maxSelections} candidate(s) for this position`);
                setTimeout(() => setError(''), 3000);
            }
        }
    };

    const submitVotes = async () => {
        setError('');
        
        // Official mode: email required
        if (session.mode === 'official' && !voterEmail.trim()) {
            setError('Please enter your email address');
            return;
        }

        if (session.mode === 'official' && !utils.isValidEmail(voterEmail)) {
            setError('Please enter a valid email address');
            return;
        }

        // Ensure voter voted for all positions
        const allPositionsVoted = positions.every(pos => {
            const posVotes = votes[pos.id] || [];
            return posVotes.length > 0;
        });

        if (!allPositionsVoted) {
            setError('Please vote for all positions before submitting');
            return;
        }

        setSubmitting(true);

        try {
            const formattedVotes = [];
            Object.keys(votes).forEach(positionId => {
                votes[positionId].forEach(candidateId => {
                    formattedVotes.push({
                        positionId,
                        candidateId
                    });
                });
            });

            const response = await utils.api.post('/vote', {
                sessionId: session.id,
                voterEmail: session.mode === 'official' ? voterEmail : null,
                voterName: session.mode === 'casual' ? voterName : null,
                votes: formattedVotes
            });

            // Mark as voted (casual mode only)
            if (session.mode === 'casual') {
                const storageKey = `Quick-Open Vote_voted_${session.id}`;
                localStorage.setItem(storageKey, response.voterId);
            }

            setSuccess('Your vote has been submitted successfully!');
            
            setTimeout(() => {
                window.location.href = `/results.html?code=${votingCode}`;
            }, 2000);
        } catch (err) {
            if (err.message && err.message.includes('already been used')) {
                setError('This name has already been used to vote. Please use a different name or vote anonymously.');
            } else {
                setError(err.message || 'Failed to submit votes');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return RE('div', { className: 'min-h-screen flex items-center justify-center' },
            RE(Components.Loading, {}, 'Loading voting session...')
        );
    }

    if (error && !session) {
        return RE('div', { className: 'min-h-screen flex items-center justify-center' },
            RE('div', { className: 'container text-center' },
                RE(Components.Alert, { variant: 'error' }, error),
                RE('div', { className: 'mt-4' },
                    RE(Components.Button, {
                        onClick: () => window.location.href = '/'
                    }, 'Back to Home')
                )
            )
        );
    }

    return RE('div', { className: 'min-h-screen' },
        // Header
        RE('header', { className: 'border-b' },
            RE('div', { className: 'container py-4' },
                RE('div', { className: 'flex items-center justify-between' },
                    RE('div', {},
                        RE('h1', { className: 'text-2xl font-semibold' }, session.title),
                        session.description && RE('p', { 
                            className: 'text-sm text-muted-foreground mt-1' 
                        }, session.description)
                    ),
                    RE('div', { className: 'flex items-center gap-2' },
                        RE(Components.Badge, { variant: 'default' }, 
                            session.mode === 'official' ? 'Official Vote' : 'Casual Vote'
                        )
                    )
                )
            )
        ),

        // Main Content
        RE('main', { className: 'container py-8' },
            RE('div', { className: 'space-y-6' },
                // Alerts
                error && RE(Components.Alert, { variant: 'error' }, error),
                success && RE(Components.Alert, { variant: 'success' }, success),

                // Email Input (Official Mode Only)
                session.mode === 'official' && !success && RE('section', { className: 'card' },
                    RE('div', { className: 'card-header' },
                        RE('h2', { className: 'card-title' }, 'Voter Information')
                    ),
                    RE('div', { className: 'card-content' },
                        RE('div', { className: 'space-y-2' },
                            RE(Components.Label, {}, 'Your Email Address *'),
                            RE(Components.Input, {
                                type: 'email',
                                placeholder: 'your.email@example.com',
                                value: voterEmail,
                                onChange: (e) => setVoterEmail(e.target.value)
                            }),
                            RE('p', { className: 'text-xs text-muted-foreground' },
                                'This email must be on the invited voters list'
                            )
                        )
                    )
                ),

                // Name Input (Casual Mode Only)
                session.mode === 'casual' && !success && RE('section', { className: 'card' },
                    RE('div', { className: 'card-header' },
                        RE('h2', { className: 'card-title' }, 'Voter Information')
                    ),
                    RE('div', { className: 'card-content' },
                        RE('div', { className: 'space-y-2' },
                            RE(Components.Label, {}, 'Your Name (Optional)'),
                            RE(Components.Input, {
                                type: 'text',
                                placeholder: 'Enter your name',
                                value: voterName,
                                onChange: (e) => setVoterName(e.target.value)
                            }),
                            RE('p', { className: 'text-xs text-muted-foreground' },
                                'Optional: Help identify your vote in the results'
                            )
                        )
                    )
                ),

                // Positions and Candidates
                !success && positions.map(position =>
                    RE('section', { 
                        key: position.id,
                        className: 'card'
                    },
                        RE('div', { className: 'card-header' },
                            RE('div', { className: 'flex items-start justify-between' },
                                RE('div', {},
                                    RE('h2', { className: 'card-title' }, position.title),
                                    position.description && RE('p', { 
                                        className: 'text-sm text-muted-foreground mt-1' 
                                    }, position.description)
                                ),
                                RE(Components.Badge, { variant: 'outline' },
                                    `Select ${position.maxSelections} candidate${position.maxSelections > 1 ? 's' : ''}`
                                )
                            )
                        ),
                        RE('div', { className: 'card-content' },
                            RE('div', { className: 'space-y-3' },
                                position.candidates.map(candidate => {
                                    const isSelected = (votes[position.id] || []).includes(candidate.id);
                                    
                                    return RE('div', {
                                        key: candidate.id,
                                        className: `card cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary bg-accent' : 'hover:bg-muted/50'}`,
                                        onClick: () => toggleCandidate(position.id, candidate.id, position.maxSelections)
                                    },
                                        RE('div', { className: 'flex items-center gap-4' },
                                            // Checkbox
                                            RE('div', { className: 'flex-shrink-0' },
                                                RE('input', {
                                                    type: position.maxSelections > 1 ? 'checkbox' : 'radio',
                                                    checked: isSelected,
                                                    onChange: () => {}, // Handled by card click
                                                    className: 'w-5 h-5 cursor-pointer'
                                                })
                                            ),
                                            
                                            // Info
                                            RE('div', { className: 'flex-1 min-w-0' },
                                                RE('div', { className: 'font-semibold text-base' }, 
                                                    candidate.name
                                                ),
                                                candidate.description && RE('p', { 
                                                    className: 'text-sm text-muted-foreground mt-1'
                                                }, candidate.description)
                                            ),
                                            
                                            // Selected indicator
                                            isSelected && RE('div', { 
                                                className: 'flex-shrink-0'
                                            },
                                                RE(Components.Badge, { variant: 'default' }, 'Selected')
                                            )
                                        )
                                    );
                                })
                            )
                        )
                    )
                ),

                // Submit Button
                !success && RE('div', { className: 'flex justify-center' },
                    RE(Components.Button, {
                        onClick: submitVotes,
                        disabled: submitting,
                        className: 'btn-lg'
                    }, submitting ? 'Submitting...' : 'Submit My Vote')
                )
            )
        )
    );
}

// Render app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(RE(VotingPage));
