/**
 * Simple toast replacement without Radix UI dependencies
 * Uses console.log and alert as fallback
 */

export interface Toast {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const toast = ({ title, description, variant }: Toast) => {
    // Simple console logging instead of toast UI
    const message = `${title}${description ? ': ' + description : ''}`;
    
    if (variant === 'destructive') {
      console.error('❌', message);
      // Optionally show browser alert for errors
      // alert(`Error: ${message}`);
    } else {
      console.log('✅', message);
    }
  };

  return { toast };
}

export { useToast as toast };