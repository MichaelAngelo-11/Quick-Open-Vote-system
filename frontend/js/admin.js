const {useState, useEffect} = React;

const RE = React.createElement;

// Component for handling bulk email imports with preview and validation
function EmailImportModal({isOpen, onClose, onImport}) {
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

    return RE('div', {
            className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
            onClick: onClose
        },
        RE('div', {
                className: 'bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-lg modal-content',
                onClick: (e) => e.stopPropagation()
            },
            RE('h2', {className: 'text-2xl font-bold mb-2'}, 'Import Voter Emails'),
            RE('p', {className: 'text-gray-600 mb-4'},
                'Upload a CSV file or paste email addresses to invite voters.'
            ),

            // Toggle between paste and file upload modes
            RE('div', {className: 'flex gap-2 border-b mb-4'},
                RE(Components.Button, {
                    variant: activeSubTab === 'paste' ? 'default' : 'ghost',
                    onClick: () => setActiveSubTab('paste'),
                    className: 'flex-1'
                }, 'Paste Emails'),
                RE(Components.Button, {
                    variant: activeSubTab === 'upload' ? 'default' : 'ghost',
                    onClick: () => setActiveSubTab('upload'),
                    className: 'flex-1'
                }, 'Upload CSV')
            ),

            // Conditional rendering based on active tab
            activeSubTab === 'paste' && RE('div', {className: 'space-y-4 mb-4'},
                RE(Components.Label, null, 'Email Addresses'),
                RE('textarea', {
                    className: 'w-full p-3 border rounded-lg',
                    placeholder: 'Enter email addresses separated by commas, spaces, or new lines',
                    value: emails,
                    onChange: (e) => handleEmailInput(e.target.value),
                    rows: 6
                })
            ),

            activeSubTab === 'upload' && RE('div', {className: 'mb-4'},
                RE('div', {className: 'border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'},
                    RE('label', {
                            htmlFor: 'file-upload',
                            className: 'cursor-pointer'
                        },
                        RE('span', {className: 'text-sm font-medium text-gray-900 block mb-1'},
                            'Click to upload CSV file'
                        ),
                        RE('input', {
                            id: 'file-upload',
                            type: 'file',
                            className: 'hidden',
                            accept: '.csv,.txt',
                            onChange: handleFileUpload
                        }),
                        RE('p', {className: 'text-xs text-gray-500'},
                            'CSV with one email per line or comma-separated'
                        )
                    )
                )
            ),

            // Show list of emails to be imported
            previewEmails.length > 0 && RE('div', {className: 'space-y-2 mb-4'},
                RE(Components.Label, null, `Preview (${previewEmails.length} emails)`),
                RE('div', {className: 'max-h-32 overflow-y-auto border rounded-md p-2'},
                    RE('div', {className: 'flex flex-wrap gap-1'},
                        previewEmails.map((email, index) =>
                            RE(Components.Badge, {
                                key: index,
                                variant: 'secondary',
                                className: 'text-xs'
                            }, email)
                        )
                    )
                )
            ),

            // Modal footer with cancel and import buttons
            RE('div', {className: 'flex justify-end gap-2'},
                RE(Components.Button, {
                    variant: 'outline',
                    onClick: onClose
                }, 'Cancel'),
                RE(Components.Button, {
                    onClick: handleImport,
                    disabled: previewEmails.length === 0
                }, `Import ${previewEmails.length} Emails`)
            )
        )
    );
}

