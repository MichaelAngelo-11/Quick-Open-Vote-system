// shadcn/ui-inspired React components using React CDN

const {createElement: h} = React;

/**
 * Renders a customizable button with various styles and sizes
 * @param {object} props
 * @param {ReactNode} props.children - Button label
 * @param {function} props.onClick - Handler for click events
 * @param {string} props.variant - Style variant
 * @param {string} props.size - Size option
 * @param {boolean} props.disabled - Disable the button
 * @param {string} props.className - Extra CSS classes
 */
function Button({
                    children,
                    onClick,
                    variant = 'default',
                    size = 'default',
                    disabled = false,
                    className = '',
                    type = 'button'
                }) {
    const classes = `btn btn-${variant} ${size !== 'default' ? `btn-${size}` : ''} ${className}`;

    return h('button', {
        type,
        onClick,
        disabled,
        className: classes,
    }, children);
}

/**
 * Card - Basic container for grouping content
 */
function Card({children, className = ''}) {
    return h('div', {className: `card ${className}`}, children);
}

/**
 * Card Header - Top section of a card
 */
function CardHeader({children, className = ''}) {
    return h('div', {className: `card-header ${className}`}, children);
}

/**
 * Card Title - Main heading for card content
 */
function CardTitle({children, className = ''}) {
    return h('h2', {className: `card-title ${className}`}, children);
}

/**
 * Card Description - Subtitle or supplementary text
 */
function CardDescription({children, className = ''}) {
    return h('p', {className: `card-description ${className}`}, children);
}

/**
 * Card Content - Main body of the card
 */
function CardContent({children, className = ''}) {
    return h('div', {className: `card-content ${className}`}, children);
}

/**
 * Input - Text input field with basic validation
 */
function Input({
                   type = 'text',
                   placeholder = '',
                   value,
                   onChange,
                   disabled = false,
                   readOnly = false,
                   className = '',
                   id = ''
               }) {
    return h('input', {
        type,
        placeholder,
        value,
        onChange,
        disabled,
        readOnly,
        className: `input ${className}`,
        ...(id ? {id} : {}),
    });
}

/**
 * Textarea - Multi-line text input
 */
function Textarea({
                      placeholder = '',
                      value,
                      onChange,
                      rows = 4,
                      disabled = false,
                      readOnly = false,
                      className = '',
                      id = ''
                  }) {
    return h('textarea', {
        placeholder,
        value,
        onChange,
        rows,
        disabled,
        readOnly,
        className: `input ${className}`,
        ...(id ? {id} : {}),
    });
}

/**
 * Label - Form label for accessibility
 */
function Label({children, htmlFor = '', className = ''}) {
    return h('label', {
        ...(htmlFor ? {htmlFor} : {}),
        className: `label ${className}`,
    }, children);
}

/**
 * Badge - Small tag or status indicator
 */
function Badge({children, variant = 'default', className = ''}) {
    return h('span', {
        className: `badge badge-${variant} ${className}`,
    }, children);
}

/**
 * Spinner - Loading animation
 */
function Spinner() {
    return h('div', {className: 'spinner'});
}

/**
 * Loading - Displays spinner with optional message
 */
function Loading({message = 'Loading...'}) {
    return h('div', {className: 'loading-container'},
        h(Spinner),
        h('p', {className: 'mt-4'}, message)
    );
}

/**
 * Alert - Notification box with different severity levels
 */
function Alert({children, variant = 'info', className = ''}) {
    return h('div', {
        className: `alert alert-${variant} ${className}`,
    }, children);
}

/**
 * FormGroup - Pairs a label with an input field
 */
function FormGroup({label, children, htmlFor = ''}) {
    return h('div', {className: 'form-group'},
        label && h(Label, {htmlFor}, label),
        children
    );
}

// Export all components to window.Components
// This makes them available in other files
window.Components = {
    Button,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    Input,
    Textarea,
    Label,
    Badge,
    Spinner,
    Loading,
    Alert,
    FormGroup,
};
