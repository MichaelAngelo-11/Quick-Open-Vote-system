const { useState, useEffect } = React;

// Admin Dashboard - Manage voting session, view results, control voters

// Email Import Modal Component
function EmailImportModal({ isOpen, onClose, onImport }) {
    const [emails, setEmails] = useState('');
    const [previewEmails, setPreviewEmails] = useState([]);
    const [activeSubTab, setActiveSubTab] = useState('paste');

    const handleEmailInput = (value) => {
        setEmails(value);
        const emailList = value
            .split(/[\s,\n]+/)
            .filter(email => email && email.includes('@'))
            .map(email => email.trim());
        setPreviewEmails(emailList);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result;
                handleEmailInput(content);
            };
            reader.readAsText(file);
        }
    };

    const handleImport = () => {
        if (previewEmails.length > 0) {
            onImport(previewEmails);
            setEmails('');
            setPreviewEmails([]);
            onClose();
        }
    };

    if (!isOpen) return null;

    return React.createElement('div', {
            className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
            onClick: onClose
        },
        React.createElement('div', {
                className: 'bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-lg modal-content',
                onClick: (e) => e.stopPropagation()
            },
            React.createElement('h2', { className: 'text-2xl font-bold mb-2' }, 'Import Voter Emails'),
            React.createElement('p', { className: 'text-gray-600 mb-4' },
                'Upload a CSV file or paste email addresses to invite voters.'
            ),

            // Tab Navigation
            React.createElement('div', { className: 'flex gap-2 border-b mb-4' },
                React.createElement(Components.Button, {
                    variant: activeSubTab === 'paste' ? 'default' : 'ghost',
                    onClick: () => setActiveSubTab('paste'),
                    className: 'flex-1'
                }, 'Paste Emails'),
                React.createElement(Components.Button, {
                    variant: activeSubTab === 'upload' ? 'default' : 'ghost',
                    onClick: () => setActiveSubTab('upload'),
                    className: 'flex-1'
                }, 'Upload CSV')
            ),

            // Tab Content
            activeSubTab === 'paste' && React.createElement('div', { className: 'space-y-4 mb-4' },
                React.createElement(Components.Label, null, 'Email Addresses'),
                React.createElement('textarea', {
                    className: 'w-full p-3 border rounded-lg',
                    placeholder: 'Enter email addresses separated by commas, spaces, or new lines',
                    value: emails,
                    onChange: (e) => handleEmailInput(e.target.value),
                    rows: 6
                })
            ),

            activeSubTab === 'upload' && React.createElement('div', { className: 'mb-4' },
                React.createElement('div', { className: 'border-2 border-dashed border-gray-300 rounded-lg p-6 text-center' },
                    React.createElement('label', {
                            htmlFor: 'file-upload',
                            className: 'cursor-pointer'
                        },
                        React.createElement('span', { className: 'text-sm font-medium text-gray-900 block mb-1' },
                            'Click to upload CSV file'
                        ),
                        React.createElement('input', {
                            id: 'file-upload',
                            type: 'file',
                            className: 'hidden',
                            accept: '.csv,.txt',
                            onChange: handleFileUpload
                        }),
                        React.createElement('p', { className: 'text-xs text-gray-500' },
                            'CSV with one email per line or comma-separated'
                        )
                    )
                )
            ),

            // Preview
            previewEmails.length > 0 && React.createElement('div', { className: 'space-y-2 mb-4' },
                React.createElement(Components.Label, null, `Preview (${previewEmails.length} emails)`),
                React.createElement('div', { className: 'max-h-32 overflow-y-auto border rounded-md p-2' },
                    React.createElement('div', { className: 'flex flex-wrap gap-1' },
                        previewEmails.map((email, index) =>
                            React.createElement(Components.Badge, {
                                key: index,
                                variant: 'secondary',
                                className: 'text-xs'
                            }, email)
                        )
                    )
                )
            ),

            // Actions
            React.createElement('div', { className: 'flex justify-end gap-2' },
                React.createElement(Components.Button, {
                    variant: 'outline',
                    onClick: onClose
                }, 'Cancel'),
                React.createElement(Components.Button, {
                    onClick: handleImport,
                    disabled: previewEmails.length === 0
                }, `Import ${previewEmails.length} Emails`)
            )
        )
    );
}