// Modal for editing individual voter email addresses
function EditVoterModal({voter, onClose, onSave}) {
    const [email, setEmail] = useState(voter?.email || '');

    // Update email when voter prop changes
    useEffect(() => {
        if (voter) {
            setEmail(voter.email || '');
        } else {
            setEmail('');
        }
    }, [voter]);

    if (!voter) return null;

    return RE('div', {
            className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
            onClick: onClose
        },
        RE('div', {
                className: 'bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg modal-content',
                onClick: (e) => e.stopPropagation()
            },
            RE('h2', {className: 'text-2xl font-bold mb-2 text-gray-900'}, 'Edit Voter Email'),
            RE('p', {className: 'text-gray-600 mb-4'},
                'Update the email address for this voter.'
            ),
            RE('div', {className: 'space-y-4 mb-6'},
                RE(Components.Label, null, 'Email Address'),
                RE(Components.Input, {
                    type: 'email',
                    value: email,
                    onChange: (e) => setEmail(e.target.value),
                    placeholder: 'Enter new email address'
                })
            ),
            RE('div', {className: 'flex gap-2'},
                RE(Components.Button, {
                    onClick: () => onSave(email),
                    className: 'flex-1'
                }, 'Save Changes'),
                RE(Components.Button, {
                    variant: 'outline',
                    onClick: onClose,
                    className: 'flex-1'
                }, 'Cancel')
            )
        )
    );
}

