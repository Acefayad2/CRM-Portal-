export const Logo = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 140 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M4 8h8v8H4V8zm0 12h8v8H4v-8zm12-12h8v8h-8V8zm0 12h8v8h-8v-8zm12-12h8v8h-8V8z" fill="white" />
      <text x="40" y="26" fill="white" fontFamily="system-ui, sans-serif" fontSize="16" fontWeight="600" letterSpacing="0.5">
        PANTHEON
      </text>
    </svg>
  );
};
