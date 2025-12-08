interface Props {
  href: string;
  label?: string;
  scrollTo?: boolean;
}

export function Anchor({ href, label, scrollTo }: Props) {
  let onClick = `select('${href}')`;
  if (scrollTo) {
    onClick = `${onClick} && scrollToActive()`;
  }

  return (
    <a
      href={`/${href}`}
      hx-get={`/swap/${href}`}
      hx-target="#main"
      hx-push-url={`/${href}`}
      hx-swap="show:top"
      hx-on:click={onClick}
    >
      {label ?? href}
    </a>
  );
}