// Modal for adding or editing candidates within positions
function CandidateModal({isOpen, onClose, candidate, positions, onSave}) {
    const [formData, setFormData] = useState({
        name: candidate?.name || '',
        bio: candidate?.description || '',
        imageUrl: candidate?.photoUrl || '',
        positionId: candidate?.positionId || ''
    });

    const isEditing = !!candidate;

    // Update form data when candidate prop changes
    useEffect(() => {
        if (candidate) {
            setFormData({
                name: candidate.name || '',
                bio: candidate.description || '',
                imageUrl: candidate.photoUrl || '',
                positionId: candidate.positionId || ''
            });
        } else {
            setFormData({
                name: '',
                bio: '',
                imageUrl: '',
                positionId: ''
            });
        }
    }, [candidate, isOpen]);

    const handleSubmit = () => {
        if (!formData.name.trim() || (!isEditing && !formData.positionId)) {
            alert('Please provide candidate name' + (!isEditing ? ' and select a position' : ''));
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return RE('div', {
            className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
            onClick: onClose
        },
        RE('div', {
                className: 'bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg modal-content',
                onClick: (e) => e.stopPropagation()
            },
            RE('h2', {className: 'text-2xl font-bold mb-2 text-gray-900'},
                isEditing ? 'Edit Candidate' : 'Add New Candidate'
            ),
            RE('p', {className: 'text-gray-600 mb-4'}, 'Enter candidate details below'),

            RE('div', {className: 'space-y-4 mb-6'},
                !isEditing && RE('div', null,
                    RE(Components.Label, null, 'Position *'),
                    RE('select', {
                            className: 'w-full mt-1 p-2 border rounded-md',
                            value: formData.positionId,
                            onChange: (e) => setFormData({...formData, positionId: e.target.value})
                        },
                        RE('option', {value: ''}, 'Select a position'),
                        positions?.map(pos =>
                            RE('option', {key: pos.id, value: pos.id}, pos.title)
                        )
                    )
                ),
                RE('div', null,
                    RE(Components.Label, null, 'Name *'),
                    RE(Components.Input, {
                        value: formData.name,
                        onChange: (e) => setFormData({...formData, name: e.target.value}),
                        placeholder: 'Candidate name'
                    })
                ),
                RE('div', null,
                    RE(Components.Label, null, 'Bio'),
                    RE('textarea', {
                        className: 'w-full p-3 border rounded-lg',
                        value: formData.bio,
                        onChange: (e) => setFormData({...formData, bio: e.target.value}),
                        placeholder: 'Brief biography',
                        rows: 3
                    })
                ),
                RE('div', null,
                    RE(Components.Label, null, 'Image URL'),
                    RE(Components.Input, {
                        value: formData.imageUrl,
                        onChange: (e) => setFormData({...formData, imageUrl: e.target.value}),
                        placeholder: 'https://example.com/image.jpg'
                    })
                )
            ),

            RE('div', {className: 'flex gap-2'},
                RE(Components.Button, {
                    variant: 'outline',
                    onClick: onClose,
                    className: 'flex-1'
                }, 'Cancel'),
                RE(Components.Button, {
                    onClick: handleSubmit,
                    className: 'flex-1'
                }, isEditing ? 'Save Changes' : 'Add Candidate')
            )
        )
    );
}

// Main admin dashboard component - handles sessions, candidates, voters, and results
function AdminDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [session, setSession] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [activeTab, setActiveTab] = useState('settings');
    const [copied, setCopied] = useState(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [showAdminLink, setShowAdminLink] = useState(false);

    // State for candidate operations
    const [candidateModalOpen, setCandidateModalOpen] = useState(false);
    const [editingCandidate, setEditingCandidate] = useState(null);

    // State for voter management
    const [isImportingVoters, setIsImportingVoters] = useState(false);
    const [voterSearch, setVoterSearch] = useState('');
    const [editingVoter, setEditingVoter] = useState(null);

    // Extract admin code from URL parameters
    const params = utils.getUrlParams();
    const adminCode = params.code;

    // Load session data on component mount
    useEffect(() => {
        if (!adminCode) {
            setError('No admin code provided');
            setLoading(false);
            return;
        }
        fetchSession();
    }, [adminCode]);

    // Poll for updates every 10 seconds while voting is active
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

            // Combine all session-related data into single object
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
            await utils.api.post(`/sessions/${action}`, {adminCode});
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

    // Candidate CRUD operations
    const handleSaveCandidate = async (formData) => {
        try {
            if (editingCandidate) {
                // Updating - exclude positionId since it can't change
                await utils.api.put('/candidates', {
                    id: editingCandidate.id,
                    name: formData.name,
                    description: formData.bio,
                    photoUrl: formData.imageUrl
                });
                alert('Candidate updated successfully');
            } else {
                // Creating new candidate
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

    // Voter management operations
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

    // Filter voters by search term
    const filteredVoters = session?.voters?.filter(voter =>
        voter.email.toLowerCase().includes(voterSearch.toLowerCase())
    ) || [];

    // Aggregate voting statistics
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
        return RE('div', {className: 'min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100'},
            RE('div', {className: 'text-center'},
                RE(Components.Loading),
                RE('p', {className: 'mt-4 text-gray-600'}, 'Loading session...')
            )
        );
    }

    if (error || !session) {
        return RE('div', {className: 'min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100'},
            RE(Components.Card, {className: 'max-w-md'},
                RE('div', {className: 'p-6 text-center'},
                    RE('h2', {className: 'text-xl font-semibold text-red-600 mb-2'}, 'Error'),
                    RE('p', {className: 'text-gray-600 mb-4'}, error || 'Session not found'),
                    RE('div', {className: 'flex gap-2'},
                        RE(Components.Button, {
                            onClick: () => window.location.reload(),
                            className: 'flex-1'
                        }, 'Refresh'),
                        RE(Components.Button, {
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

    return RE('div', {className: 'min-h-screen'},
        // Page header with session title and status toggle
        RE('header', {className: 'border-b'},
            RE('div', {className: 'container py-4'},
                RE('div', {className: 'flex items-center justify-between mb-3'},
                    RE('div', {},
                        RE(Components.Badge, {variant: 'secondary', className: 'mb-2'}, 'Admin Dashboard'),
                        RE('h1', {className: 'text-2xl font-semibold'}, session.title)
                    ),
                    RE(Components.Button, {
                        variant: session.isActive ? 'destructive' : 'default',
                        onClick: toggleSessionStatus,
                        disabled: isUpdatingStatus,
                        size: 'sm'
                    }, session.isActive ? 'Close Voting' : 'Reopen Voting')
                ),
                session.description && RE('p', {className: 'text-sm text-muted-foreground'}, session.description)
            )
        ),

        // Main content area
        RE('main', {className: 'container py-8'},
            RE('div', {className: 'space-y-6'},

                // Quick stats dashboard
                RE('section', {className: 'card'},
                    RE('div', {className: 'card-header'},
                        RE('h2', {className: 'card-title'}, 'Overview')
                    ),
                    RE('div', {className: 'card-content'},
                        RE('div', {className: 'grid grid-cols-1 md:grid-cols-2'},
                            // Turnout percentage or participant count
                            RE('div', {className: 'p-4 bg-gray-50 rounded-lg border'},
                                RE('p', {className: 'text-sm text-gray-500 mb-1'},
                                    session.mode === 'official' ? 'Voter Turnout' : 'Participants'
                                ),
                                RE('p', {className: 'text-2xl font-bold'},
                                    session.mode === 'official'
                                        ? (totalInvited > 0 ? Math.round((votedCount / totalInvited) * 100) + '%' : '0%')
                                        : uniqueVoters
                                )
                            ),
                            // Total votes cast
                            RE('div', {className: 'p-4 bg-gray-50 rounded-lg border'},
                                RE('p', {className: 'text-sm text-gray-500 mb-1'}, 'Total Votes'),
                                RE('p', {className: 'text-2xl font-bold'}, totalVotes)
                            ),
                            // Number of candidates
                            RE('div', {className: 'p-4 bg-gray-50 rounded-lg border'},
                                RE('p', {className: 'text-sm text-gray-500 mb-1'}, 'Candidates'),
                                RE('p', {className: 'text-2xl font-bold'}, totalCandidates)
                            ),
                            // Current session status
                            RE('div', {className: 'p-4 bg-gray-50 rounded-lg border'},
                                RE('p', {className: 'text-sm text-gray-500 mb-1'}, 'Status'),
                                RE('div', {},
                                    session.isActive
                                        ? RE(Components.Badge, {variant: 'default'}, 'Active')
                                        : RE(Components.Badge, {variant: 'secondary'}, 'Closed')
                                )
                            )
                        )
                    )
                ),

                // Tab navigation
                RE('div', {className: 'flex flex-wrap gap-3 justify-center bg-white border rounded-lg py-2 shadow-sm'},
                    ['settings', 'candidates', 'voters', 'results'].map(key => RE(Components.Button, {
                        key,
                        variant: activeTab === key ? 'secondary' : 'ghost',
                        className: 'rounded-full px-5 py-2 text-base font-medium',
                        onClick: () => setActiveTab(key)
                    }, key.charAt(0).toUpperCase() + key.slice(1)))
                ),

                // Settings tab - configure session and manage links
                activeTab === 'settings' && RE('div', {className: 'space-y-4'},

                    // Basic session info
                    RE(Components.Card, null,
                        RE('div', {className: 'p-6'},
                            RE('h2', {className: 'text-xl font-semibold mb-2'}, 'Session Information'),
                            RE('div', {className: 'grid grid-cols-1 md:grid-cols-2 gap-6'},
                                RE('div', null,
                                    RE(Components.Label, {className: 'text-sm text-gray-500'}, 'Voting Mode'),
                                    RE('p', {className: 'text-lg font-medium mt-1 capitalize'}, session.mode)
                                ),
                                RE('div', null,
                                    RE(Components.Label, {className: 'text-sm text-gray-500'}, 'Results Display'),
                                    RE('p', {className: 'text-lg font-medium mt-1'},
                                        session.resultDisplay === 'realtime' ? 'Real-time' : 'After Closes'
                                    )
                                ),
                                RE('div', null,
                                    RE(Components.Label, {className: 'text-sm text-gray-500'}, 'Status'),
                                    RE('p', {className: 'text-lg font-medium mt-1'},
                                        session.isActive ? 'Active' : 'Closed'
                                    )
                                ),
                                RE('div', null,
                                    RE(Components.Label, {className: 'text-sm text-gray-500'}, 'Created'),
                                    RE('p', {className: 'text-lg font-medium mt-1'},
                                        new Date(session.createdAt).toLocaleDateString()
                                    )
                                )
                            )
                        )
                    ),

                    // Public access code
                    RE(Components.Card, null,
                        RE('div', {className: 'p-6'},
                            RE('h2', {className: 'text-xl font-semibold mb-2'}, 'Access Code'),
                            RE('p', {className: 'text-sm text-gray-600 mb-4'},
                                'Share this code with voters to access the session'
                            ),
                            RE('div', {className: 'space-y-2'},
                                RE(Components.Label, {className: 'text-sm font-medium'}, 'Public Code'),
                                RE('div', {className: 'flex gap-2'},
                                    RE(Components.Input, {
                                        value: session.votingCode,
                                        readOnly: true,
                                        className: 'font-mono text-lg font-bold'
                                    }),
                                    RE(Components.Button, {
                                        variant: 'outline',
                                        onClick: () => copyToClipboard(session.votingCode, 'publicCode')
                                    }, copied === 'publicCode' ? 'Copied' : 'Copy')
                                )
                            )
                        )
                    ),

                    // Shareable links section
                    RE(Components.Card, null,
                        RE('div', {className: 'p-6'},
                            RE('h2', {className: 'text-xl font-semibold mb-2'}, 'Share Links'),
                            RE('p', {className: 'text-sm text-gray-600 mb-4'},
                                'Direct links to share with participants'
                            ),
                            RE('div', {className: 'space-y-4'},
                                RE('div', {className: 'space-y-2'},
                                    RE(Components.Label, {className: 'text-sm font-medium'}, 'Voting Link'),
                                    RE('div', {className: 'flex gap-2'},
                                        RE(Components.Input, {
                                            value: votingLink,
                                            readOnly: true,
                                            className: 'font-mono text-sm'
                                        }),
                                        RE(Components.Button, {
                                            variant: 'outline',
                                            onClick: () => copyToClipboard(votingLink, 'voting')
                                        }, copied === 'voting' ? 'Copied' : 'Copy')
                                    )
                                ),
                                RE('div', {className: 'space-y-2'},
                                    RE(Components.Label, {className: 'text-sm font-medium'}, 'Admin Link (Private)'),
                                    RE('div', {className: 'flex gap-2'},
                                        RE(Components.Input, {
                                            type: showAdminLink ? 'text' : 'password',
                                            value: adminLink,
                                            readOnly: true,
                                            className: 'font-mono text-sm'
                                        }),
                                        RE(Components.Button, {
                                            variant: 'outline',
                                            onClick: () => setShowAdminLink(!showAdminLink)
                                        }, showAdminLink ? 'Hide' : 'Show'),
                                        RE(Components.Button, {
                                            variant: 'outline',
                                            onClick: () => copyToClipboard(adminLink, 'admin')
                                        }, copied === 'admin' ? 'Copied' : 'Copy')
                                    )
                                )
                            )
                        )
                    ),

                    // Danger zone - delete session
                    RE(Components.Card, null,
                        RE('div', {className: 'p-6'},
                            RE('h2', {className: 'text-xl font-semibold mb-2'}, 'Delete Session'),
                            RE('p', {className: 'text-sm text-gray-600 mb-4'},
                                'Permanently delete this voting session'
                            ),
                            RE(Components.Button, {
                                variant: 'destructive',
                                onClick: handleDeleteSession
                            }, 'Delete Session')
                        )
                    )
                ),

                // Candidates tab - add/edit/view candidates
                activeTab === 'candidates' && RE(Components.Card, null,
                    RE('div', {className: 'p-6 space-y-6'},
                        RE('div', {className: 'flex items-center justify-between mb-4'},
                            RE('div', null,
                                RE('h2', {className: 'text-xl font-semibold'}, 'Manage Candidates'),
                                RE('p', {className: 'text-sm text-gray-600'},
                                    'Add, edit, or remove candidates for each position'
                                )
                            ),
                            RE(Components.Button, {
                                onClick: () => {
                                    setEditingCandidate(null);
                                    setCandidateModalOpen(true);
                                }
                            }, '+ Add Candidate')
                        ),
                        session.positions?.map((position, posIndex) =>
                            RE(Components.Card, {key: position.id, className: 'space-y-3'},
                                RE(Components.CardHeader, null,
                                    RE('div', {className: 'flex flex-wrap items-start justify-between gap-3'},
                                        RE('div', null,
                                            RE('h3', {className: 'card-title flex items-center gap-2'},
                                                `Position ${posIndex + 1}: ${position.title}`,
                                                position.maxSelections > 1 && RE(Components.Badge, {
                                                    variant: 'outline',
                                                    className: 'text-xs'
                                                }, `${position.maxSelections} seats`)
                                            ),
                                            position.description && RE('p', {className: 'text-sm text-gray-600 mt-1 max-w-[60ch]'}, position.description)
                                        )
                                    )
                                ),
                                RE(Components.CardContent, {className: 'space-y-4'},
                                    (position.candidates || []).length === 0
                                        ? RE('p', {className: 'text-center text-gray-500 py-4'}, 'No candidates yet')
                                        : (position.candidates || []).map(candidate =>
                                            RE('div', {
                                                    key: candidate.id,
                                                    className: 'flex items-center justify-between gap-4 p-4 border rounded-lg bg-gray-50'
                                                },
                                                RE('div', {className: 'flex items-center gap-4 flex-1 min-w-0'},
                                                    candidate.photoUrl && RE('img', {
                                                        src: candidate.photoUrl,
                                                        alt: candidate.name,
                                                        className: 'candidate-photo'
                                                    }),
                                                    RE('div', {className: 'flex-1 min-w-0 flex flex-col gap-1.5'},
                                                        RE('h4', {className: 'font-semibold text-base text-gray-900'}, candidate.name),
                                                        candidate.description && RE('p', {className: 'text-xs text-gray-600 line-clamp-2'}, candidate.description),
                                                        RE('p', {className: 'text-xs text-gray-500'},
                                                            `${candidate.voteCount || 0} vote${(candidate.voteCount || 0) !== 1 ? 's' : ''}`
                                                        )
                                                    )
                                                ),
                                                RE('div', {className: 'flex gap-4 flex-shrink-0'},
                                                    RE(Components.Button, {
                                                        size: 'sm',
                                                        className: 'border border-black bg-white text-black hover:bg-gray-100',
                                                        onClick: () => {
                                                            setEditingCandidate(candidate);
                                                            setCandidateModalOpen(true);
                                                        }
                                                    }, 'Edit'),
                                                    RE(Components.Button, {
                                                        size: 'sm',
                                                        variant: 'destructive',
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
                ),

                // Voters tab - manage invitations or show stats
                activeTab === 'voters' && RE(Components.Card, null,
                    RE('div', {className: 'p-6'},
                        RE('div', {className: 'flex items-center justify-between mb-4'},
                            RE('div', null,
                                RE('h2', {className: 'text-xl font-semibold'},
                                    session.mode === 'official' ? 'Invited Voters' : 'Voting Statistics'
                                ),
                                RE('p', {className: 'text-sm text-gray-600'},
                                    session.mode === 'official'
                                        ? 'Manage voter invitations and track participation'
                                        : 'Overview of voting participation'
                                )
                            ),
                            session.mode === 'official' && RE(Components.Button, {
                                onClick: () => setIsImportingVoters(true)
                            }, '+ Add Voters')
                        ),

                        session.mode === 'official'
                            ? RE('div', {className: 'space-y-4'},
                                // Search field for filtering voters
                                RE('div', {className: 'relative'},
                                    RE(Components.Input, {
                                        placeholder: 'Search voters by email...',
                                        value: voterSearch,
                                        onChange: (e) => setVoterSearch(e.target.value)
                                    })
                                ),

                                // List of voters with participation status
                                RE('div', {className: 'space-y-3'},
                                    filteredVoters.length === 0
                                        ? RE('p', {className: 'text-center text-gray-500 py-8'},
                                            voterSearch ? 'No voters found matching your search' : 'No voters have been invited yet'
                                        )
                                        : filteredVoters.map(voter =>
                                            RE('div', {
                                                    key: voter.id,
                                                    className: 'flex items-center justify-between gap-4 p-4 border rounded-lg bg-gray-50'
                                                },
                                                RE('div', {className: 'flex-1 min-w-0 flex flex-col gap-1.5'},
                                                    RE('h4', {className: 'font-semibold text-base text-gray-900'}, voter.email),
                                                    RE('p', {className: 'text-xs text-gray-500'},
                                                        voter.hasVoted
                                                            ? (() => {
                                                                const date = new Date(voter.votedAt);
                                                                const day = String(date.getDate()).padStart(2, '0');
                                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                                const year = date.getFullYear();
                                                                const hours = String(date.getHours()).padStart(2, '0');
                                                                const minutes = String(date.getMinutes()).padStart(2, '0');
                                                                const seconds = String(date.getSeconds()).padStart(2, '0');
                                                                return `Voted: ${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
                                                            })()
                                                            : 'Pending'
                                                    )
                                                ),
                                                RE('div', {className: 'flex items-center gap-2 flex-shrink-0'},
                                                    voter.hasVoted
                                                        ? RE(Components.Badge, {
                                                            variant: 'default',
                                                            className: 'bg-green-100 text-green-800'
                                                        }, 'Voted')
                                                        : RE(React.Fragment, null,
                                                            RE(Components.Badge, {variant: 'secondary'}, 'Pending'),
                                                            RE(Components.Button, {
                                                                size: 'sm',
                                                                variant: 'outline',
                                                                onClick: () => setEditingVoter(voter)
                                                            }, 'Edit'),
                                                            RE(Components.Button, {
                                                                size: 'sm',
                                                                variant: 'destructive',
                                                                onClick: () => handleDeleteVoter(voter.id, voter.email, voter.hasVoted)
                                                            }, 'Delete')
                                                        )
                                                )
                                            )
                                        )
                                ),

                                // Show filtered count
                                voterSearch && RE('div', {className: 'text-sm text-gray-500 text-center'},
                                    `Showing ${filteredVoters.length} of ${session.voters?.length || 0} voters`
                                )
                            )
                            : RE('div', {className: 'text-center py-8'},
                                RE('h3', {className: 'text-lg font-medium text-gray-900 mb-2'}, 'Casual Voting Mode'),
                                RE('p', {className: 'text-gray-600 mb-2'},
                                    'Anyone with the voting link can participate.'
                                ),
                                RE('div', {className: 'flex justify-center gap-8 mt-4'},
                                    RE('div', {className: 'text-center'},
                                        RE('p', {className: 'text-2xl font-bold text-gray-900'}, uniqueVoters),
                                        RE('p', {className: 'text-sm text-gray-500'}, 'Participants')
                                    ),
                                    RE('div', {className: 'text-center'},
                                        RE('p', {className: 'text-2xl font-bold text-gray-900'}, totalVotes),
                                        RE('p', {className: 'text-sm text-gray-500'}, 'Total Votes')
                                    )
                                )
                            )
                    )
                ),

                // Results tab - display voting outcomes with rankings
                activeTab === 'results' && RE(Components.Card, null,
                    RE('div', {className: 'p-6'},
                        RE('h2', {className: 'text-xl font-semibold mb-2'}, 'Election Results'),
                        RE('p', {className: 'text-sm text-gray-600 mb-6'},
                            session.resultDisplay === 'realtime'
                                ? 'Real-time results are visible to voters'
                                : 'Results will be shown after voting closes'
                        ),
                        RE('div', {className: 'space-y-6 mb-6'},
                            session.positions?.map((position, posIndex) =>
                                RE('div', {key: position.id, className: 'border rounded-lg p-4'},
                                    RE('div', {className: 'mb-4'},
                                        RE('h3', {className: 'text-lg font-semibold flex items-center gap-2'},
                                            `Position ${posIndex + 1}: ${position.title}`,
                                            position.maxSelections > 1 && RE(Components.Badge, {
                                                variant: 'outline',
                                                className: 'text-xs'
                                            }, `${position.maxSelections} seats`)
                                        ),
                                        position.description && RE('p', {className: 'text-sm text-gray-600 mt-1'}, position.description)
                                    ),
                                    RE('div', {className: 'space-y-3'},
                                        position.candidates
                                            .sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
                                            .map((candidate, idx) => {
                                                const totalVotes = position.candidates.reduce((sum, c) => sum + (c.voteCount || 0), 0);
                                                const percentage = totalVotes > 0 ? ((candidate.voteCount || 0) / totalVotes) * 100 : 0;

                                                // Determine candidate rank, accounting for ties
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
                                                const isLeading = actualRank === 1 && (candidate.voteCount || 0) > 0 && !isTied;

                                                return RE('div', {
                                                        key: candidate.id,
                                                        className: 'flex items-center justify-between gap-4 p-4 border rounded-lg bg-gray-50'
                                                    },
                                                    RE('div', {className: 'flex-1 min-w-0 flex flex-col gap-3 w-full'},
                                                        RE('div', {className: 'flex items-start gap-4 w-full'},
                                                            candidate.photoUrl && RE('img', {
                                                                src: candidate.photoUrl,
                                                                alt: candidate.name,
                                                                className: 'candidate-photo'
                                                            }),
                                                            RE('div', {className: 'flex-1 min-w-0'},
                                                                RE('h4', {className: 'font-semibold text-base text-gray-900'}, candidate.name),
                                                                candidate.description && RE('p', {
                                                                    className: 'text-xs text-gray-600 line-clamp-2'
                                                                }, candidate.description)
                                                            )
                                                        ),
                                                        RE('div', {className: 'w-full space-y-1.5'},
                                                            RE('div', {className: 'flex items-center justify-between text-xs'},
                                                                RE('span', {className: 'font-medium text-gray-700'},
                                                                    `${candidate.voteCount || 0} vote${(candidate.voteCount || 0) !== 1 ? 's' : ''}`
                                                                ),
                                                                RE('span', {className: 'text-gray-500'},
                                                                    `${percentage.toFixed(1)}%`
                                                                )
                                                            ),
                                                            RE('div', {className: 'w-full bg-muted rounded-full h-1.5'},
                                                                RE('div', {
                                                                    className: `h-full rounded-full transition-all ${isLeading ? 'bg-primary' : 'bg-secondary'}`,
                                                                    style: {width: `${percentage}%`}
                                                                })
                                                            )
                                                        )
                                                    ),
                                                    RE('div', {className: 'flex items-center gap-3 flex-shrink-0'},
                                                        RE('div', {className: 'text-right'},
                                                            RE('div', {className: 'text-lg font-bold text-gray-900'}, `#${actualRank}`),
                                                            isTied && RE(Components.Badge, {
                                                                variant: 'default',
                                                                className: 'bg-blue-100 text-blue-800 text-xs'
                                                            }, 'Tied')
                                                        )
                                                    )
                                                );
                                            })
                                    )
                                )
                            )
                        ),
                        RE(Components.Button, {
                            onClick: () => window.location.href = `/results.html?code=${session.votingCode}`,
                            className: 'w-full',
                            variant: 'outline'
                        }, 'View Full Results Page')
                    )
                )
            )
        ),

        // Modal components for various operations
        RE(EmailImportModal, {
            isOpen: isImportingVoters,
            onClose: () => setIsImportingVoters(false),
            onImport: handleImportVoters
        }),
        RE(EditVoterModal, {
            voter: editingVoter,
            onClose: () => setEditingVoter(null),
            onSave: handleSaveVoterEdit
        }),
        RE(CandidateModal, {
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

// Render the React app to the DOM
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(RE(AdminDashboardPage));
