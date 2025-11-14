const { useState, useEffect } = React;

// Create Voting Session - Single page form
function CreateSessionPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [sessionData, setSessionData] = useState({
        title: '',
        description: '',
        mode: 'casual',
        resultDisplay: 'after-closes',
        positions: [{
            id: Date.now().toString(),
            title: '',
            description: '',
            maxSelections: 1,
            candidates: []
        }],
        invitedEmails: []
    });

    const [emailInput, setEmailInput] = useState('');
    const fileInputRef = React.useRef(null);

    // Email handling - split by newlines and commas
    const addEmailsFromText = () => {
        if (!emailInput.trim()) return;

        const emails = emailInput
            .split(/[\n,]+/)
            .map(e => e.trim())
            .filter(e => e.length > 0);

        const validEmails = emails.filter(utils.isValidEmail);
        const invalidEmails = emails.filter(e => !utils.isValidEmail(e));

        if (invalidEmails.length > 0) {
            setError(`Invalid emails found: ${invalidEmails.join(', ')}`);
            return;
        }

        const uniqueEmails = [...new Set([...sessionData.invitedEmails, ...validEmails])];
        setSessionData({ ...sessionData, invitedEmails: uniqueEmails });
        setEmailInput('');
        setError('');
        setSuccess(`Added ${validEmails.length} email(s)`);
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleCSVUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            setError('Please upload a CSV file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split('\n');
            const emails = [];

            lines.forEach((line, index) => {
                // Skip header row (common CSV header names)
                if (index === 0 && /email|mail|address/i.test(line)) {
                    return;
                }

                const parts = line.split(/[,\t]/);
                parts.forEach(part => {
                    const email = part.trim();
                    if (email && utils.isValidEmail(email)) {
                        emails.push(email);
                    }
                });
            });

            if (emails.length === 0) {
                setError('No valid emails found in CSV file');
                return;
            }

            const uniqueEmails = [...new Set([...sessionData.invitedEmails, ...emails])];
            setSessionData({ ...sessionData, invitedEmails: uniqueEmails });
            setError('');
            setSuccess(`Imported ${emails.length} email(s) from CSV`);
            setTimeout(() => setSuccess(''), 3000);
        };

        reader.onerror = () => {
            setError('Failed to read CSV file');
        };

        reader.readAsText(file);
        event.target.value = '';
    };

    const removeEmail = (email) => {
        setSessionData({
            ...sessionData,
            invitedEmails: sessionData.invitedEmails.filter(e => e !== email)
        });
    };

    const addCandidate = (positionIndex) => {
        const updated = [...sessionData.positions];
        updated[positionIndex].candidates.unshift({
            id: Date.now().toString(),
            name: '',
            description: '',
            photoUrl: ''
        });
        setSessionData({ ...sessionData, positions: updated });
        utils.focusElement(`[data-candidate-name="${positionIndex}-0"]`);
    };

    const updateCandidate = (positionIndex, candidateIndex, field, value) => {
        const updated = [...sessionData.positions];
        updated[positionIndex].candidates[candidateIndex] = {
            ...updated[positionIndex].candidates[candidateIndex],
            [field]: value
        };
        setSessionData({ ...sessionData, positions: updated });
    };

    const removeCandidate = (positionIndex, candidateIndex) => {
        const updated = [...sessionData.positions];
        updated[positionIndex].candidates = updated[positionIndex].candidates.filter((_, i) => i !== candidateIndex);
        setSessionData({ ...sessionData, positions: updated });
    };

    const addPosition = () => {
        const newPosition = {
            id: Date.now().toString(),
            title: '',
            description: '',
            maxSelections: 1,
            candidates: []
        };
        setSessionData({
            ...sessionData,
            positions: [...sessionData.positions, newPosition]
        });
        const newPositionIndex = sessionData.positions.length;
        utils.focusElement(`[data-position-title="${newPositionIndex}"]`);
    };

    const updatePosition = (index, field, value) => {
        const updated = [...sessionData.positions];
        updated[index] = { ...updated[index], [field]: value };
        setSessionData({ ...sessionData, positions: updated });
    };

    const removePosition = (index) => {
        if (sessionData.positions.length > 1) {
            setSessionData({
                ...sessionData,
                positions: sessionData.positions.filter((_, i) => i !== index)
            });
        }
    };

    const createSession = async () => {
        setError('');
        
        if (!sessionData.title.trim()) {
            setError('Please enter a session title');
            return;
        }
        if (sessionData.mode === 'official' && sessionData.invitedEmails.length === 0) {
            setError('Official mode requires at least one invited email');
            return;
        }
        if (sessionData.positions.length === 0) {
            setError('Please add at least one position');
            return;
        }
        
        // Each position needs title, 2+ candidates with names
        const allPositionsValid = sessionData.positions.every(pos => 
            pos.title.trim() && pos.candidates.length >= 2 && 
            pos.candidates.every(c => c.name.trim())
        );

        if (!allPositionsValid) {
            setError('Each position must have a title and at least 2 candidates with names');
            return;
        }

        setLoading(true);

        try {
            const data = await utils.api.post('/sessions', {
                ...sessionData,
                positions: sessionData.positions.map(pos => ({
                    title: pos.title,
                    description: pos.description,
                    maxSelections: pos.maxSelections,
                    candidates: pos.candidates.filter(c => c.name.trim())
                }))
            });

            if (!data.sessionId) {
                throw new Error(data.error || 'Failed to create session');
            }

            window.location.href = `/admin.html?code=${data.adminCode}`;
            
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return React.createElement('div', { className: 'min-h-screen' },
        // Header
        React.createElement('header', { className: 'border-b' },
            React.createElement('div', { className: 'container py-4' },
                React.createElement('div', { className: 'flex items-center justify-between' },
                    React.createElement('h1', { className: 'text-2xl font-semibold' }, 'Create Voting Session'),
                    React.createElement('a', { 
                        href: '/',
                        className: 'text-sm text-muted-foreground hover:text-foreground'
                    }, '← Back to Home')
                )
            )
        ),

        // Main Content
        React.createElement('main', { className: 'container py-8' },
            React.createElement('div', { className: 'space-y-6' },
                // Alerts
                error && React.createElement(Components.Alert, { variant: 'error' }, error),
                success && React.createElement(Components.Alert, { variant: 'success' }, success),

                // Session Details Section
                React.createElement('section', { className: 'card' },
                    React.createElement('div', { className: 'card-header' },
                        React.createElement('h2', { className: 'card-title' }, 'Session Details')
                    ),
                    React.createElement('div', { className: 'card-content space-y-4' },
                        // Title
                        React.createElement(Components.FormGroup, { label: 'Session Title', required: true },
                            React.createElement(Components.Input, {
                                type: 'text',
                                placeholder: 'e.g., Student Council Elections 2024',
                                value: sessionData.title,
                                onChange: (e) => {
                                    setError('');
                                    setSessionData({ ...sessionData, title: e.target.value });
                                }
                            })
                        ),

                        // Description
                        React.createElement(Components.FormGroup, { label: 'Description (Optional)' },
                            React.createElement(Components.Input, {
                                type: 'text',
                                placeholder: 'Describe the purpose of this voting session...',
                                value: sessionData.description,
                                onChange: (e) => setSessionData({ ...sessionData, description: e.target.value })
                            })
                        ),

                        // Mode Selection
                        React.createElement(Components.FormGroup, { label: 'Voting Mode', required: true },
                            React.createElement('div', { className: 'grid md:grid-cols-2 gap-4' },
                                // Casual Mode
                                React.createElement('div', {
                                    className: `radio-item ${sessionData.mode === 'casual' ? 'selected' : ''}`,
                                    onClick: () => setSessionData({ ...sessionData, mode: 'casual' })
                                },
                                    React.createElement('input', {
                                        type: 'radio',
                                        name: 'mode',
                                        checked: sessionData.mode === 'casual',
                                        onChange: () => setSessionData({ ...sessionData, mode: 'casual' })
                                    }),
                                    React.createElement('div', {},
                                        React.createElement('div', { className: 'font-semibold flex items-center gap-2' }, 
                                            'Casual Mode',
                                            React.createElement(Components.Badge, { variant: 'secondary' }, 'Quick & Easy')
                                        ),
                                        React.createElement('p', { className: 'text-sm text-muted-foreground' }, 
                                            'Anyone with the code can vote. Perfect for quick polls.'
                                        )
                                    )
                                ),
                                
                                // Official Mode
                                React.createElement('div', {
                                    className: `radio-item ${sessionData.mode === 'official' ? 'selected' : ''}`,
                                    onClick: () => setSessionData({ ...sessionData, mode: 'official' })
                                },
                                    React.createElement('input', {
                                        type: 'radio',
                                        name: 'mode',
                                        checked: sessionData.mode === 'official',
                                        onChange: () => setSessionData({ ...sessionData, mode: 'official' })
                                    }),
                                    React.createElement('div', {},
                                        React.createElement('div', { className: 'font-semibold flex items-center gap-2' }, 
                                            'Official Mode',
                                            React.createElement(Components.Badge, { variant: 'default' }, 'Secure')
                                        ),
                                        React.createElement('p', { className: 'text-sm text-muted-foreground' }, 
                                            'Only invited voters can participate. Best for elections.'
                                        )
                                    )
                                )
                            )
                        ),

                        // Result Display Option
                        React.createElement(Components.FormGroup, { label: 'Results Display', required: true },
                            React.createElement('div', { className: 'grid md:grid-cols-2 gap-4' },
                                // Real-time Results
                                React.createElement('div', {
                                    className: `radio-item ${sessionData.resultDisplay === 'realtime' ? 'selected' : ''}`,
                                    onClick: () => setSessionData({ ...sessionData, resultDisplay: 'realtime' })
                                },
                                    React.createElement('input', {
                                        type: 'radio',
                                        name: 'resultDisplay',
                                        checked: sessionData.resultDisplay === 'realtime',
                                        onChange: () => setSessionData({ ...sessionData, resultDisplay: 'realtime' })
                                    }),
                                    React.createElement('div', {},
                                        React.createElement('div', { className: 'font-semibold' }, 'Real-time Results'),
                                        React.createElement('p', { className: 'text-sm text-muted-foreground' }, 
                                            'Results visible while voting is active'
                                        )
                                    )
                                ),
                                
                                // After Closes
                                React.createElement('div', {
                                    className: `radio-item ${sessionData.resultDisplay === 'after-closes' ? 'selected' : ''}`,
                                    onClick: () => setSessionData({ ...sessionData, resultDisplay: 'after-closes' })
                                },
                                    React.createElement('input', {
                                        type: 'radio',
                                        name: 'resultDisplay',
                                        checked: sessionData.resultDisplay === 'after-closes',
                                        onChange: () => setSessionData({ ...sessionData, resultDisplay: 'after-closes' })
                                    }),
                                    React.createElement('div', {},
                                        React.createElement('div', { className: 'font-semibold' }, 'After Voting Closes'),
                                        React.createElement('p', { className: 'text-sm text-muted-foreground' }, 
                                            'Results only visible after session closes'
                                        )
                                    )
                                )
                            )
                        ),

                        // Email Import (Official Mode Only)
                        sessionData.mode === 'official' && React.createElement('div', { className: 'space-y-4' },
                            React.createElement('div', { className: 'separator' }),
                            
                            React.createElement('h3', { className: 'text-lg font-semibold' }, 'Invited Voters'),
                            
                            // Text Input
                            React.createElement(Components.FormGroup, { 
                                label: 'Paste Emails',
                                helpText: 'Enter one email per line'
                            },
                                React.createElement(Components.Input, {
                                    type: 'text',
                                    placeholder: 'voter1@example.com, voter2@example.com, voter3@example.com',
                                    value: emailInput,
                                    onChange: (e) => setEmailInput(e.target.value)
                                }),
                                React.createElement('div', { className: 'flex gap-2 mt-2' },
                                    React.createElement(Components.Button, {
                                        variant: 'secondary',
                                        onClick: addEmailsFromText,
                                        disabled: !emailInput.trim(),
                                        className: 'btn-sm'
                                    }, 'Add Emails')
                                )
                            ),

                            // CSV Upload
                            React.createElement('div', {},
                                React.createElement('input', {
                                    ref: fileInputRef,
                                    type: 'file',
                                    accept: '.csv',
                                    onChange: handleCSVUpload,
                                    style: { display: 'none' }
                                }),
                                React.createElement('div', {
                                    className: 'file-upload',
                                    onClick: () => fileInputRef.current?.click()
                                },
                                    React.createElement('div', { className: 'text-center' },
                                        React.createElement('p', { className: 'text-sm font-medium' }, 'Import from CSV'),
                                        React.createElement('p', { className: 'text-xs text-muted-foreground mt-1' }, 
                                            'Click to browse or drag and drop'
                                        )
                                    )
                                )
                            ),

                            // Email List
                            sessionData.invitedEmails.length > 0 && React.createElement('div', {},
                                React.createElement('p', { className: 'text-sm font-medium mb-2' }, 
                                    `${sessionData.invitedEmails.length} voter(s) invited`
                                ),
                                React.createElement('div', { className: 'flex flex-wrap gap-2' },
                                    sessionData.invitedEmails.map(email =>
                                        React.createElement('span', { 
                                            key: email,
                                            className: 'tag'
                                        },
                                            email,
                                            React.createElement('button', {
                                                onClick: () => removeEmail(email),
                                                className: 'tag-remove'
                                            }, '×')
                                        )
                                    )
                                )
                            )
                        )
                    )
                ),

                // Positions & Candidates Section
                React.createElement('section', { className: 'card' },
                    React.createElement('div', { className: 'card-header' },
                        React.createElement('h2', { className: 'card-title' }, 'Positions & Candidates'),
                        React.createElement('p', { className: 'text-sm text-muted-foreground mt-1' }, 
                            'Add positions and candidates for each position. Each position needs at least 2 candidates.'
                        )
                    ),
                    React.createElement('div', { className: 'card-content space-y-6' },
                        // Positions List
                        sessionData.positions.map((position, positionIndex) =>
                            React.createElement('div', { 
                                key: position.id,
                                className: 'panel'
                            },
                                // Position Header
                                React.createElement('div', { className: 'panel-header flex justify-between items-start' },
                                    React.createElement('h4', { className: 'font-semibold text-lg' }, 
                                        `Position ${positionIndex + 1}`
                                    ),
                                    sessionData.positions.length > 1 && React.createElement(Components.Button, {
                                        variant: 'ghost',
                                        className: 'btn-sm',
                                        onClick: () => removePosition(positionIndex)
                                    }, 'Remove Position')
                                ),
                                
                                React.createElement('div', { className: 'panel-content space-y-4' },
                                    // Position Details
                                    React.createElement('div', { className: 'grid md:grid-cols-3 gap-3' },
                                        React.createElement('div', { className: 'space-y-2' },
                                            React.createElement(Components.Label, {}, 'Position Title *'),
                                            React.createElement(Components.Input, {
                                                type: 'text',
                                                placeholder: 'e.g., President, Treasurer',
                                                value: position.title,
                                                onChange: (e) => updatePosition(positionIndex, 'title', e.target.value),
                                                required: true,
                                                'data-position-title': positionIndex
                                            })
                                        ),
                                        React.createElement('div', { className: 'space-y-2' },
                                            React.createElement(Components.Label, {}, 'Seats Available'),
                                            React.createElement(Components.Input, {
                                                type: 'number',
                                                min: 1,
                                                value: position.maxSelections,
                                                onChange: (e) => updatePosition(positionIndex, 'maxSelections', parseInt(e.target.value) || 1)
                                            })
                                        ),
                                        React.createElement('div', { className: 'space-y-2' },
                                            React.createElement(Components.Label, {}, 'Description'),
                                            React.createElement(Components.Input, {
                                                type: 'text',
                                                placeholder: 'Position description',
                                                value: position.description,
                                                onChange: (e) => updatePosition(positionIndex, 'description', e.target.value)
                                            })
                                        )
                                    ),

                                    // Candidates Section
                                    React.createElement('div', { className: 'space-y-3' },
                                        React.createElement('div', { className: 'flex justify-end items-center' },
                                            React.createElement(Components.Button, {
                                                variant: 'outline',
                                                className: 'btn-sm',
                                                onClick: () => addCandidate(positionIndex)
                                            }, '+ Add Candidate')
                                        ),
                                        
                                        // Candidates List
                                        position.candidates.map((candidate, candidateIndex) =>
                                            React.createElement('div', { 
                                                key: candidate.id,
                                                className: 'card space-y-3'
                                            },
                                                React.createElement('div', { className: 'flex justify-between items-start' },
                                                    React.createElement('h5', { className: 'font-medium' }, 
                                                        `Candidate ${position.candidates.length - candidateIndex}`
                                                    ),
                                                    React.createElement(Components.Button, {
                                                        variant: 'ghost',
                                                        className: 'btn-sm',
                                                        onClick: () => removeCandidate(positionIndex, candidateIndex)
                                                    }, 'Remove')
                                                ),
                                                React.createElement('div', { className: 'grid md:grid-cols-2 gap-3' },
                                                    React.createElement('div', { className: 'space-y-2' },
                                                        React.createElement(Components.Label, {}, 'Name *'),
                                                        React.createElement(Components.Input, {
                                                            type: 'text',
                                                            placeholder: 'Candidate name',
                                                            value: candidate.name,
                                                            onChange: (e) => updateCandidate(positionIndex, candidateIndex, 'name', e.target.value),
                                                            required: true,
                                                            'data-candidate-name': `${positionIndex}-${candidateIndex}`
                                                        })
                                                    ),
                                                    React.createElement('div', { className: 'space-y-2' },
                                                        React.createElement(Components.Label, {}, 'Image URL'),
                                                        React.createElement(Components.Input, {
                                                            type: 'url',
                                                            placeholder: 'https://example.com/image.jpg',
                                                            value: candidate.photoUrl,
                                                            onChange: (e) => updateCandidate(positionIndex, candidateIndex, 'photoUrl', e.target.value)
                                                        })
                                                    )
                                                ),
                                                React.createElement('div', { className: 'space-y-2' },
                                                    React.createElement(Components.Label, {}, 'Bio'),
                                                    React.createElement(Components.Input, {
                                                        type: 'text',
                                                        placeholder: 'Candidate description',
                                                        value: candidate.description,
                                                        onChange: (e) => updateCandidate(positionIndex, candidateIndex, 'description', e.target.value)
                                                    })
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        ),
                        
                        // Add Position Button
                        React.createElement(Components.Button, {
                            variant: 'outline',
                            className: 'w-full',
                            onClick: addPosition
                        }, '+ Add Position')
                    )
                ),

                // Create Button
                React.createElement('div', { className: 'flex justify-end gap-4' },
                    React.createElement(Components.Button, {
                        variant: 'outline',
                        onClick: () => window.location.href = '/'
                    }, 'Cancel'),
                    React.createElement(Components.Button, {
                        onClick: createSession,
                        disabled: loading || !sessionData.title.trim() || sessionData.positions.length === 0,
                        className: 'btn-lg'
                    }, loading ? 'Creating...' : 'Create Session')
                )
            )
        )
    );
}

// ============================================
// RENDER APP
// ============================================
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(CreateSessionPage));
