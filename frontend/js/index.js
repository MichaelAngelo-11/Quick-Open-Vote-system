// Home Page - Landing page for Quick-Open Vote

const { useState } = React;

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

  return React.createElement('div', { className: 'min-h-screen flex items-center justify-center' },
    React.createElement('div', { className: 'container' },
      React.createElement('div', { className: 'text-center space-y-8' },
        // Hero section
        React.createElement('div', { className: 'space-y-4' },
          React.createElement('h1', { 
            className: 'text-3xl md:text-4xl font-bold',
            style: { fontSize: '3rem' }
          }, 'Quick-Open Vote'),
          React.createElement('p', { 
            className: 'text-xl text-muted-foreground'
          }, 'Democratic Voting Made Simple')
        ),
        
        // Main action buttons
        React.createElement('div', { 
          className: 'flex flex-col sm:flex-row gap-4 items-center justify-center',
          style: { marginTop: '3rem' }
        },
          React.createElement(Components.Button, {
            onClick: handleCreate,
            className: 'btn btn-primary btn-lg',
            style: { width: 'fit-content' }
          }, 'Create Voting Session'),
          
          React.createElement(Components.Button, {
            onClick: () => setShowJoinDialog(true),
            className: 'btn btn-outline btn-lg',
            style: { width: 'fit-content' }
          }, 'Join Voting Session')
        ),
        
        // Feature cards
        React.createElement('div', { 
          className: 'grid md:grid-cols-2 gap-6',
          style: { marginTop: '4rem', maxWidth: '600px', margin: '4rem auto 0' }
        },
          React.createElement('div', { className: 'card' },
            React.createElement('div', { className: 'card-content p-6 text-center' },
              React.createElement('h3', { className: 'font-semibold mb-2' }, 'Official Mode'),
              React.createElement('p', { className: 'text-sm text-muted-foreground' }, 
                'Private voting with email invitations'
              )
            )
          ),
          React.createElement('div', { className: 'card' },
            React.createElement('div', { className: 'card-content p-6 text-center' },
              React.createElement('h3', { className: 'font-semibold mb-2' }, 'Casual Mode'),
              React.createElement('p', { className: 'text-sm text-muted-foreground' }, 
                'Open voting with shareable codes'
              )
            )
          )
        )
      )
    ),
    
    // Join dialog
    showJoinDialog && React.createElement('div', {},
      React.createElement('div', { 
        className: 'dialog-overlay',
        onClick: () => setShowJoinDialog(false)
      }),
      React.createElement('div', { className: 'dialog-content' },
        React.createElement('div', { className: 'dialog-header' },
          React.createElement('h2', { className: 'dialog-title' }, 'Join Voting Session'),
          React.createElement('p', { className: 'dialog-description' }, 
            'Enter the session code to participate'
          )
        ),
        React.createElement('div', { className: 'dialog-body' },
          React.createElement(FormGroup, { label: 'Session Code' },
            React.createElement(Input, {
              type: 'text',
              placeholder: 'Enter code...',
              value: joinCode,
              onChange: (e) => setJoinCode(e.target.value.toUpperCase()),
              onKeyPress: (e) => e.key === 'Enter' && handleJoin(),
              autoFocus: true
            })
          )
        ),
        React.createElement('div', { className: 'dialog-footer' },
          React.createElement(Components.Button, {
            onClick: () => setShowJoinDialog(false),
            className: 'btn btn-outline'
          }, 'Cancel'),
          React.createElement(Components.Button, {
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
root.render(React.createElement(HomePage));