// ============================================
// EDIT VOTER MODAL
// ============================================
function EditVoterModal({ voter, onClose, onSave }) {
    const [email, setEmail] = useState(voter?.email || '');

    if (!voter) return null;

    return React.createElement('div', {
            className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
            onClick: onClose
        },
        React.createElement('div', {
                className: 'bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg modal-content',
                onClick: (e) => e.stopPropagation()
            },
            React.createElement('h2', { className: 'text-2xl font-bold mb-2 text-gray-900' }, 'Edit Voter Email'),
            React.createElement('p', { className: 'text-gray-600 mb-4' },
                'Update the email address for this voter.'
            ),
            React.createElement('div', { className: 'space-y-4 mb-6' },
                React.createElement(Components.Label, null, 'Email Address'),
                React.createElement(Components.Input, {
                    type: 'email',
                    value: email,
                    onChange: (e) => setEmail(e.target.value),
                    placeholder: 'Enter new email address'
                })
            ),
            React.createElement('div', { className: 'flex gap-2' },
                React.createElement(Components.Button, {
                    onClick: () => onSave(email),
                    className: 'flex-1'
                }, 'Save Changes'),
                React.createElement(Components.Button, {
                    variant: 'outline',
                    onClick: onClose,
                    className: 'flex-1'
                }, 'Cancel')
            )
        )
    );
}

