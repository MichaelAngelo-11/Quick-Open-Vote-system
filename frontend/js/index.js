// Landing page for the Quick-Open Vote system

const {useState} = React;

const RE = React.createElement;

function HomePage() {
    const [showJoinDialog, setShowJoinDialog] = useState(false);
    const [joinCode, setJoinCode] = useState('');

    const handleJoin = () => {
        const code = joinCode.trim();
        if (!code) return;
        window.location.href = `vote.html?code=${code}`;
    };

    const handleCreate = () => {
        window.location.href = 'create.html';
    };

    return RE('div', {className: 'min-h-screen flex items-center justify-center'},
        RE('div', {className: 'container'},
            RE('div', {className: 'text-center space-y-8'},
                // Title and subtitle
                RE('div', {className: 'space-y-4'},
                    RE('h1', {
                        className: 'text-3xl md:text-4xl font-bold',
                        style: {fontSize: '3rem'}
                    }, 'Quick-Open Vote'),
                    RE('p', {
                        className: 'text-xl text-muted-foreground'
                    }, 'Democratic Voting Made Simple')
                ),

                // Action buttons
                RE('div', {
                        className: 'flex flex-col sm:flex-row gap-4 items-center justify-center',
                        style: {marginTop: '3rem'}
                    },
                    RE(Components.Button, {
                        onClick: handleCreate,
                        className: 'btn btn-primary btn-lg',
                        style: {width: '250px'}
                    }, 'Create Voting Session'),

                    RE(Components.Button, {
                        onClick: () => setShowJoinDialog(true),
                        className: 'btn btn-outline btn-lg',
                        style: {width: '250px'}
                    }, 'Join Voting Session')
                ),

                // Show different voting modes available
                RE('div', {
                        className: 'grid md:grid-cols-2 gap-6',
                        style: {marginTop: '4rem', maxWidth: '600px', margin: '4rem auto 0'}
                    },
                    RE('div', {className: 'card'},
                        RE('div', {className: 'card-content p-6 text-center'},
                            RE('h3', {className: 'font-semibold mb-2'}, 'Official Mode'),
                            RE('p', {className: 'text-sm text-muted-foreground'},
                                'Private voting with email invitations'
                            )
                        )
                    ),
                    RE('div', {className: 'card'},
                        RE('div', {className: 'card-content p-6 text-center'},
                            RE('h3', {className: 'font-semibold mb-2'}, 'Casual Mode'),
                            RE('p', {className: 'text-sm text-muted-foreground'},
                                'Open voting with shareable codes'
                            )
                        )
                    )
                )
            )
        ),

        // Modal dialog for joining a session
        showJoinDialog && RE('div', {
                className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
                onClick: () => setShowJoinDialog(false)
            },
            RE('div', {
                    className: 'bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg modal-content',
                    onClick: (e) => e.stopPropagation()
                },
                RE('div', {className: 'mb-4'},
                    RE('h2', {className: 'text-xl font-bold'}, 'Join Voting Session'),
                    RE('p', {className: 'text-sm text-muted-foreground mt-1'},
                        'Enter the session code to participate'
                    )
                ),
                RE('div', {className: 'mb-6'},
                    RE(Components.FormGroup, {label: 'Session Code'},
                        RE(Components.Input, {
                            type: 'text',
                            placeholder: 'Enter code...',
                            value: joinCode,
                            onChange: (e) => setJoinCode(e.target.value.toUpperCase()),
                            onKeyPress: (e) => e.key === 'Enter' && handleJoin(),
                            autoFocus: true
                        })
                    )
                ),
                RE('div', {className: 'flex justify-end gap-2'},
                    RE(Components.Button, {
                        onClick: () => setShowJoinDialog(false),
                        variant: 'outline'
                    }, 'Cancel'),
                    RE(Components.Button, {
                        onClick: handleJoin,
                        disabled: !joinCode.trim()
                    }, 'Join Session')
                )
            )
        )
    );
}

// Mount and render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(RE(HomePage));
