// shadcn/ui-inspired React components using React CDN

const { createElement: h } = React;

/**
 * Button Component
 * @param {object} props - Component properties
 * @param {ReactNode} props.children - Button text/content
 * @param {function} props.onClick - Click handler
 * @param {string} props.variant - Button style (primary, outline, ghost, destructive)
 * @param {string} props.size - Button size (sm, default, lg)
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {string} props.className - Additional CSS classes
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
 * Card Component - Container with styling
 */
function Card({ children, className = '' }) {
  return h('div', { className: `card ${className}` }, children);
}

/**
 * Card Header Component
 */
function CardHeader({ children, className = '' }) {
  return h('div', { className: `card-header ${className}` }, children);
}

/**
 * Card Title Component
 */
function CardTitle({ children, className = '' }) {
  return h('h2', { className: `card-title ${className}` }, children);
}

/**
 * Card Description Component
 */
function CardDescription({ children, className = '' }) {
  return h('p', { className: `card-description ${className}` }, children);
}

/**
 * Card Content Component
 */
function CardContent({ children, className = '' }) {
  return h('div', { className: `card-content ${className}` }, children);
}

/**
 * Input Component
 */
function Input({ 
  type = 'text', 
  placeholder = '', 
  value, 
  onChange, 
  disabled = false,
  className = '',
  id = ''
}) {
  return h('input', {
    type,
    placeholder,
    value,
    onChange,
    disabled,
    className: `input ${className}`,
    id,
  });
}

/**
 * Textarea Component
 */
function Textarea({ 
  placeholder = '', 
  value, 
  onChange, 
  rows = 4,
  disabled = false,
  className = '',
  id = ''
}) {
  return h('textarea', {
    placeholder,
    value,
    onChange,
    rows,
    disabled,
    className: `textarea ${className}`,
    id,
  });
}

/**
 * Label Component
 */
function Label({ children, htmlFor = '', className = '' }) {
  return h('label', {
    htmlFor,
    className: `label ${className}`,
  }, children);
}

/**
 * Badge Component
 */
function Badge({ children, variant = 'default', className = '' }) {
  return h('span', {
    className: `badge badge-${variant} ${className}`,
  }, children);
}

/**
 * Loading Spinner Component
 */
function Spinner() {
  return h('div', { className: 'spinner' });
}

/**
 * Loading Container Component
 */
function Loading({ message = 'Loading...' }) {
  return h('div', { className: 'loading-container' },
    h(Spinner),
    h('p', { className: 'mt-4' }, message)
  );
}

/**
 * Alert Component
 */
function Alert({ children, variant = 'info', className = '' }) {
  return h('div', {
    className: `alert alert-${variant} ${className}`,
  }, children);
}

/**
 * Dialog/Modal Component
 */
function Dialog({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children 
}) {
  if (!isOpen) return null;
  
  return h('div', { 
    className: 'dialog-overlay',
    onClick: (e) => {
      // Close on overlay click (not dialog content)
      if (e.target.className === 'dialog-overlay') {
        onClose();
      }
    }
  },
    h(Card, { className: 'dialog' },
      title && h('div', { className: 'dialog-header' },
        h('h2', { className: 'dialog-title' }, title),
        description && h('p', { className: 'dialog-description' }, description)
      ),
      children
    )
  );
}

/**
 * Form Group Component - Wraps label + input together
 */
function FormGroup({ label, children, htmlFor = '' }) {
  return h('div', { className: 'form-group' },
    label && h(Label, { htmlFor }, label),
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
  Dialog,
  FormGroup,
};