// Candidate Modal - Add/Edit candidate details
function CandidateModal({ isOpen, onClose, candidate, positions, onSave }) {
    const [formData, setFormData] = useState({
        name: candidate?.name || '',
        bio: candidate?.description || '',
        imageUrl: candidate?.photoUrl || '',
        positionId: candidate?.positionId || ''
    });

    const isEditing = !!candidate;

    const handleSubmit = () => {
        if (!formData.name.trim() || (!isEditing && !formData.positionId)) {
            alert('Please provide candidate name' + (!isEditing ? ' and select a position' : ''));
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return React.createElement('div', {
            className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
            onClick: onClose
        },
        React.createElement('div', {
                className: 'bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg modal-content',
                onClick: (e) => e.stopPropagation()
            },
            React.createElement('h2', { className: 'text-2xl font-bold mb-2 text-gray-900' },
                isEditing ? 'Edit Candidate' : 'Add New Candidate'
            ),
            React.createElement('p', { className: 'text-gray-600 mb-4' }, 'Enter candidate details below'),

            React.createElement('div', { className: 'space-y-4 mb-6' },
                !isEditing && React.createElement('div', null,
                    React.createElement(Components.Label, null, 'Position *'),
                    React.createElement('select', {
                            className: 'w-full mt-1 p-2 border rounded-md',
                            value: formData.positionId,
                            onChange: (e) => setFormData({ ...formData, positionId: e.target.value })
                        },
                        React.createElement('option', { value: '' }, 'Select a position'),
                        positions?.map(pos =>
                            React.createElement('option', { key: pos.id, value: pos.id }, pos.title)
                        )
                    )
                ),
                React.createElement('div', null,
                    React.createElement(Components.Label, null, 'Name *'),
                    React.createElement(Components.Input, {
                        value: formData.name,
                        onChange: (e) => setFormData({ ...formData, name: e.target.value }),
                        placeholder: 'Candidate name'
                    })
                ),
                React.createElement('div', null,
                    React.createElement(Components.Label, null, 'Bio'),
                    React.createElement('textarea', {
                        className: 'w-full p-3 border rounded-lg',
                        value: formData.bio,
                        onChange: (e) => setFormData({ ...formData, bio: e.target.value }),
                        placeholder: 'Brief biography',
                        rows: 3
                    })
                ),
                React.createElement('div', null,
                    React.createElement(Components.Label, null, 'Image URL'),
                    React.createElement(Components.Input, {
                        value: formData.imageUrl,
                        onChange: (e) => setFormData({ ...formData, imageUrl: e.target.value }),
                        placeholder: 'https://example.com/image.jpg'
                    })
                )
            ),

            React.createElement('div', { className: 'flex gap-2' },
                React.createElement(Components.Button, {
                    variant: 'outline',
                    onClick: onClose,
                    className: 'flex-1'
                }, 'Cancel'),
                React.createElement(Components.Button, {
                    onClick: handleSubmit,
                    className: 'flex-1'
                }, isEditing ? 'Save Changes' : 'Add Candidate')
            )
        )
    );
}

// Admin Dashboard - Main session management interface
function AdminDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [session, setSession] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [activeTab, setActiveTab] = useState('settings');
    const [copied, setCopied] = useState(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [showAdminLink, setShowAdminLink] = useState(false);

    // Candidate CRUD state
    const [candidateModalOpen, setCandidateModalOpen] = useState(false);
    const [editingCandidate, setEditingCandidate] = useState(null);

    // Voter management state
    const [isImportingVoters, setIsImportingVoters] = useState(false);
    const [voterSearch, setVoterSearch] = useState('');
    const [editingVoter, setEditingVoter] = useState(null);

    // Get admin code from URL
    const params = utils.getUrlParams();
    const adminCode = params.code;

    useEffect(() => {
        if (!adminCode) {
            setError('No admin code provided');
            setLoading(false);
            return;
        }
        fetchSession();
    }, [adminCode]);

    // Auto-refresh every 10 seconds
    useEffect(() => {
        if (!session?.isActive) return;

        const interval = setInterval(() => {
            fetchSession(true);
        }, 10000);

        return () => clearInterval(interval);
    }, [session?.isActive]);

    const fetchSession = async (silent = false) => {
        if (!silent) setLoading(true);

        try {
            const data = await utils.api.get(`/sessions/admin/${adminCode}`);

            // Merge session data with positions and voters
            const mergedSession = {
                ...data.session,
                positions: data.positions || [],
                voters: data.invitedVoters || [],
                uniqueVoters: data.stats?.totalVotes || 0
            };

            setSession(mergedSession);
            setLastUpdated(new Date());
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to load session');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const copyToClipboard = async (text, type) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
        } catch (error) {
            alert('Failed to copy to clipboard');
        }
    };

    const toggleSessionStatus = async () => {
        if (!session) return;

        const action = session.isActive ? 'close' : 'reopen';
        if (!confirm(`Are you sure you want to ${action} this voting session?`)) return;

        setIsUpdatingStatus(true);
        try {
            await utils.api.post(`/sessions/${action}`, { adminCode });
            alert(`Session ${action}ed successfully`);
            await fetchSession();
        } catch (err) {
            alert(`Failed to ${action} session: ` + (err.message || 'Unknown error'));
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleDeleteSession = async () => {
        if (!session) return;

        const confirmMessage = `Are you sure you want to delete "${session.title}"?\n\nThis will permanently delete:\n- All positions and candidates\n- All votes\n- All invited voters\n\nThis action cannot be undone!`;

        if (!confirm(confirmMessage)) return;

        const finalConfirm = prompt('Type "DELETE" to confirm deletion:');
        if (finalConfirm !== 'DELETE') {
            alert('Session deletion cancelled');
            return;
        }

        try {
            await utils.api.delete(`/sessions/${session.id}`);
            alert('Session deleted successfully. Redirecting to home...');
            setTimeout(() => window.location.href = '/', 2000);
        } catch (err) {
            alert('Failed to delete session: ' + (err.message || 'Unknown error'));
        }
    };

    // Candidate functions
    const handleSaveCandidate = async (formData) => {
        try {
            if (editingCandidate) {
                // Update existing candidate - don't send positionId
                await utils.api.put('/candidates', {
                    id: editingCandidate.id,
                    name: formData.name,
                    description: formData.bio,
                    photoUrl: formData.imageUrl
                });
                alert('Candidate updated successfully');
            } else {
                // Add new candidate
                await utils.api.post('/candidates', {
                    name: formData.name,
                    description: formData.bio,
                    photoUrl: formData.imageUrl,
                    positionId: formData.positionId,
                    sessionId: session.id
                });
                alert('Candidate added successfully');
            }
            setCandidateModalOpen(false);
            setEditingCandidate(null);
            fetchSession();
        } catch (err) {
            alert('Failed to save candidate: ' + (err.message || 'Unknown error'));
        }
    };

    const handleDeleteCandidate = async (candidateId, candidateName, hasVotes) => {
        if (hasVotes) {
            alert('Cannot delete a candidate who has received votes');
            return;
        }

        if (!confirm(`Are you sure you want to delete "${candidateName}"?`)) return;

        try {
            await utils.api.delete(`/candidates/${candidateId}`);
            alert('Candidate deleted successfully');
            fetchSession();
        } catch (err) {
            alert('Failed to delete candidate: ' + (err.message || 'Unknown error'));
        }
    };

    // Voter functions
    const handleImportVoters = async (emails) => {
        if (!session) return;

        try {
            const result = await utils.api.post('/voters', {
                sessionId: session.id,
                emails
            });
            alert(result.message || 'Voters imported successfully');
            fetchSession();
        } catch (err) {
            alert('Failed to add voters: ' + (err.message || 'Unknown error'));
        }
    };

    const handleDeleteVoter = async (voterId, voterEmail, hasVoted) => {
        if (hasVoted) {
            alert('Cannot delete a voter who has already voted');
            return;
        }

        if (!confirm(`Remove "${voterEmail}" from the voter list?`)) return;

        try {
            await utils.api.delete(`/voters/${voterId}`);
            alert('Voter removed successfully');
            fetchSession();
        } catch (err) {
            alert('Failed to remove voter: ' + (err.message || 'Unknown error'));
        }
    };

    const handleSaveVoterEdit = async (newEmail) => {
        if (!editingVoter) return;

        if (editingVoter.hasVoted) {
            alert('Cannot edit email of a voter who has already voted');
            return;
        }

        const email = newEmail.trim().toLowerCase();
        if (!email || !email.includes('@')) {
            alert('Please enter a valid email address');
            return;
        }

        const emailExists = session?.voters?.some(
            v => v.email.toLowerCase() === email && v.id !== editingVoter.id
        );
        if (emailExists) {
            alert('This email is already in the voter list');
            return;
        }

        try {
            await utils.api.put('/voters', {
                id: editingVoter.id,
                email
            });
            alert('Voter email updated successfully');
            setEditingVoter(null);
            fetchSession();
        } catch (err) {
            alert('Failed to update voter: ' + (err.message || 'Unknown error'));
        }
    };

    const getVotingLink = () => {
        if (!session) return '';
        return `${window.location.origin}/vote.html?code=${session.votingCode}`;
    };

    const getAdminLink = () => {
        return `${window.location.origin}/admin.html?code=${adminCode}`;
    };

    // Filter voters based on search
    const filteredVoters = session?.voters?.filter(voter =>
        voter.email.toLowerCase().includes(voterSearch.toLowerCase())
    ) || [];

    // Calculate stats
    const totalVotes = session?.positions?.reduce((sum, pos) =>
        sum + pos.candidates.reduce((s, c) => s + (c.voteCount || 0), 0), 0
    ) || 0;

    const totalCandidates = session?.positions?.reduce((sum, pos) =>
        sum + pos.candidates.length, 0
    ) || 0;

    const votedCount = session?.voters?.filter(v => v.hasVoted).length || 0;
    const totalInvited = session?.voters?.length || 0;
    const uniqueVoters = session?.uniqueVoters || 0;

    if (loading) {
        return React.createElement('div', { className: 'min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100' },
            React.createElement('div', { className: 'text-center' },
                React.createElement(Components.Loading),
                React.createElement('p', { className: 'mt-4 text-gray-600' }, 'Loading session...')
            )
        );
    }

    if (error || !session) {
        return React.createElement('div', { className: 'min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100' },
            React.createElement(Components.Card, { className: 'max-w-md' },
                React.createElement('div', { className: 'p-6 text-center' },
                    React.createElement('h2', { className: 'text-xl font-semibold text-red-600 mb-2' }, 'Error'),
                    React.createElement('p', { className: 'text-gray-600 mb-4' }, error || 'Session not found'),
                    React.createElement('div', { className: 'flex gap-2' },
                        React.createElement(Components.Button, {
                            onClick: () => window.location.reload(),
                            className: 'flex-1'
                        }, 'Refresh'),
                        React.createElement(Components.Button, {
                            onClick: () => window.location.href = '/',
                            variant: 'outline',
                            className: 'flex-1'
                        }, 'Go Home')
                    )
                )
            )
        );
    }

    const votingLink = getVotingLink();
    const adminLink = getAdminLink();

    return React.createElement('div', { className: 'min-h-screen' },
        // Header with session title and controls
        React.createElement('header', { className: 'border-b' },
            React.createElement('div', { className: 'container py-4' },
                React.createElement('div', { className: 'flex items-center justify-between mb-3' },
                    React.createElement('div', {},
                        React.createElement(Components.Badge, { variant: 'secondary', className: 'mb-2' }, 'Admin Dashboard'),
                        React.createElement('h1', { className: 'text-2xl font-semibold' }, session.title)
                    ),
                    React.createElement(Components.Button, {
                        variant: session.isActive ? 'destructive' : 'default',
                        onClick: toggleSessionStatus,
                        disabled: isUpdatingStatus,
                        size: 'sm'
                    }, session.isActive ? 'Close Voting' : 'Reopen Voting')
                ),
                session.description && React.createElement('p', { className: 'text-sm text-muted-foreground' }, session.description)
            )
        ),

        // Main Content
        React.createElement('main', { className: 'container py-8' },
            React.createElement('div', { className: 'space-y-6' },

                // Stats Overview Section
                React.createElement('section', { className: 'card' },
                    React.createElement('div', { className: 'card-header' },
                        React.createElement('h2', { className: 'card-title' }, 'Overview')
                    ),
                    React.createElement('div', { className: 'card-content' },
                        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-4 gap-4' },
                            // Stat 1
                            React.createElement('div', { className: 'p-4 bg-gray-50 rounded-lg border' },
                                React.createElement('p', { className: 'text-sm text-gray-500 mb-1' },
                                    session.mode === 'official' ? 'Voter Turnout' : 'Participants'
                                ),
                                React.createElement('p', { className: 'text-2xl font-bold' },
                                    session.mode === 'official'
                                        ? (totalInvited > 0 ? Math.round((votedCount / totalInvited) * 100) + '%' : '0%')
                                        : uniqueVoters
                                )
                            ),
                            // Stat 2
                            React.createElement('div', { className: 'p-4 bg-gray-50 rounded-lg border' },
                                React.createElement('p', { className: 'text-sm text-gray-500 mb-1' }, 'Total Votes'),
                                React.createElement('p', { className: 'text-2xl font-bold' }, totalVotes)
                            ),
                            // Stat 3
                            React.createElement('div', { className: 'p-4 bg-gray-50 rounded-lg border' },
                                React.createElement('p', { className: 'text-sm text-gray-500 mb-1' }, 'Candidates'),
                                React.createElement('p', { className: 'text-2xl font-bold' }, totalCandidates)
                            ),
                            // Stat 4
                            React.createElement('div', { className: 'p-4 bg-gray-50 rounded-lg border' },
                                React.createElement('p', { className: 'text-sm text-gray-500 mb-1' }, 'Status'),
                                React.createElement('div', {},
                                    session.isActive
                                        ? React.createElement(Components.Badge, { variant: 'default' }, 'Active')
                                        : React.createElement(Components.Badge, { variant: 'secondary' }, 'Closed')
                                )
                            )
                        )
                    )
                ),

                // Tabs Navigation
                React.createElement('div', { className: 'flex border-b' },
                    React.createElement(Components.Button, {
                        variant: activeTab === 'settings' ? 'ghost' : 'ghost',
                        onClick: () => setActiveTab('settings'),
                        className: `border-b-2 rounded-none ${activeTab === 'settings' ? 'border-primary' : 'border-transparent'}`
                    }, 'Settings'),
                    React.createElement(Components.Button, {
                        variant: 'ghost',
                        onClick: () => setActiveTab('candidates'),
                        className: `border-b-2 rounded-none ${activeTab === 'candidates' ? 'border-primary' : 'border-transparent'}`
                    }, 'Candidates'),
                    React.createElement(Components.Button, {
                        variant: 'ghost',
                        onClick: () => setActiveTab('voters'),
                        className: `border-b-2 rounded-none ${activeTab === 'voters' ? 'border-primary' : 'border-transparent'}`
                    }, 'Voters'),
                    React.createElement(Components.Button, {
                        variant: 'ghost',
                        onClick: () => setActiveTab('results'),
                        className: `border-b-2 rounded-none ${activeTab === 'results' ? 'border-primary' : 'border-transparent'}`
                    }, 'Results')
                ),

                // Settings tab - Session configuration and access codes
                activeTab === 'settings' && React.createElement('div', { className: 'space-y-4' },

                    // Session Information
                    React.createElement(Components.Card, null,
                        React.createElement('div', { className: 'p-6' },
                            React.createElement('h2', { className: 'text-xl font-semibold mb-2' }, 'Session Information'),
                            React.createElement('p', { className: 'text-sm text-gray-600 mb-4' }, 'Overview of your voting session'),
                            React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
                                React.createElement('div', null,
                                    React.createElement(Components.Label, { className: 'text-sm text-gray-500' }, 'Voting Mode'),
                                    React.createElement('p', { className: 'text-lg font-medium mt-1 capitalize' }, session.mode)
                                ),
                                React.createElement('div', null,
                                    React.createElement(Components.Label, { className: 'text-sm text-gray-500' }, 'Results Display'),
                                    React.createElement('p', { className: 'text-lg font-medium mt-1' },
                                        session.resultDisplay === 'realtime' ? 'Real-time' : 'After Closes'
                                    )
                                ),
                                React.createElement('div', null,
                                    React.createElement(Components.Label, { className: 'text-sm text-gray-500' }, 'Status'),
                                    React.createElement('p', { className: 'text-lg font-medium mt-1' },
                                        session.isActive ? 'Active' : 'Closed'
                                    )
                                ),
                                React.createElement('div', null,
                                    React.createElement(Components.Label, { className: 'text-sm text-gray-500' }, 'Created'),
                                    React.createElement('p', { className: 'text-lg font-medium mt-1' },
                                        new Date(session.createdAt).toLocaleDateString()
                                    )
                                )
                            )
                        )
                    ),

                    // Access Codes
                    React.createElement(Components.Card, null,
                        React.createElement('div', { className: 'p-6' },
                            React.createElement('h2', { className: 'text-xl font-semibold mb-2' }, 'Access Code'),
                            React.createElement('p', { className: 'text-sm text-gray-600 mb-4' },
                                'Share this code with voters to access the session'
                            ),
                            React.createElement('div', { className: 'space-y-2' },
                                React.createElement(Components.Label, { className: 'text-sm font-medium' }, 'Public Code'),
                                React.createElement('div', { className: 'flex gap-2' },
                                    React.createElement(Components.Input, {
                                        value: session.votingCode,
                                        readOnly: true,
                                        className: 'font-mono text-lg font-bold'
                                    }),
                                    React.createElement(Components.Button, {
                                        variant: 'outline',
                                        onClick: () => copyToClipboard(session.votingCode, 'publicCode')
                                    }, copied === 'publicCode' ? 'Copied' : 'Copy')
                                )
                            )
                        )
                    ),

                    // Share Links
                    React.createElement(Components.Card, null,
                        React.createElement('div', { className: 'p-6' },
                            React.createElement('h2', { className: 'text-xl font-semibold mb-2' }, 'Share Links'),
                            React.createElement('p', { className: 'text-sm text-gray-600 mb-4' },
                                'Direct links to share with participants'
                            ),
                            React.createElement('div', { className: 'space-y-4' },
                                React.createElement('div', { className: 'space-y-2' },
                                    React.createElement(Components.Label, { className: 'text-sm font-medium' }, 'Voting Link'),
                                    React.createElement('div', { className: 'flex gap-2' },
                                        React.createElement(Components.Input, {
                                            value: votingLink,
                                            readOnly: true,
                                            className: 'font-mono text-sm'
                                        }),
                                        React.createElement(Components.Button, {
                                            variant: 'outline',
                                            onClick: () => copyToClipboard(votingLink, 'voting')
                                        }, copied === 'voting' ? 'Copied' : 'Copy')
                                    )
                                ),
                                React.createElement('div', { className: 'space-y-2' },
                                    React.createElement(Components.Label, { className: 'text-sm font-medium' }, 'Admin Link (Private)'),
                                    React.createElement('div', { className: 'flex gap-2' },
                                        React.createElement(Components.Input, {
                                            type: showAdminLink ? 'text' : 'password',
                                            value: adminLink,
                                            readOnly: true,
                                            className: 'font-mono text-sm'
                                        }),
                                        React.createElement(Components.Button, {
                                            variant: 'outline',
                                            onClick: () => setShowAdminLink(!showAdminLink)
                                        }, showAdminLink ? 'Hide' : 'Show'),
                                        React.createElement(Components.Button, {
                                            variant: 'outline',
                                            onClick: () => copyToClipboard(adminLink, 'admin')
                                        }, copied === 'admin' ? 'Copied' : 'Copy')
                                    )
                                )
                            )
                        )
                    ),

                    // Delete Session
                    React.createElement(Components.Card, null,
                        React.createElement('div', { className: 'p-6' },
                            React.createElement('h2', { className: 'text-xl font-semibold mb-2' }, 'Delete Session'),
                            React.createElement('p', { className: 'text-sm text-gray-600 mb-4' },
                                'Permanently delete this voting session'
                            ),
                            React.createElement(Components.Button, {
                                variant: 'destructive',
                                onClick: handleDeleteSession
                            }, 'Delete Session')
                        )
                    )
                ),

                // Candidates tab - Manage all candidates across positions
                activeTab === 'candidates' && React.createElement(Components.Card, null,
                    React.createElement('div', { className: 'p-6' },
                        React.createElement('div', { className: 'flex items-center justify-between mb-4' },
                            React.createElement('div', null,
                                React.createElement('h2', { className: 'text-xl font-semibold' }, 'Manage Candidates'),
                                React.createElement('p', { className: 'text-sm text-gray-600' },
                                    'Add, edit, or remove candidates for each position'
                                )
                            ),
                            React.createElement(Components.Button, {
                                onClick: () => {
                                    setEditingCandidate(null);
                                    setCandidateModalOpen(true);
                                }
                            }, 'Add Candidate')
                        ),
                        React.createElement('div', { className: 'space-y-6' },
                            session.positions?.map((position, posIndex) =>
                                React.createElement('div', { key: position.id, className: 'border rounded-lg p-4' },
                                    React.createElement('div', { className: 'mb-4' },
                                        React.createElement('h3', { className: 'text-lg font-semibold flex items-center gap-2' },
                                            `Position ${posIndex + 1}: ${position.title}`,
                                            position.maxSelections > 1 && React.createElement(Components.Badge, {
                                                variant: 'outline',
                                                className: 'text-xs'
                                            }, `${position.maxSelections} seats`)
                                        ),
                                        position.description && React.createElement('p', { className: 'text-sm text-gray-600 mt-1' }, position.description)
                                    ),
                                    React.createElement('div', { className: 'space-y-3' },
                                        position.candidates.length === 0
                                            ? React.createElement('p', { className: 'text-center text-gray-500 py-4' }, 'No candidates yet')
                                            : position.candidates.map(candidate =>
                                                React.createElement('div', {
                                                        key: candidate.id,
                                                        className: 'flex items-center gap-4 p-3 border rounded-lg bg-gray-50'
                                                    },
                                                    candidate.photoUrl && React.createElement('img', {
                                                        src: candidate.photoUrl,
                                                        alt: candidate.name,
                                                        className: 'w-12 h-12 rounded-full object-cover'
                                                    }),
                                                    React.createElement('div', { className: 'flex-1' },
                                                        React.createElement('h4', { className: 'font-semibold' }, candidate.name),
                                                        candidate.description && React.createElement('p', { className: 'text-sm text-gray-600' }, candidate.description),
                                                        React.createElement('p', { className: 'text-xs text-gray-500 mt-1' },
                                                            `${candidate.voteCount || 0} vote${(candidate.voteCount || 0) !== 1 ? 's' : ''}`
                                                        )
                                                    ),
                                                    React.createElement('div', { className: 'flex gap-2' },
                                                        React.createElement(Components.Button, {
                                                            size: 'sm',
                                                            variant: 'outline',
                                                            onClick: () => {
                                                                setEditingCandidate(candidate);
                                                                setCandidateModalOpen(true);
                                                            }
                                                        }, 'Edit'),
                                                        React.createElement(Components.Button, {
                                                            size: 'sm',
                                                            variant: 'outline',
                                                            onClick: () => handleDeleteCandidate(
                                                                candidate.id,
                                                                candidate.name,
                                                                (candidate.voteCount || 0) > 0
                                                            ),
                                                            disabled: (candidate.voteCount || 0) > 0
                                                        }, 'Delete')
                                                    )
                                                )
                                            )
                                    )
                                )
                            )
                        )
                    )
                ),

                // Voters tab - Manage invitations (official mode) or show stats
                activeTab === 'voters' && React.createElement(Components.Card, null,
                    React.createElement('div', { className: 'p-6' },
                        React.createElement('div', { className: 'flex items-center justify-between mb-4' },
                            React.createElement('div', null,
                                React.createElement('h2', { className: 'text-xl font-semibold' },
                                    session.mode === 'official' ? 'Invited Voters' : 'Voting Statistics'
                                ),
                                React.createElement('p', { className: 'text-sm text-gray-600' },
                                    session.mode === 'official'
                                        ? 'Manage voter invitations and track participation'
                                        : 'Overview of voting participation'
                                )
                            ),
                            session.mode === 'official' && React.createElement(Components.Button, {
                                onClick: () => setIsImportingVoters(true)
                            }, 'Add Voters')
                        ),

                        session.mode === 'official'
                            ? React.createElement('div', { className: 'space-y-4' },
                                // Search Bar
                                React.createElement('div', { className: 'relative' },
                                    React.createElement(Components.Input, {
                                        placeholder: 'Search voters by email...',
                                        value: voterSearch,
                                        onChange: (e) => setVoterSearch(e.target.value)
                                    })
                                ),

                                // Voter List
                                React.createElement('div', { className: 'space-y-2' },
                                    filteredVoters.length === 0
                                        ? React.createElement('p', { className: 'text-gray-500 text-center py-8' },
                                            voterSearch ? 'No voters found matching your search' : 'No voters have been invited yet'
                                        )
                                        : filteredVoters.map(voter =>
                                            React.createElement('div', {
                                                    key: voter.id,
                                                    className: 'flex items-center justify-between p-3 border rounded'
                                                },
                                                React.createElement('div', { className: 'flex items-center gap-3' },
                                                    React.createElement('span', { className: 'font-medium' }, voter.email)
                                                ),
                                                React.createElement('div', { className: 'flex items-center gap-2' },
                                                    voter.hasVoted
                                                        ? React.createElement(React.Fragment, null,
                                                            React.createElement(Components.Badge, {
                                                                variant: 'default',
                                                                className: 'bg-green-100 text-green-800'
                                                            }, 'Voted'),
                                                            voter.votedAt && React.createElement('span', { className: 'text-xs text-gray-500' },
                                                                (() => {
                                                                    const date = new Date(voter.votedAt);
                                                                    const day = String(date.getDate()).padStart(2, '0');
                                                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                                                    const year = date.getFullYear();
                                                                    const hours = String(date.getHours()).padStart(2, '0');
                                                                    const minutes = String(date.getMinutes()).padStart(2, '0');
                                                                    const seconds = String(date.getSeconds()).padStart(2, '0');
                                                                    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
                                                                })()
                                                            )
                                                        )
                                                        : React.createElement(React.Fragment, null,
                                                            React.createElement(Components.Badge, { variant: 'secondary' }, 'Pending'),
                                                            React.createElement(Components.Button, {
                                                                size: 'sm',
                                                                variant: 'ghost',
                                                                onClick: () => setEditingVoter(voter)
                                                            }, 'Edit'),
                                                            React.createElement(Components.Button, {
                                                                size: 'sm',
                                                                variant: 'ghost',
                                                                onClick: () => handleDeleteVoter(voter.id, voter.email, voter.hasVoted)
                                                            }, 'Delete')
                                                        )
                                                )
                                            )
                                        )
                                ),

                                // Results Summary
                                voterSearch && React.createElement('div', { className: 'text-sm text-gray-500 text-center' },
                                    `Showing ${filteredVoters.length} of ${session.voters?.length || 0} voters`
                                )
                            )
                            : React.createElement('div', { className: 'text-center py-8' },
                                React.createElement('h3', { className: 'text-lg font-medium text-gray-900 mb-2' }, 'Casual Voting Mode'),
                                React.createElement('p', { className: 'text-gray-600 mb-2' },
                                    'Anyone with the voting link can participate.'
                                ),
                                React.createElement('div', { className: 'flex justify-center gap-8 mt-4' },
                                    React.createElement('div', { className: 'text-center' },
                                        React.createElement('p', { className: 'text-2xl font-bold text-gray-900' }, uniqueVoters),
                                        React.createElement('p', { className: 'text-sm text-gray-500' }, 'Participants')
                                    ),
                                    React.createElement('div', { className: 'text-center' },
                                        React.createElement('p', { className: 'text-2xl font-bold text-gray-900' }, totalVotes),
                                        React.createElement('p', { className: 'text-sm text-gray-500' }, 'Total Votes')
                                    )
                                )
                            )
                    )
                ),

                // Results tab - Display voting results and rankings
                activeTab === 'results' && React.createElement(Components.Card, null,
                    React.createElement('div', { className: 'p-6' },
                        React.createElement('h2', { className: 'text-xl font-semibold mb-2' }, 'Election Results'),
                        React.createElement('p', { className: 'text-sm text-gray-600 mb-6' },
                            session.resultDisplay === 'realtime'
                                ? 'Real-time results are visible to voters'
                                : 'Results will be shown after voting closes'
                        ),
                        React.createElement('div', { className: 'space-y-6 mb-6' },
                            session.positions?.map((position, posIndex) =>
                                React.createElement('div', { key: position.id, className: 'border rounded-lg p-4' },
                                    React.createElement('div', { className: 'mb-4' },
                                        React.createElement('h3', { className: 'text-lg font-semibold flex items-center gap-2' },
                                            `Position ${posIndex + 1}: ${position.title}`,
                                            position.maxSelections > 1 && React.createElement(Components.Badge, {
                                                variant: 'outline',
                                                className: 'text-xs'
                                            }, `${position.maxSelections} seats`)
                                        ),
                                        position.description && React.createElement('p', { className: 'text-sm text-gray-600 mt-1' }, position.description)
                                    ),
                                    React.createElement('div', { className: 'space-y-3' },
                                        position.candidates
                                            .sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
                                            .map((candidate, idx) => {
                                                const totalVotes = position.candidates.reduce((sum, c) => sum + (c.voteCount || 0), 0);
                                                const percentage = totalVotes > 0 ? ((candidate.voteCount || 0) / totalVotes) * 100 : 0;

                                                // Calculate rank with ties
                                                const sortedCandidates = [...position.candidates].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
                                                let actualRank = 1;
                                                for (let i = 0; i < idx; i++) {
                                                    if ((sortedCandidates[i].voteCount || 0) > (candidate.voteCount || 0)) {
                                                        actualRank++;
                                                    }
                                                }
                                                const isTied = sortedCandidates.filter(c =>
                                                    (c.voteCount || 0) === (candidate.voteCount || 0) && (candidate.voteCount || 0) > 0
                                                ).length > 1;

                                                return React.createElement('div', {
                                                        key: candidate.id,
                                                        className: 'flex items-center gap-4 p-3 border rounded-lg bg-gray-50'
                                                    },
                                                    React.createElement('div', { className: 'text-xl font-bold text-gray-400 w-8' },
                                                        `#${actualRank}`
                                                    ),
                                                    candidate.photoUrl && React.createElement('img', {
                                                        src: candidate.photoUrl,
                                                        alt: candidate.name,
                                                        className: 'w-12 h-12 rounded-full object-cover'
                                                    }),
                                                    React.createElement('div', { className: 'flex-1' },
                                                        React.createElement('div', { className: 'flex items-center gap-2 mb-1 flex-wrap' },
                                                            React.createElement('h4', { className: 'font-semibold' }, candidate.name),
                                                            isTied && React.createElement(Components.Badge, {
                                                                variant: 'default',
                                                                className: 'bg-blue-100 text-blue-800 text-xs'
                                                            }, 'Tied')
                                                        ),
                                                        candidate.description && React.createElement('p', { className: 'text-sm text-gray-600 line-clamp-1' }, candidate.description),
                                                        React.createElement('div', { className: 'mt-2 results-progress' },
                                                            React.createElement('div', {
                                                                className: 'results-progress-fill',
                                                                style: { width: `${percentage}%` }
                                                            })
                                                        )
                                                    ),
                                                    React.createElement('div', { className: 'text-right' },
                                                        React.createElement('div', { className: 'text-2xl font-bold' }, candidate.voteCount || 0),
                                                        React.createElement('div', { className: 'text-sm text-gray-500' }, `${percentage.toFixed(1)}%`)
                                                    )
                                                );
                                            })
                                    )
                                )
                            )
                        ),
                        React.createElement(Components.Button, {
                            onClick: () => window.location.href = `/results.html?code=${session.votingCode}`,
                            className: 'w-full',
                            variant: 'outline'
                        }, 'View Full Results Page')
                    )
                )
            )
        ),

        // Modals
        React.createElement(EmailImportModal, {
            isOpen: isImportingVoters,
            onClose: () => setIsImportingVoters(false),
            onImport: handleImportVoters
        }),
        React.createElement(EditVoterModal, {
            voter: editingVoter,
            onClose: () => setEditingVoter(null),
            onSave: handleSaveVoterEdit
        }),
        React.createElement(CandidateModal, {
            isOpen: candidateModalOpen,
            onClose: () => {
                setCandidateModalOpen(false);
                setEditingCandidate(null);
            },
            candidate: editingCandidate,
            positions: session?.positions || [],
            onSave: handleSaveCandidate
        })
    );
}

// Mount React app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(AdminDashboardPage));
