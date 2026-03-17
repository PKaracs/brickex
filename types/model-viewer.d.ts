declare namespace JSX {
  interface IntrinsicElements {
    "model-viewer": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      src?: string;
      alt?: string;
      poster?: string;
      "camera-controls"?: boolean;
      "auto-rotate"?: boolean;
      "auto-rotate-delay"?: string;
      "shadow-intensity"?: string;
      exposure?: string;
      "environment-image"?: string;
      "interaction-prompt"?: string;
      "touch-action"?: string;
    };
  }
}
