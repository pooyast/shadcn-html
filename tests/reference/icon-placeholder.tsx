import { CheckIcon, ChevronDownIcon, XIcon } from 'lucide-react';

const icons = { CheckIcon, ChevronDownIcon, XIcon };

export function IconPlaceholder({ lucide, className }: {
  lucide: keyof typeof icons;
  className?: string;
}) {
  const Icon = icons[lucide];
  return <Icon aria-hidden="true" className={className} />;
}
