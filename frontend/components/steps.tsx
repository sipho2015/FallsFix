export const steps = [
  {
    title: "Tell us what needs doing",
    description:
      "Describe the problem, your location, and a time that suits you.",
  },
  {
    title: "Agree on the right help",
    description:
      "Review technician availability, the call-out charge and the quoted scope before dispatch or work.",
  },
  {
    title: "Follow the job through",
    description:
      "Track progress, confirm the completed work, and keep your invoice in one place.",
  },
];

export function Steps() {
  return (
    <ol className="steps-grid">
      {steps.map((step, index) => (
        <li key={step.title}>
          <span className="step-number">0{index + 1}</span>
          <h3>{step.title}</h3>
          <p>{step.description}</p>
        </li>
      ))}
    </ol>
  );
}
