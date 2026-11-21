import { createRoot } from 'react-dom/client';
import { Button } from './upstream/button';
import { Input } from './upstream/input';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './upstream/dialog';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from './upstream/combobox';
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from './upstream/popover';
import './official.css';

const sizes = ['xs', 'sm', 'default', 'lg', 'icon-xs', 'icon-sm', 'icon', 'icon-lg'] as const;
const items = ['React', 'SvelteKit', 'Vue'];
if (new URLSearchParams(location.search).get('theme') === 'dark') document.documentElement.classList.add('dark');

createRoot(document.getElementById('root')!).render(
  <main className="fixture">
    <section aria-label="Button examples">
      <Button>Continue</Button> <Button variant="outline">Cancel</Button> <Button variant="destructive">Delete</Button>
      <div className="fixture-sizes">
        {sizes.map(size => <Button key={size} size={size} aria-label={`Sample ${size}`}>{size.startsWith('icon') ? '+' : 'Sample'}</Button>)}
        <Button disabled>Unavailable</Button>
        <Button aria-invalid="true">Invalid</Button>
      </div>
    </section>
    <form aria-label="Contact">
      <label htmlFor="email">Email</label>
      <Input id="email" name="email" type="email" required placeholder="you@example.com" />
    </form>
    <section aria-label="Dialog example">
      <Dialog>
        <DialogTrigger render={<Button variant="outline" />}>Open dialog</DialogTrigger>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Change your display name.</DialogDescription>
          </DialogHeader>
          <Input aria-label="Display name" defaultValue="Sam" />
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
            <DialogClose render={<Button />}>Save</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
    <section aria-label="Popover example">
      <Popover>
        <PopoverTrigger render={<Button variant="outline" />}>Open popover</PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Dimensions</PopoverTitle>
            <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
          </PopoverHeader>
          <Input aria-label="Width" defaultValue="100%" />
        </PopoverContent>
      </Popover>
    </section>
    <section aria-label="Combobox example">
      <Combobox items={items}>
        <ComboboxInput aria-label="Framework" placeholder="Select a framework" />
        <ComboboxContent>
          <ComboboxEmpty>No results found.</ComboboxEmpty>
          <ComboboxList>{(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}</ComboboxList>
        </ComboboxContent>
      </Combobox>
    </section>
  </main>,
);
