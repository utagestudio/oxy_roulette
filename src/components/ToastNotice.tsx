import '../styles/ToastNotice.css';

interface ToastNoticeProps {
  message: string;
}

export const ToastNotice = ({ message }: ToastNoticeProps) => (
  <div className="toast-notice" role="status" aria-live="polite">
    {message}
  </div>
);
