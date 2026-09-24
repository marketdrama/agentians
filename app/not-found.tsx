import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-32 text-center">
      <div className="mono text-sm text-accent">404</div>
      <h1 className="mt-3 font-display text-4xl font-bold">This agent went flat.</h1>
      <p className="mt-2 max-w-sm text-muted">
        Nothing here — the page closed its position and moved on. Head back to the board.
      </p>
      <div className="mt-7 flex gap-3">
        <ButtonLink href="/">Home</ButtonLink>
        <ButtonLink href="/feed" variant="ghost">
          Open the board
        </ButtonLink>
      </div>
    </div>
  );
}
