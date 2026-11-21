// Wires declarative triggers and close controls to native dialogs.
const dialogSelector = 'dialog:not(.alert-dialog):not(.sheet)';
const openers = new WeakMap();

document.addEventListener('click', (event) => {
  if (event.defaultPrevented || !(event.target instanceof Element)) return;
  const trigger = event.target.closest('[data-dialog-trigger]');
  if (trigger && !trigger.matches(':disabled, [aria-disabled="true"]')) {
    const dialog = document.getElementById(trigger.dataset.dialogTrigger);
    if (dialog instanceof HTMLDialogElement && !dialog.open) {
      dialog.showModal();
      openers.set(dialog, trigger);
    }
    return;
  }

  const dialog = event.target.closest(dialogSelector);
  if (!dialog?.open) return;
  if (event.target.closest('[data-dialog-close]')?.closest('dialog') === dialog) {
    dialog.close();
    return;
  }

  if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  }
});

document.addEventListener('close', (event) => {
  const dialog = event.target;
  if (!(dialog instanceof HTMLDialogElement) || !dialog.matches(dialogSelector)) return;
  const opener = openers.get(dialog);
  openers.delete(dialog);
  if (opener?.isConnected) opener.focus();
}, true);
