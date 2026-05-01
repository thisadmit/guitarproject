interface FeedbackPanelProps {
  status: "pending" | "correct" | "incorrect";
  title: string;
  message: string;
  details: readonly string[];
}

const STATUS_LABELS = {
  pending: "Waiting",
  correct: "Match",
  incorrect: "Needs work",
} as const;

export function FeedbackPanel({
  status,
  title,
  message,
  details,
}: FeedbackPanelProps) {
  return (
    <section className={`mode-card feedback-panel ${status}`}>
      <div className="section-heading">
        <h2>{title}</h2>
        <span>{STATUS_LABELS[status]}</span>
      </div>
      <p>{message}</p>
      <ul>
        {details.map((detail) => (
          <li key={detail}>{detail}</li>
        ))}
      </ul>
    </section>
  );
}
