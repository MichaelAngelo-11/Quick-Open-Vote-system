// Home Page - Landing page for Quick-Open Vote

const { useState } = React;

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

  return RE('div', { className: 'min-h-screen flex items-center justify-center' },
    RE('div', { className: 'container' },
      RE('div', { className: 'text-center space-y-8' },
        // Hero section
        RE('div', { className: 'space-y-4' },
          RE('h1', { 
            className: 'text-3xl md:text-4xl font-bold',
            style: { fontSize: '3rem' }
          }, 'Quick-Open Vote'),
          RE('p', { 
            className: 'text-xl text-muted-foreground'
          }, 'Democratic Voting Made Simple')
        ),
        
        // Main action buttons
        RE('div', { 
          className: 'flex flex-col sm:flex-row gap-4 items-center justify-center',
          style: { marginTop: '3rem' }
        },
          RE(Components.Button, {
            onClick: handleCreate,
            className: 'btn btn-primary btn-lg',
            style: { width: 'fit-content' }
          }, 'Create Voting Session'),
          
          RE(Components.Button, {
            onClick: () => setShowJoinDialog(true),
            className: 'btn btn-outline btn-lg',
            style: { width: 'fit-content' }
          }, 'Join Voting Session')
        ),
        
        // Feature cards
        RE('div', { 
          className: 'grid md:grid-cols-2 gap-6',
          style: { marginTop: '4rem', maxWidth: '600px', margin: '4rem auto 0' }
        },
          RE('div', { className: 'card' },
            RE('div', { className: 'card-content p-6 text-center' },
              RE('h3', { className: 'font-semibold mb-2' }, 'Official Mode'),
              RE('p', { className: 'text-sm text-muted-foreground' }, 
                'Private voting with email invitations'
              )
            )
          ),
          RE('div', { className: 'card' },
            RE('div', { className: 'card-content p-6 text-center' },
              RE('h3', { className: 'font-semibold mb-2' }, 'Casual Mode'),
              RE('p', { className: 'text-sm text-muted-foreground' }, 
                'Open voting with shareable codes'
              )
            )
          )
        )
      )
    ),
    
    // Join dialog
    showJoinDialog && RE('div', {},
      RE('div', { 
        className: 'dialog-overlay',
        onClick: () => setShowJoinDialog(false)
      }),
      RE('div', { className: 'dialog-content' },
        RE('div', { className: 'dialog-header' },
          RE('h2', { className: 'dialog-title' }, 'Join Voting Session'),
          RE('p', { className: 'dialog-description' }, 
            'Enter the session code to participate'
          )
        ),
        RE('div', { className: 'dialog-body' },
          RE(FormGroup, { label: 'Session Code' },
            RE(Input, {
              type: 'text',
              placeholder: 'Enter code...',
              value: joinCode,
              onChange: (e) => setJoinCode(e.target.value.toUpperCase()),
              onKeyPress: (e) => e.key === 'Enter' && handleJoin(),
              autoFocus: true
            })
          )
        ),
        RE('div', { className: 'dialog-footer' },
          RE(Components.Button, {
            onClick: () => setShowJoinDialog(false),
            className: 'btn btn-outline'
          }, 'Cancel'),
          RE(Components.Button, {
            onClick: handleJoin,
            className: 'btn btn-primary',
            disabled: !joinCode.trim()
          }, 'Join Session')
        )
      )
    )
  );
}

// Render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(RE(HomePage));
